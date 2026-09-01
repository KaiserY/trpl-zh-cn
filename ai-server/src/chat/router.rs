use sqlx::PgPool;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use tracing::{info, warn};
use serde_json::json;

use crate::config::Config;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum RetrievalPlan {
    NoBook,
    CurrentPage,
    SearchKnownChapter { node_ids: Vec<Uuid> },
    SearchTableOfContents { query: String },
}

#[derive(Debug, Deserialize)]
struct RouterLLMResponse {
    needs_book: bool,
    needs_toc: bool,
    query: Option<String>,
    #[allow(dead_code)]
    reason: Option<String>,
}

pub async fn route_query(
    pool: &PgPool,
    config: &Config,
    client: &reqwest::Client,
    query: &str,
    mode: Option<&str>,
    has_page_context: bool,
) -> RetrievalPlan {
    // 1. Check mode override
    if let Some("rust") = mode {
        return RetrievalPlan::NoBook;
    }
    if let Some("page") = mode {
        if has_page_context {
            return RetrievalPlan::CurrentPage;
        }
    }

    // 2. Heuristics/Rules check
    let lower_query = query.to_lowercase();
    if lower_query.contains("总结本页") || lower_query.contains("解释本页") || lower_query.contains("本页代码") {
        if has_page_context {
            return RetrievalPlan::CurrentPage;
        }
    }

    // Quick direct keyword check for chapter titles (e.g. "所有权", "并发")
    // If a node matches the title exactly, we target it directly.
    if let Ok(Some((id,))) = sqlx::query_as::<_, (Uuid,)>(
        "SELECT id FROM book_nodes WHERE title = $1 AND node_type != 'part' LIMIT 1"
    )
    .bind(query.trim())
    .fetch_optional(pool)
    .await {
        return RetrievalPlan::SearchKnownChapter { node_ids: vec![id] };
    }

    // 3. Fallback to LLM Routing Decision
    match call_routing_llm(client, config, query).await {
        Ok(decision) => {
            info!("LLM router decision: {:?}", decision);
            if !decision.needs_book {
                RetrievalPlan::NoBook
            } else if decision.needs_toc {
                let search_query = decision.query.unwrap_or_else(|| query.to_string());
                RetrievalPlan::SearchTableOfContents { query: search_query }
            } else if has_page_context {
                RetrievalPlan::CurrentPage
            } else {
                RetrievalPlan::SearchTableOfContents { query: query.to_string() }
            }
        }
        Err(e) => {
            warn!("LLM routing failed ({}). Falling back to low-cost TOC search.", e);
            RetrievalPlan::SearchTableOfContents { query: query.to_string() }
        }
    }
}

async fn call_routing_llm(
    client: &reqwest::Client,
    config: &Config,
    query: &str,
) -> Result<RouterLLMResponse, Box<dyn std::error::Error>> {
    let url = format!("{}/chat/completions", config.base_url);
    
    let system_prompt = r#"你是一个问题路由网关。分析用户对《Rust 程序设计语言》学习助手提出的问题。
你必须返回如下格式的 JSON 对象，不要包含任何 markdown 代码块标记，不要返回其他任何内容。

JSON 结构：
{
  "needs_book": true/false, // 用户的问题是否是在询问《Rust 程序设计语言》教材中的特定内容、概念或位置
  "needs_toc": true/false,  // 用户是否是在询问特定章节，或者跨章节内容（如"Send和Sync在哪里讲的"、"所有权这一章讲了什么"）
  "query": "从问题中提取的用于检索教材目录的核心中文关键词（如 'Send Sync' 或 '所有权'）",
  "reason": "简短分析原因"
}

例如：
用户问：“书中哪里讲了 Send 和 Sync？” -> {"needs_book": true, "needs_toc": true, "query": "Send Sync", "reason": "询问特定概念在书中的位置"}
用户问：“帮我写一个 Axum 中间件” -> {"needs_book": false, "needs_toc": false, "query": null, "reason": "通用的 Rust 编码问题，无需查询教材"}
"#;

    let res = client
        .post(&url)
        .bearer_auth(&config.api_key)
        .json(&json!({
            "model": config.model,
            "messages": [
                { "role": "system", "content": system_prompt },
                { "role": "user", "content": query }
            ],
            "response_format": { "type": "json_object" }
        }))
        .send()
        .await?;

    if !res.status().is_success() {
        return Err(format!("LLM Router returned status {}", res.status()).into());
    }

    #[derive(Deserialize)]
    struct Delta {
        content: String,
    }
    #[derive(Deserialize)]
    struct Choice {
        message: Delta,
    }
    #[derive(Deserialize)]
    struct LLMResponse {
        choices: Vec<Choice>,
    }

    let response: LLMResponse = res.json().await?;
    let content = response.choices.first()
        .map(|c| c.message.content.trim())
        .ok_or("Empty response from LLM router")?;

    // Attempt to strip potential markdown code block format (e.g. ```json ... ```)
    let json_str = if content.starts_with("```json") {
        content.trim_start_matches("```json").trim_end_matches("```").trim()
    } else if content.starts_with("```") {
        content.trim_start_matches("```").trim_end_matches("```").trim()
    } else {
        content
    };

    let decision: RouterLLMResponse = serde_json::from_str(json_str)?;
    Ok(decision)
}

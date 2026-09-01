use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Sse},
    routing::post,
};
use sqlx::PgPool;
use uuid::Uuid;
use serde::Deserialize;
use serde_json::json;
use tracing::{info, error};
use chrono::Utc;
use std::convert::Infallible;
use futures_util::StreamExt;

use crate::config::Config;
use crate::models::conversation::{Conversation, Message};
use crate::book::search::{search_toc_nodes, search_chunks};
use crate::chat::router::{route_query, RetrievalPlan};
use crate::chat::context::build_rag_context;
use crate::chat::provider::{stream_chat_response, ReceiverStream};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SendMessageRequest {
    content: String,
    mode: Option<String>,
    page: Option<PageContextRequest>,
}

#[derive(Debug, Deserialize)]
struct PageContextRequest {
    title: String,
    url: String,
    content: String,
}

#[derive(Clone)]
pub struct ApiState {
    pub pool: PgPool,
    pub config: Config,
    pub client: reqwest::Client,
}

pub fn router(state: ApiState) -> Router {
    Router::new()
        .route("/api/conversations/{id}/messages", post(send_message))
        .with_state(state)
}

async fn send_message(
    State(state): State<ApiState>,
    Path(conversation_id): Path<Uuid>,
    Json(payload): Json<SendMessageRequest>,
) -> impl IntoResponse {
    // 1. Verify conversation exists
    let _conv = match Conversation::find_by_id(&state.pool, conversation_id).await {
        Ok(Some(c)) => c,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(json!({ "error": "Conversation not found" }))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    };

    let user_content = payload.content.trim();
    if user_content.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({ "error": "Message content cannot be empty" }))).into_response();
    }

    // 2. Insert user message in DB
    let user_msg_id = Uuid::new_v4();
    let user_seq_no = match Message::get_next_sequence_no(&state.pool, conversation_id).await {
        Ok(seq) => seq,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    };

    let user_msg = Message {
        id: user_msg_id,
        conversation_id,
        sequence_no: user_seq_no,
        role: "user".to_string(),
        content: user_content.to_string(),
        status: "completed".to_string(),
        model: None,
        prompt_tokens: None,
        completion_tokens: None,
        metadata: json!({}),
        created_at: Utc::now(),
    };

    if let Err(e) = Message::insert(&state.pool, &user_msg).await {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response();
    }

    // 3. Prepare assistant streaming message in DB
    let assistant_msg_id = Uuid::new_v4();
    let assistant_seq_no = user_seq_no + 1;
    let mut assistant_msg = Message {
        id: assistant_msg_id,
        conversation_id,
        sequence_no: assistant_seq_no,
        role: "assistant".to_string(),
        content: "".to_string(),
        status: "streaming".to_string(),
        model: Some(state.config.model.clone()),
        prompt_tokens: None,
        completion_tokens: None,
        metadata: json!({}),
        created_at: Utc::now(),
    };

    if let Err(e) = Message::insert(&state.pool, &assistant_msg).await {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response();
    }

    // 4. Retrieve conversation history from database
    let history = match Message::list_for_conversation(&state.pool, conversation_id).await {
        Ok(list) => list,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    };

    // 5. Determine query plan & fetch context (RAG)
    let has_page_context = payload.page.is_some();
    let plan = route_query(
        &state.pool,
        &state.config,
        &state.client,
        user_content,
        payload.mode.as_deref(),
        has_page_context,
    )
    .await;

    let mut retrieved_chunks = Vec::new();
    let mut toc_used = false;

    match &plan {
        RetrievalPlan::NoBook => {
            info!("Route decision: NoBook");
        }
        RetrievalPlan::CurrentPage => {
            info!("Route decision: CurrentPage");
            // Handled directly via system page prompt
        }
        RetrievalPlan::SearchKnownChapter { node_ids } => {
            info!("Route decision: SearchKnownChapter targeting node IDs: {:?}", node_ids);
            // Search inside specific chapter chunks
            let query_emb = fetch_query_embedding(&state.client, &state.config, user_content).await;
            match search_chunks(&state.pool, user_content, &node_ids, query_emb.as_deref(), 5).await {
                Ok(chunks) => retrieved_chunks = chunks,
                Err(e) => error!("Failed searching chapter chunks: {}", e),
            }
        }
        RetrievalPlan::SearchTableOfContents { query } => {
            info!("Route decision: SearchTableOfContents query: {}", query);
            toc_used = true;
            // Step 1: Search TOC nodes
            match search_toc_nodes(&state.pool, &query, 3).await {
                Ok(nodes) => {
                    let node_ids: Vec<Uuid> = nodes.iter().map(|n| n.id).collect();
                    if !node_ids.is_empty() {
                        // Step 2: Fetch embedding for text query
                        let query_emb = fetch_query_embedding(&state.client, &state.config, &query).await;
                        // Step 3: Hybrid search chunks in those chapters
                        match search_chunks(&state.pool, &query, &node_ids, query_emb.as_deref(), 5).await {
                            Ok(chunks) => retrieved_chunks = chunks,
                            Err(e) => error!("Failed searching chunks in candidate chapters: {}", e),
                        }
                    }
                }
                Err(e) => error!("Failed searching TOC nodes: {}", e),
            }
        }
    }

    let chapters: Vec<serde_json::Value> = retrieved_chunks
        .iter()
        .map(|c| json!({ "title": c.node_title, "path": c.node_path.as_deref().unwrap_or("") }))
        .collect();

    // Update assistant metadata in DB with retrieval details
    let selected_nodes: Vec<Uuid> = retrieved_chunks.iter().map(|c| c.book_node_id).collect();
    let chunk_ids: Vec<Uuid> = retrieved_chunks.iter().map(|c| c.id).collect();
    
    let retrieval_meta = json!({
        "page": payload.page.as_ref().map(|p| p.url.clone()),
        "mode": payload.mode.as_deref().unwrap_or("book"),
        "retrieval": {
            "toc_used": toc_used,
            "selected_nodes": selected_nodes,
            "chunk_ids": chunk_ids,
            "chapters": chapters.clone(),
        }
    });
    
    assistant_msg.metadata = retrieval_meta;
    sqlx::query("UPDATE messages SET metadata = $1 WHERE id = $2")
        .bind(&assistant_msg.metadata)
        .bind(assistant_msg_id)
        .execute(&state.pool)
        .await
        .ok();

    // 6. Build prompt message array
    let mut llm_messages = Vec::new();
    
    // System Prompt
    llm_messages.push(json!({
        "role": "system",
        "content": system_prompt(payload.mode.as_deref())
    }));

    // Add page context system prompt if CurrentPage requested
    if plan == RetrievalPlan::CurrentPage {
        if let Some(page) = &payload.page {
            llm_messages.push(json!({
                "role": "system",
                "content": format!(
                    "当前教材页面\n标题：{}\n地址：{}\n\n正文：\n{}",
                    page.title, page.url, page.content
                )
            }));
        }
    }

    // Add RAG context if chunks retrieved
    if !retrieved_chunks.is_empty() {
        llm_messages.push(json!({
            "role": "system",
            "content": build_rag_context(&retrieved_chunks)
        }));
    }

    // Add conversation message history (limit to last 15 messages to preserve context window)
    let history_len = history.len();
    let history_start = if history_len > 15 { history_len - 15 } else { 0 };
    
    for prev_msg in &history[history_start..history_len] {
        if prev_msg.id == user_msg_id || prev_msg.id == assistant_msg_id {
            continue; // skip the current user/assistant messages, we'll append them below
        }
        if prev_msg.status != "completed" {
            continue;
        }
        llm_messages.push(json!({
            "role": prev_msg.role,
            "content": prev_msg.content
        }));
    }

    // Finally append the current user message
    llm_messages.push(json!({
        "role": "user",
        "content": user_content
    }));

    // 7. Initialize response stream (call before spawn to handle connection errors and ensure Send safety)
    let stream = match stream_chat_response(
        state.pool.clone(),
        state.config.clone(),
        state.client.clone(),
        llm_messages,
        assistant_msg_id,
    )
    .await {
        Ok(s) => s,
        Err(e) => {
            error!("Error getting response stream from provider: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": format!("生成失败：{}", e) }))).into_response();
        }
    };

    // 8. Initialize SSE streaming channel
    let (tx, rx) = tokio::sync::mpsc::channel::<Result<axum::response::sse::Event, Infallible>>(100);

    let retrieval_event = axum::response::sse::Event::default()
        .event("retrieval")
        .data(json!({ "tocUsed": toc_used, "chapters": chapters }).to_string());

    let tx_clone = tx.clone();
    
    // Spawn task to forward stream events
    tokio::spawn(async move {
        // Send initial retrieval event
        tx_clone.send(Ok(retrieval_event)).await.ok();

        let mut inner_stream = Box::pin(stream);
        while let Some(ev) = inner_stream.next().await {
            if tx_clone.send(ev).await.is_err() {
                break;
            }
        }
    });

    Sse::new(ReceiverStream::new(rx)).into_response()
}

async fn fetch_query_embedding(
    client: &reqwest::Client,
    config: &Config,
    text: &str,
) -> Option<Vec<f32>> {
    if config.embedding_api_key.trim().is_empty() {
        return None;
    }

    let url = format!("{}/embeddings", config.embedding_base_url);
    let res = client
        .post(&url)
        .bearer_auth(&config.embedding_api_key)
        .json(&json!({
            "input": text,
            "model": config.embedding_model
        }))
        .send()
        .await
        .ok()?;

    if !res.status().is_success() {
        return None;
    }

    #[derive(serde::Deserialize)]
    struct EmbeddingData {
        embedding: Vec<f32>,
    }
    #[derive(serde::Deserialize)]
    struct EmbeddingResponse {
        data: Vec<EmbeddingData>,
    }

    let body: EmbeddingResponse = res.json().await.ok()?;
    body.data.first().map(|d| d.embedding.clone())
}

fn system_prompt(mode: Option<&str>) -> String {
    let scope = match mode {
        Some("rust") => "可以使用通用 Rust 知识回答；涉及版本差异时明确说明。",
        Some("book") => "优先依据教材上下文回答；缺少资料时说明这是补充知识。",
        _ => "严格优先依据当前页面回答；页面没有答案时再补充 Rust 知识并明确标注。",
    };

    format!(
        "你是 Ferris，《Rust 程序设计语言》简体中文版的 AI 学习助手。\
         使用简体中文，回答准确、直接、适合学习。\
         Rust 代码应放入带 rust 标记的 Markdown 代码块。\
         不要声称执行过未实际执行的代码。{scope}"
    )
}

use std::{env, net::SocketAddr};

use axum::{
    Json, Router,
    body::Body,
    extract::State,
    http::{HeaderValue, Method, StatusCode, header},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

const MAX_PAGE_CHARS: usize = 20_000;
const MAX_MESSAGES: usize = 30;

#[derive(Clone)]
struct AppState {
    client: Client,
    api_key: String,
    base_url: String,
    model: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChatRequest {
    messages: Vec<ChatMessage>,
    page: Option<PageContext>,
    mode: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct PageContext {
    title: String,
    url: String,
    content: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    model: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "rust_book_ai_server=info,tower_http=info".into()),
        )
        .init();

    let api_key = env::var("DEEPSEEK_API_KEY")
        .expect("DEEPSEEK_API_KEY must be set in the project root .env file");
    if api_key.trim().is_empty() {
        panic!("DEEPSEEK_API_KEY is empty in the project root .env file");
    }

    let state = AppState {
        client: Client::new(),
        api_key,
        base_url: env::var("DEEPSEEK_BASE_URL")
            .unwrap_or_else(|_| "https://api.deepseek.com".to_owned())
            .trim_end_matches('/')
            .to_owned(),
        model: env::var("DEEPSEEK_MODEL").unwrap_or_else(|_| "deepseek-chat".to_owned()),
    };

    let allowed_origin = env::var("AI_ALLOWED_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:3000".to_owned())
        .parse::<HeaderValue>()
        .expect("AI_ALLOWED_ORIGIN must be a valid HTTP header value");

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/chat", post(chat))
        .with_state(state)
        .layer(
            CorsLayer::new()
                .allow_origin(allowed_origin)
                .allow_methods([Method::GET, Method::POST])
                .allow_headers([header::CONTENT_TYPE]),
        )
        .layer(TraceLayer::new_for_http());

    let address = SocketAddr::from(([127, 0, 0, 1], 8787));
    tracing::info!("AI server listening on http://{address}");
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("failed to bind AI server");
    axum::serve(listener, app).await.expect("AI server failed");
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        model: state.model,
    })
}

async fn chat(State(state): State<AppState>, Json(request): Json<ChatRequest>) -> Response {
    if request.messages.is_empty() {
        return error_response(StatusCode::BAD_REQUEST, "messages cannot be empty");
    }

    let mut messages = Vec::with_capacity(request.messages.len() + 2);
    messages.push(json!({
        "role": "system",
        "content": system_prompt(request.mode.as_deref())
    }));

    if let Some(page) = request.page {
        messages.push(json!({
            "role": "system",
            "content": page_prompt(page)
        }));
    }

    for message in request
        .messages
        .into_iter()
        .rev()
        .take(MAX_MESSAGES)
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
    {
        if !matches!(message.role.as_str(), "user" | "assistant") {
            continue;
        }
        messages.push(json!({
            "role": message.role,
            "content": truncate_chars(&message.content, MAX_PAGE_CHARS)
        }));
    }

    let upstream = state
        .client
        .post(format!("{}/chat/completions", state.base_url))
        .bearer_auth(&state.api_key)
        .json(&json!({
            "model": state.model,
            "messages": messages,
            "stream": true
        }))
        .send()
        .await;

    let upstream = match upstream {
        Ok(response) => response,
        Err(error) => {
            tracing::error!(%error, "failed to reach DeepSeek");
            return error_response(StatusCode::BAD_GATEWAY, "无法连接 DeepSeek API");
        }
    };

    if !upstream.status().is_success() {
        let status = upstream.status();
        let detail = upstream.text().await.unwrap_or_default();
        tracing::error!(%status, %detail, "DeepSeek returned an error");
        return error_response(
            StatusCode::BAD_GATEWAY,
            "DeepSeek API 返回错误，请检查密钥和配置",
        );
    }

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "text/event-stream; charset=utf-8")
        .header(header::CACHE_CONTROL, "no-cache")
        .header("X-Accel-Buffering", "no")
        .body(Body::from_stream(upstream.bytes_stream()))
        .expect("valid streaming response")
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

fn page_prompt(page: PageContext) -> String {
    format!(
        "当前教材页面\n标题：{}\n地址：{}\n\n正文：\n{}",
        truncate_chars(&page.title, 300),
        truncate_chars(&page.url, 500),
        truncate_chars(&page.content, MAX_PAGE_CHARS)
    )
}

fn truncate_chars(value: &str, max: usize) -> String {
    value.chars().take(max).collect()
}

fn error_response(status: StatusCode, message: &str) -> Response {
    (status, Json(json!({ "error": message }))).into_response()
}

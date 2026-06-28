use sqlx::PgPool;
use uuid::Uuid;
use std::convert::Infallible;
use std::pin::Pin;
use std::task::{Context, Poll};
use futures_util::{Stream, StreamExt};
use axum::response::sse::Event;
use serde_json::json;
use tracing::{warn, error};
use chrono::Utc;

use crate::config::Config;

pub struct ReceiverStream<T> {
    inner: tokio::sync::mpsc::Receiver<T>,
}

impl<T> ReceiverStream<T> {
    pub fn new(inner: tokio::sync::mpsc::Receiver<T>) -> Self {
        Self { inner }
    }
}

impl<T> Stream for ReceiverStream<T> {
    type Item = T;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        self.inner.poll_recv(cx)
    }
}

/// Send request to LLM, parse response stream, update database, and return SSE event stream
pub async fn stream_chat_response(
    pool: PgPool,
    config: Config,
    client: reqwest::Client,
    messages: Vec<serde_json::Value>,
    assistant_msg_id: Uuid,
) -> Result<ReceiverStream<Result<Event, Infallible>>, Box<dyn std::error::Error>> {
    let url = format!("{}/chat/completions", config.base_url);
    
    let upstream_res = client
        .post(&url)
        .bearer_auth(&config.api_key)
        .json(&json!({
            "model": config.model,
            "messages": messages,
            "stream": true
        }))
        .send()
        .await;

    let upstream = match upstream_res {
        Ok(res) => res,
        Err(e) => {
            error!("Failed to request upstream LLM: {}", e);
            // Update database status to failed
            update_message_status(&pool, assistant_msg_id, "failed", &format!("无法连接 AI 接口：{}", e)).await;
            return Err(e.into());
        }
    };

    if !upstream.status().is_success() {
        let status = upstream.status();
        let detail = upstream.text().await.unwrap_or_default();
        error!(%status, %detail, "Upstream LLM returned error status");
        update_message_status(&pool, assistant_msg_id, "failed", "AI 接口返回错误，请检查配置。").await;
        return Err(format!("Upstream error: {}", status).into());
    }

    let (tx, rx) = tokio::sync::mpsc::channel::<Result<Event, Infallible>>(100);

    // Spawn a background task to process the stream
    tokio::spawn(async move {
        let mut stream = upstream.bytes_stream();
        let mut buffer = String::new();
        let mut full_response = String::new();
        let mut has_errors = false;

        while let Some(chunk_result) = stream.next().await {
            let chunk = match chunk_result {
                Ok(bytes) => bytes,
                Err(e) => {
                    error!("Error reading chunk from upstream stream: {}", e);
                    has_errors = true;
                    break;
                }
            };

            let chunk_str = String::from_utf8_lossy(&chunk);
            buffer.push_str(&chunk_str);

            while let Some(pos) = buffer.find('\n') {
                let line = buffer[..pos].to_string();
                buffer.drain(..pos + 1);

                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }

                if trimmed.starts_with("data:") {
                    let data_part = trimmed["data:".len()..].trim();
                    if data_part == "[DONE]" {
                        break;
                    }

                    // Extract delta content
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(data_part) {
                        if let Some(choices) = val.get("choices") {
                            if let Some(first_choice) = choices.get(0) {
                                if let Some(delta) = first_choice.get("delta") {
                                    if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                        full_response.push_str(content);
                                        
                                        // Forward event to client
                                        let ev = Event::default()
                                            .event("delta")
                                            .data(json!({ "content": content }).to_string());
                                        
                                        if tx.send(Ok(ev)).await.is_err() {
                                            // Client disconnected
                                            warn!("SSE client disconnected during stream.");
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Process leftovers in buffer if any
        let trimmed_leftover = buffer.trim();
        if !trimmed_leftover.is_empty() && trimmed_leftover.starts_with("data:") {
            let data_part = trimmed_leftover["data:".len()..].trim();
            if data_part != "[DONE]" {
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(data_part) {
                    if let Some(choices) = val.get("choices") {
                        if let Some(first_choice) = choices.get(0) {
                            if let Some(delta) = first_choice.get("delta") {
                                if let Some(content) = delta.get("content").and_then(|c| c.as_str()) {
                                    full_response.push_str(content);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Save final aggregated text to database and update status
        if has_errors {
            update_message_status(&pool, assistant_msg_id, "failed", &full_response).await;
        } else if full_response.is_empty() {
            update_message_status(&pool, assistant_msg_id, "stopped", "未收到回答内容。").await;
        } else {
            // Success
            sqlx::query(
                "UPDATE messages SET content = $1, status = 'completed', created_at = $2 WHERE id = $3"
            )
            .bind(&full_response)
            .bind(Utc::now())
            .bind(assistant_msg_id)
            .execute(&pool)
            .await
            .ok();

            // Send done event
            let done_ev = Event::default()
                .event("done")
                .data(json!({ "messageId": assistant_msg_id }).to_string());
            tx.send(Ok(done_ev)).await.ok();
        }
    });

    Ok(ReceiverStream::new(rx))
}

async fn update_message_status(pool: &PgPool, msg_id: Uuid, status: &str, content: &str) {
    sqlx::query(
        "UPDATE messages SET status = $1, content = $2, created_at = $3 WHERE id = $4"
    )
    .bind(status)
    .bind(content)
    .bind(Utc::now())
    .bind(msg_id)
    .execute(pool)
    .await
    .ok();
}

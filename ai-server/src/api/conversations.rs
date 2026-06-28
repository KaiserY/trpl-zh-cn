use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
};
use sqlx::PgPool;
use uuid::Uuid;
use serde::Deserialize;

use crate::models::conversation::{Conversation, Message};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateConversationRequest {
    pub title: Option<String>,
    pub current_page: Option<String>,
}

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/api/conversations", get(list_conversations).post(create_conversation))
        .route("/api/conversations/{id}", get(get_conversation).delete(delete_conversation))
        .route("/api/conversations/{id}/messages", get(get_messages))
}

async fn list_conversations(
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    match Conversation::list(&pool).await {
        Ok(list) => (StatusCode::OK, Json(list)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn create_conversation(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateConversationRequest>,
) -> impl IntoResponse {
    match Conversation::create(&pool, payload.title.as_deref(), payload.current_page.as_deref()).await {
        Ok(conv) => (StatusCode::CREATED, Json(conv)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn get_conversation(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    match Conversation::find_by_id(&pool, id).await {
        Ok(Some(conv)) => (StatusCode::OK, Json(conv)).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Conversation not found" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn delete_conversation(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    match Conversation::delete(&pool, id).await {
        Ok(true) => (StatusCode::OK, Json(serde_json::json!({ "success": true }))).into_response(),
        Ok(false) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Conversation not found or already deleted" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn get_messages(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    match Message::list_for_conversation(&pool, id).await {
        Ok(messages) => (StatusCode::OK, Json(messages)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() }))).into_response(),
    }
}

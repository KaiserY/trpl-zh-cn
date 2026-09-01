use axum::{
    Json, Router,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use sqlx::PgPool;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use serde::Deserialize;
use serde_json::json;
use tracing::{info, error};

use crate::config::Config;
use crate::models::book::BookNode;
use crate::book::search::search_toc_nodes;
use crate::book::indexer::run_indexer;

#[derive(Clone)]
pub struct AdminState {
    pub pool: PgPool,
    pub config: Config,
    pub indexing_active: Arc<AtomicBool>,
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

pub fn router(state: AdminState) -> Router {
    Router::new()
        .route("/api/admin/books/reindex", post(reindex_book))
        .route("/api/admin/books/index-status", get(index_status))
        .route("/api/book/toc", get(get_toc))
        .route("/api/book/search", get(search_book))
        .with_state(state)
}

async fn reindex_book(
    State(state): State<AdminState>,
) -> impl IntoResponse {
    // Check if indexing is already active
    if state.indexing_active.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_err() {
        return (StatusCode::CONFLICT, Json(json!({ "status": "error", "message": "Indexing is already in progress" }))).into_response();
    }

    let pool = state.pool.clone();
    let config = state.config.clone();
    let active_flag = state.indexing_active.clone();

    // Spawn indexing in the background
    tokio::spawn(async move {
        info!("Background indexing task started.");
        match run_indexer(&pool, &config).await {
            Ok(_) => info!("Background indexing task completed successfully."),
            Err(e) => error!("Background indexing task failed: {}", e),
        }
        active_flag.store(false, Ordering::SeqCst);
    });

    (StatusCode::ACCEPTED, Json(json!({ "status": "ok", "message": "Indexing started in the background" }))).into_response()
}

async fn index_status(
    State(state): State<AdminState>,
) -> impl IntoResponse {
    let active = state.indexing_active.load(Ordering::SeqCst);
    Json(json!({
        "indexing": active,
        "status": if active { "indexing" } else { "idle" }
    }))
}

async fn get_toc(
    State(state): State<AdminState>,
) -> impl IntoResponse {
    match BookNode::get_toc(&state.pool).await {
        Ok(toc) => (StatusCode::OK, Json(toc)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

async fn search_book(
    State(state): State<AdminState>,
    Query(query): Query<SearchQuery>,
) -> impl IntoResponse {
    match search_toc_nodes(&state.pool, &query.q, 10).await {
        Ok(nodes) => (StatusCode::OK, Json(nodes)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))).into_response(),
    }
}

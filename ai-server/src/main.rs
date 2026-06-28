use std::net::SocketAddr;
use std::sync::Arc;
use std::sync::atomic::AtomicBool;
use axum::{
    Json, Router,
    http::{HeaderValue, Method, header},
    routing::get,
};
use tower_http::{
    cors::CorsLayer,
    trace::TraceLayer,
};
use tracing::{info, error};

use rust_book_ai_server::{
    config::Config,
    db::init_db,
    api::{conversations, chat, admin},
};

#[tokio::main]
async fn main() {
    // 1. Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "rust_book_ai_server=info,tower_http=info".into()),
        )
        .init();

    info!("Starting AI Server...");

    // 2. Load configuration
    let config = Config::from_env();

    // 3. Initialize database connection pool & run migrations
    let pool = match init_db(&config.database_url).await {
        Ok(p) => p,
        Err(e) => {
            error!("Database connection/migration failed: {}", e);
            std::process::exit(1);
        }
    };

    // 4. Initialize shared state variables
    let indexing_active = Arc::new(AtomicBool::new(false));
    let client = reqwest::Client::new();

    // API state for chat SSE
    let chat_state = chat::ApiState {
        pool: pool.clone(),
        config: config.clone(),
        client: client.clone(),
    };

    // Admin state for background indexing & TOC
    let admin_state = admin::AdminState {
        pool: pool.clone(),
        config: config.clone(),
        indexing_active,
    };

    // 5. Setup CORS
    let allowed_origin = config.allowed_origin
        .parse::<HeaderValue>()
        .expect("AI_ALLOWED_ORIGIN must be a valid HTTP header value");

    // 6. Build Axum router
    let app = Router::new()
        // Health check
        .route("/api/health", get(health))
        // Conversations REST endpoints
        .merge(conversations::router().with_state(pool.clone()))
        // Chat messaging (SSE) endpoints
        .merge(chat::router(chat_state))
        // Admin indexing, search & TOC endpoints
        .merge(admin::router(admin_state))
        .layer(
            CorsLayer::new()
                .allow_origin(allowed_origin)
                .allow_methods([Method::GET, Method::POST, Method::DELETE])
                .allow_headers([header::CONTENT_TYPE]),
        )
        .layer(TraceLayer::new_for_http());

    // 7. Bind listener
    let address = SocketAddr::from(([127, 0, 0, 1], 8787));
    info!("AI server listening on http://{address}");
    
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("failed to bind AI server");
    
    axum::serve(listener, app).await.expect("AI server failed");
}

#[derive(serde::Serialize)]
struct HealthResponse {
    status: &'static str,
    database: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        database: "connected",
    })
}

use rust_book_ai_server::{config::Config, db::init_db, book::indexer::run_indexer};
use tracing::{info, error};

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "index_book=info,rust_book_ai_server=info".into()),
        )
        .init();

    info!("Starting book indexer...");

    let config = Config::from_env();
    
    // Connect to database and run migrations
    let pool = match init_db(&config.database_url).await {
        Ok(p) => p,
        Err(e) => {
            error!("Failed to connect to database: {}", e);
            std::process::exit(1);
        }
    };

    // Run indexing
    if let Err(e) = run_indexer(&pool, &config).await {
        error!("Indexing failed: {}", e);
        std::process::exit(1);
    }

    info!("Indexer finished successfully.");
}

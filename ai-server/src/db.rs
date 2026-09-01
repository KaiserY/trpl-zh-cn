use sqlx::{PgPool, postgres::PgPoolOptions};
use std::time::Duration;
use tracing::info;

pub async fn init_db(database_url: &str) -> Result<PgPool, sqlx::Error> {
    info!("Connecting to PostgreSQL database...");
    
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(3))
        .connect(database_url)
        .await?;

    info!("Database connection established. Running migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;
        
    info!("Database migrations applied successfully.");
    Ok(pool)
}

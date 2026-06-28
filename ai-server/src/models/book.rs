use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct BookNode {
    pub id: Uuid,
    pub parent_id: Option<Uuid>,
    pub title: String,
    pub path: Option<String>,
    pub depth: i32,
    pub position: i32,
    pub node_type: String, // "book", "part", "chapter", "section"
    pub content_hash: Option<String>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct DocumentChunk {
    pub id: Uuid,
    pub book_node_id: Uuid,
    pub heading_path: Vec<String>,
    pub ordinal: i32,
    pub content: String,
    pub token_count: i32,
    pub start_line: Option<i32>,
    pub end_line: Option<i32>,
    pub content_hash: String,
}

impl BookNode {
    pub async fn get_toc(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>(
            "SELECT id, parent_id, title, path, depth, position, node_type, content_hash, updated_at FROM book_nodes ORDER BY position ASC"
        )
        .fetch_all(pool)
        .await
    }
}

use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Conversation {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub title: Option<String>,
    pub current_page: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Message {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sequence_no: i64,
    pub role: String,
    pub content: String,
    pub status: String, // "streaming", "completed", "failed", "stopped"
    pub model: Option<String>,
    pub prompt_tokens: Option<i32>,
    pub completion_tokens: Option<i32>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

impl Conversation {
    pub async fn create(
        pool: &PgPool,
        title: Option<&str>,
        current_page: Option<&str>,
    ) -> Result<Self, sqlx::Error> {
        let id = Uuid::new_v4();
        let now = Utc::now();
        
        sqlx::query_as::<_, Self>(
            r#"
            INSERT INTO conversations (id, user_id, title, current_page, created_at, updated_at, deleted_at)
            VALUES ($1, NULL, $2, $3, $4, $5, NULL)
            RETURNING id, user_id, title, current_page, created_at, updated_at, deleted_at
            "#
        )
        .bind(id)
        .bind(title)
        .bind(current_page)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>(
            "SELECT id, user_id, title, current_page, created_at, updated_at, deleted_at FROM conversations WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id)
        .fetch_optional(pool)
        .await
    }

    pub async fn list(pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>(
            "SELECT id, user_id, title, current_page, created_at, updated_at, deleted_at FROM conversations WHERE deleted_at IS NULL ORDER BY updated_at DESC"
        )
        .fetch_all(pool)
        .await
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
        // Soft delete conversations
        let result = sqlx::query(
            "UPDATE conversations SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL"
        )
        .bind(Utc::now())
        .bind(id)
        .execute(pool)
        .await?;
        
        Ok(result.rows_affected() > 0)
    }
}

impl Message {
    pub async fn list_for_conversation(pool: &PgPool, conversation_id: Uuid) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Self>(
            r#"
            SELECT id, conversation_id, sequence_no, role, content, status, model, prompt_tokens, completion_tokens, metadata, created_at
            FROM messages
            WHERE conversation_id = $1
            ORDER BY sequence_no ASC
            "#
        )
        .bind(conversation_id)
        .fetch_all(pool)
        .await
    }

    pub async fn get_next_sequence_no(pool: &PgPool, conversation_id: Uuid) -> Result<i64, sqlx::Error> {
        let row: Option<(i64,)> = sqlx::query_as(
            "SELECT COALESCE(MAX(sequence_no), 0) + 1 FROM messages WHERE conversation_id = $1"
        )
        .bind(conversation_id)
        .fetch_optional(pool)
        .await?;
        
        Ok(row.map(|r| r.0).unwrap_or(1))
    }

    pub async fn insert(pool: &PgPool, msg: &Self) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO messages (
                id, conversation_id, sequence_no, role, content, status, 
                model, prompt_tokens, completion_tokens, metadata, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#
        )
        .bind(msg.id)
        .bind(msg.conversation_id)
        .bind(msg.sequence_no)
        .bind(&msg.role)
        .bind(&msg.content)
        .bind(&msg.status)
        .bind(&msg.model)
        .bind(msg.prompt_tokens)
        .bind(msg.completion_tokens)
        .bind(&msg.metadata)
        .bind(msg.created_at)
        .execute(pool)
        .await?;

        // Update conversation's updated_at timestamp
        sqlx::query(
            "UPDATE conversations SET updated_at = $1 WHERE id = $2"
        )
        .bind(Utc::now())
        .bind(msg.conversation_id)
        .execute(pool)
        .await?;

        Ok(())
    }
}

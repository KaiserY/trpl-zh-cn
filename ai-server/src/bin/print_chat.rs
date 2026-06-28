use rust_book_ai_server::{config::Config, db::init_db};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(sqlx::FromRow, Debug)]
struct Conversation {
    id: Uuid,
    title: Option<String>,
    current_page: Option<String>,
    created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow, Debug)]
struct Message {
    role: String,
    content: String,
    created_at: DateTime<Utc>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let config = Config::from_env();
    let pool = init_db(&config.database_url).await?;

    let conversations = sqlx::query_as::<_, Conversation>(
        "SELECT id, title, current_page, created_at FROM conversations WHERE deleted_at IS NULL ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    if conversations.is_empty() {
        println!("No conversation records found.");
        return Ok(());
    }

    println!("# Conversation Records Export\n");

    for conv in conversations {
        let title = conv.title.as_deref().unwrap_or("Untitled Conversation");
        let page = conv.current_page.as_deref().unwrap_or("Unknown page");
        println!("## Conversation: {} (ID: {})", title, conv.id);
        println!("- **Start Time**: {}", conv.created_at.with_timezone(&chrono::Local));
        println!("- **Current Page**: {}\n", page);

        let messages = sqlx::query_as::<_, Message>(
            "SELECT role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY sequence_no ASC",
        )
        .bind(conv.id)
        .fetch_all(&pool)
        .await?;

        for msg in messages {
            let role_display = match msg.role.as_str() {
                "user" => "👤 User",
                "assistant" => "🦀 Ferris (Assistant)",
                "system" => "⚙️ System",
                _ => &msg.role,
            };
            let time_str = msg.created_at.with_timezone(&chrono::Local).format("%Y-%m-%d %H:%M:%S");
            println!("### {} [{}]\n", role_display, time_str);
            println!("{}\n", msg.content);
            println!("---\n");
        }
        println!("\n==================================================\n");
    }

    Ok(())
}

use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub api_key: String,
    pub base_url: String,
    pub model: String,
    pub embedding_api_key: String,
    pub embedding_base_url: String,
    pub embedding_model: String,
    pub allowed_origin: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let api_key = env::var("DEEPSEEK_API_KEY")
            .expect("DEEPSEEK_API_KEY must be set in the .env file");
        if api_key.trim().is_empty() {
            panic!("DEEPSEEK_API_KEY is empty");
        }

        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:password@127.0.0.1:5432/rust_book_ai".to_owned());

        let base_url = env::var("DEEPSEEK_BASE_URL")
            .unwrap_or_else(|_| "https://api.deepseek.com".to_owned())
            .trim_end_matches('/')
            .to_owned();

        let model = env::var("DEEPSEEK_MODEL").unwrap_or_else(|_| "deepseek-chat".to_owned());

        let embedding_api_key = env::var("EMBEDDING_API_KEY")
            .unwrap_or_else(|_| api_key.clone());

        let embedding_base_url = env::var("EMBEDDING_BASE_URL")
            .unwrap_or_else(|_| "https://api.openai.com/v1".to_owned())
            .trim_end_matches('/')
            .to_owned();

        let embedding_model = env::var("EMBEDDING_MODEL")
            .unwrap_or_else(|_| "text-embedding-3-small".to_owned());

        let allowed_origin = env::var("AI_ALLOWED_ORIGIN")
            .unwrap_or_else(|_| "http://localhost:3000".to_owned());

        Self {
            database_url,
            api_key,
            base_url,
            model,
            embedding_api_key,
            embedding_base_url,
            embedding_model,
            allowed_origin,
        }
    }
}

-- Enable pgvector and pg_trgm extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create book_nodes table to represent the SUMMARY.md tree structure
CREATE TABLE IF NOT EXISTS book_nodes (
    id              UUID PRIMARY KEY,
    parent_id       UUID REFERENCES book_nodes(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    path            TEXT,
    depth           INTEGER NOT NULL,
    position        INTEGER NOT NULL,
    node_type       TEXT NOT NULL, -- book/part/chapter/section
    content_hash    TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create document_chunks table to store section-level chunks of markdown pages
CREATE TABLE IF NOT EXISTS document_chunks (
    id              UUID PRIMARY KEY,
    book_node_id    UUID NOT NULL REFERENCES book_nodes(id) ON DELETE CASCADE,
    heading_path    TEXT[] NOT NULL,
    ordinal         INTEGER NOT NULL,
    content         TEXT NOT NULL,
    token_count     INTEGER NOT NULL,
    start_line      INTEGER,
    end_line        INTEGER,
    content_hash    TEXT NOT NULL,
    embedding       VECTOR(1536),
    search_vector   TSVECTOR
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id              UUID PRIMARY KEY,
    user_id         UUID,
    title           TEXT,
    current_page    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sequence_no     BIGINT NOT NULL,
    role            TEXT NOT NULL, -- user/assistant/system/tool
    content         TEXT NOT NULL,
    status          TEXT NOT NULL, -- streaming/completed/failed/stopped
    model           TEXT,
    prompt_tokens   INTEGER,
    completion_tokens INTEGER,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, sequence_no)
);

-- Create trigram indexes for fast Chinese fuzzy matching and search
CREATE INDEX IF NOT EXISTS idx_book_nodes_title_trgm ON book_nodes USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_trgm ON document_chunks USING gin (content gin_trgm_ops);

-- Create foreign key and indexing constraints
CREATE INDEX IF NOT EXISTS idx_book_nodes_parent_id ON book_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_book_node_id ON document_chunks(book_node_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

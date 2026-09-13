-- Portfolio & Persona Master Database Schema
-- Structured Ground Truth + Semantic RAG via pgvector

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Projects Registry Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,              -- 'matchresume', 'doyoularp', 'batchshare'
    name VARCHAR(128) NOT NULL,
    subtitle VARCHAR(256),
    description TEXT,
    live_url TEXT,
    github_url TEXT,
    technologies TEXT[] DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    metrics JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Project Demos & UI Capabilities Table
CREATE TABLE IF NOT EXISTS project_demos (
    id VARCHAR(64) PRIMARY KEY,              -- 'matching'
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    action_type VARCHAR(64) DEFAULT 'RUN_DEMO',
    parameters JSONB DEFAULT '{}'::jsonb
);

-- 3. Persona Behavioral Profile Table
CREATE TABLE IF NOT EXISTS persona_traits (
    trait_name VARCHAR(64) PRIMARY KEY,      -- 'hedging', 'directness', 'formality', etc.
    score FLOAT NOT NULL,                    -- 0.03, 0.45, etc.
    rule_description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project Documentation & Semantic RAG Table (pgvector)
CREATE TABLE IF NOT EXISTS project_knowledge (
    id BIGSERIAL PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    doc_type VARCHAR(32) NOT NULL,           -- 'readme', 'architecture', 'tradeoff', 'faq'
    title VARCHAR(256) DEFAULT '',
    chunk_content TEXT NOT NULL,
    embedding VECTOR(768),                   -- 768-dimensional contextual Sentence-BERT embedding
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_project_knowledge_embedding
ON project_knowledge
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

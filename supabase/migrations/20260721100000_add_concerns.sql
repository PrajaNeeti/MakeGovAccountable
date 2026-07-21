-- Enable pgvector extension for semantic similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- concerns
-- ============================================================
CREATE TABLE IF NOT EXISTS public.concerns (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_token UUID       NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    content       TEXT        NOT NULL,
    embedding     vector(1536),
    status        TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'grouped', 'resolved', 'rejected')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for fast approximate nearest-neighbour search
CREATE INDEX IF NOT EXISTS concerns_embedding_hnsw_idx
    ON public.concerns
    USING hnsw (embedding vector_l2_ops);

-- ============================================================
-- concern_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS public.concern_groups (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT        NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- concern_entity_links  (M2M: concern ↔ government entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.concern_entity_links (
    concern_id  UUID        NOT NULL REFERENCES public.concerns(id)  ON DELETE CASCADE,
    entity_type TEXT        NOT NULL,   -- e.g. 'politician', 'department', 'court'
    entity_id   UUID        NOT NULL,
    PRIMARY KEY (concern_id, entity_type, entity_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- concerns: anon can insert; everyone can read (all concerns are public)
ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable anonymous inserts"
    ON public.concerns
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Public read access to concerns"
    ON public.concerns
    FOR SELECT
    USING (true);

-- concern_groups: public read
ALTER TABLE public.concern_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to concern_groups"
    ON public.concern_groups
    FOR SELECT
    USING (true);

-- concern_entity_links: public read
ALTER TABLE public.concern_entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to concern_entity_links"
    ON public.concern_entity_links
    FOR SELECT
    USING (true);

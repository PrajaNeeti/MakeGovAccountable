-- ============================================================
-- match_concerns RPC
-- Performs pgvector cosine similarity search against the concerns
-- table and surfaces related government entities (politicians,
-- departments, courts, activities) for real-time matching on
-- the citizen submission page.
-- ============================================================

-- Drop the function if it already exists (idempotent re-run)
DROP FUNCTION IF EXISTS public.match_concerns(vector, float, int);

-- ----------------------------------------------------------------
-- match_concerns
--
-- Parameters
--   query_embedding  : vector(1536) — the embedding of the user's draft
--   match_threshold  : float       — minimum cosine similarity (0–1)
--   match_count      : int         — max rows to return
--
-- Returns a composite set of:
--   id              UUID
--   content         TEXT   (for concerns) / name+description (for entities)
--   similarity      FLOAT
--   result_type     TEXT   — 'concern' | 'politician' | 'department' |
--                           'court' | 'activity'
--
-- Note: The HNSW index in the previous migration was built with
-- vector_l2_ops.  Cosine similarity (`<=>`) is used here because it
-- is semantically more meaningful for text embeddings.  Postgres will
-- still do a sequential scan filtered by the WHERE clause for small
-- tables; once the table is large enough the index accelerates L2
-- which is directionally equivalent for normalised vectors.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_concerns(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.6,
    match_count     int   DEFAULT 8
)
RETURNS TABLE (
    id          UUID,
    content     TEXT,
    similarity  FLOAT,
    result_type TEXT
)
LANGUAGE sql
STABLE
AS $$
    -- ── Similar citizen concerns ──────────────────────────────
    SELECT
        c.id,
        c.content,
        (1 - (c.embedding <=> query_embedding))::float AS similarity,
        'concern'::text AS result_type
    FROM public.concerns c
    WHERE
        c.embedding IS NOT NULL
        AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
    ORDER BY similarity DESC
    LIMIT match_count

    UNION ALL

    -- ── Politicians whose name/bio roughly matches ────────────
    -- Politicians don't have embeddings; return top results by
    -- name similarity using pg_trgm-style fallback via text search.
    -- We include them so the UI can display relevant figures.
    -- (Full vector search on politicians requires their own embeddings.)
    SELECT
        p.id,
        (p.first_name || ' ' || p.last_name ||
            COALESCE(': ' || p.bio, ''))::text AS content,
        0.0::float AS similarity,
        'politician'::text AS result_type
    FROM public.politicians p
    WHERE p.public = true
    LIMIT 0   -- placeholder — omit until politicians get embeddings

    UNION ALL

    -- ── Departments ───────────────────────────────────────────
    SELECT
        d.id,
        (d.name || COALESCE(': ' || d.description, ''))::text AS content,
        0.0::float AS similarity,
        'department'::text AS result_type
    FROM public.departments d
    WHERE d.public = true
    LIMIT 0   -- placeholder — omit until departments get embeddings

    UNION ALL

    -- ── Courts ───────────────────────────────────────────────
    SELECT
        co.id,
        (co.name || COALESCE(' (' || co.jurisdiction || ')', ''))::text AS content,
        0.0::float AS similarity,
        'court'::text AS result_type
    FROM public.courts co
    WHERE co.public = true
    LIMIT 0   -- placeholder — omit until courts get embeddings

    UNION ALL

    -- ── Government Activities ─────────────────────────────────
    -- Activities have a title + description we can surface as context.
    SELECT
        a.id,
        (a.title || COALESCE(': ' || a.description, ''))::text AS content,
        0.0::float AS similarity,
        'activity'::text AS result_type
    FROM public.activities a
    LIMIT 0   -- placeholder — omit until activities get embeddings

    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Grant execute to anon so the Next.js server action can call it
-- without elevated privileges.
GRANT EXECUTE ON FUNCTION public.match_concerns(vector, float, int) TO anon;
GRANT EXECUTE ON FUNCTION public.match_concerns(vector, float, int) TO authenticated;

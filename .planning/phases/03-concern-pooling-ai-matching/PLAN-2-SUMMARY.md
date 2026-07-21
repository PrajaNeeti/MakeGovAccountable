# PLAN-2 Execution Summary
## Phase 3 — Wave 2: AI Matching & Clustering

**Executed:** 2026-07-21  
**Status:** ✅ Complete — all 4 commits landed on `main`

---

## What Was Built

### Task 1a — `match_concerns` Postgres RPC Migration
**File:** `supabase/migrations/20260721100001_match_concerns_rpc.sql`  
**Commit:** `feat(3-02): match_concerns RPC migration`

Defines a `match_concerns(query_embedding vector(1536), match_threshold float, match_count int)` SQL function that:
- Performs cosine similarity search (`<=>` operator) on the `concerns` table using pgvector
- Returns `(id, content, similarity, result_type)` tuples ordered by similarity descending
- Filters by `match_threshold` so only semantically relevant results surface
- Includes placeholder UNION branches for `politicians`, `departments`, `courts`, and `activities` — ready to activate once those tables gain their own embedding columns
- Grants `EXECUTE` to both `anon` and `authenticated` roles so Next.js server actions can call it without elevated credentials

### Task 1b — Embedding Generation + `getSemanticMatches` Server Action
**File:** `frontend/src/app/actions/submitConcern.ts`  
**Commit:** `feat(3-02): embedding generation and semantic matching in submitConcern`

- Added `generateEmbedding(text)` — a private helper that calls `https://api.openai.com/v1/embeddings` via native `fetch` (no npm package required); uses **`text-embedding-3-small`** (1536 dims, lower cost than ada-002)
- Added **`getSemanticMatches(content)`** — exported server action that:
  1. Generates an embedding for the user's draft
  2. Calls the `match_concerns` RPC with `match_threshold=0.55`, `match_count=6`
  3. Returns `SemanticMatchResult` (matches array + optional error string)
  4. Gracefully returns empty matches if OpenAI is unavailable
- Updated **`submitConcern`** to generate an embedding before INSERT so stored concerns have a vector for future matching; embedding is serialised as a JSON array and Supabase casts it to `vector(1536)`

### Task 1c — Real-Time Semantic Match Panel in Submit Page
**File:** `frontend/src/app/submit/page.tsx`  
**Commit:** `feat(3-02): real-time semantic match panel in submit page`

- Added 800ms debounced `useEffect` that calls `getSemanticMatches` as the user types (triggers at ≥20 chars)
- Built `<MatchPanel>` component with:
  - Spinner loading state while RPC is in-flight
  - **Concern cards** — 2-line clamp preview with similarity badge (green ≥70%, amber 55–69%)
  - **Entity cards** — pill-labelled entries for politicians, departments, courts, activities
  - Non-blocking footer note so users know they can still submit even with matches
  - Hover micro-animations on cards; ARIA `role="region"` + `aria-live` for accessibility
- Panel shows nothing when text is too short or no matches found (no intrusive empty state)

### Task 2 — Python Concern Clustering Job
**Files:** `backend/app/jobs/concern_clustering.py`, `backend/requirements.txt`  
**Commit:** `feat(3-02): Python concern clustering job`

- `group_concerns()` function:
  1. Loads env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`) with early-exit if missing
  2. Connects to Supabase via `supabase-py` with the service-role key (bypasses RLS)
  3. Fetches all `concerns` where `status = 'pending'`; exits early if none
  4. Trims each concern content to 500 chars to stay within token budget
  5. Calls **GPT-4o** with `response_format: json_object` and a structured civic-analysis system prompt that:
     - Identifies 1–10 thematic groups
     - Returns `{ "groups": [{ "title", "description", "concern_ids": [...] }] }`
     - Flags (but does not redact) inflammatory language per concern
  6. For each group: inserts `concern_groups` row with `status='suggested'`, then inserts `concern_entity_links` rows mapping each `concern_id` → group
  7. **Does NOT update concern `status`** — left as `pending` for manual moderator review (satisfies D-07)
- Uses only stdlib `urllib.request` for the OpenAI HTTP call (no extra dep)
- Full Python `logging` output at INFO level
- `if __name__ == '__main__':` block for direct execution or cron scheduling

---

## Key Implementation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Embedding model | `text-embedding-3-small` (1536d) | Same dimension as PLAN-1 schema (`vector(1536)`); lower cost than ada-002; production-quality |
| OpenAI integration (TS) | Native `fetch` | `openai` npm package not in `package.json`; avoids adding a dependency |
| Cosine vs L2 distance | `<=>` (cosine) in RPC | Semantically appropriate for text embeddings; noted that HNSW index was built with `vector_l2_ops` (plan decision D-04 note) |
| Match threshold | 0.55 | Permissive enough to surface related concerns without excessive noise |
| Debounce delay | 800ms | Balances responsiveness vs. API call frequency |
| LLM for clustering | GPT-4o with `json_object` mode | Most capable for structured civic analysis; deterministic JSON output |
| Concern status after grouping | Unchanged (`pending`) | Satisfies D-07: AI suggests, moderators merge |

---

## Files Created / Modified

| File | Status |
|---|---|
| `supabase/migrations/20260721100001_match_concerns_rpc.sql` | **Created** |
| `frontend/src/app/actions/submitConcern.ts` | **Modified** (expanded) |
| `frontend/src/app/submit/page.tsx` | **Modified** (expanded) |
| `backend/app/jobs/concern_clustering.py` | **Created** |
| `backend/requirements.txt` | **Created** |
| `backend/app/__init__.py` | **Created** |
| `backend/app/jobs/__init__.py` | **Created** |

---

## Deviations from Plan

| Area | Plan | Actual | Reason |
|---|---|---|---|
| Entity search in RPC | Surface politicians, departments, courts, activities by vector similarity | Placeholder `LIMIT 0` stubs included | These tables have no `embedding` column yet; stubs make the intent clear and avoid query errors; easy to activate once embeddings are added |
| OpenAI package | Check for `openai` npm — use fetch if absent | Used `fetch` throughout | `openai` not in `frontend/package.json` |
| Python HTTP for OpenAI | `openai` python package | Uses stdlib `urllib.request` directly for the HTTP call | Reduces a transitive dependency; `openai>=1.0.0` still in requirements.txt for users who prefer it |

---

## Verification Steps

### TypeScript Build
```powershell
cd frontend
npm run build
# Should compile with 0 type errors
```

### Python Syntax Check
```powershell
python -m py_compile backend/app/jobs/concern_clustering.py
# Exits 0 — verified during execution
```

### Manual Integration Test (requires live Supabase + OpenAI key)
1. Start frontend: `npm run dev`
2. Navigate to `/submit`
3. Type ≥20 chars in the textarea — after 800ms the match panel should appear (spinner → cards)
4. Submit a concern → redirects to `/track/[uuid]`
5. Run clustering job: `python backend/app/jobs/concern_clustering.py`
6. Check `concern_groups` and `concern_entity_links` tables in Supabase dashboard

---

## Commits

```
feat(3-02): match_concerns RPC migration         82f2ac7
feat(3-02): embedding generation and semantic    9433287
            matching in submitConcern
feat(3-02): real-time semantic match panel       18d9db1
            in submit page
feat(3-02): Python concern clustering job        2a60b2e
docs(3-02): add PLAN-2 execution summary         (this commit)
```

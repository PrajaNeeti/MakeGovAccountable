# PLAN-1 Execution Summary
## Phase 3 — Concern Pooling & AI Matching · Wave 1

**Executed:** 2026-07-21  
**Status:** ✅ Complete — all 6 tasks implemented and committed atomically

---

## What Was Built

| # | Task | Route / File | Status |
|---|------|-------------|--------|
| 1 | Database Schema | `supabase/migrations/20260721100000_add_concerns.sql` | ✅ Done |
| 2 | Rate Limiting Middleware | `frontend/src/middleware.ts` | ✅ Done |
| 3 | Server Action: submitConcern | `frontend/src/app/actions/submitConcern.ts` | ✅ Done |
| 4 | Submission UI | `frontend/src/app/submit/page.tsx` | ✅ Done |
| 5 | Track Profile UI | `frontend/src/app/track/[uuid]/page.tsx` | ✅ Done |
| 6 | Public Concerns Feed | `frontend/src/app/concerns/page.tsx` | ✅ Done |

---

## Key Implementation Decisions

### Task 1 — Database Schema
- Used `gen_random_uuid()` (PG13+ built-in) instead of `uuid_generate_v4()` per plan note — more reliable in Supabase cloud.
- `vector` extension enabled with `CREATE EXTENSION IF NOT EXISTS vector` (pgvector).
- `tracking_token` declared `UNIQUE` to guarantee link uniqueness.
- HNSW index created with `vector_l2_ops` — suitable for L2 (Euclidean) distance search; can be swapped to `vector_cosine_ops` for cosine similarity when embeddings are generated.
- RLS: `anon` role can INSERT; all roles can SELECT (full transparency — D-06).
- Added RLS + public SELECT policies on `concern_groups` and `concern_entity_links` as well.
- Added `CHECK` constraint on `status` enum (`pending | grouped | resolved | rejected`).

### Task 2 — Rate Limiting Middleware
- Module-level `Map<string, RateRecord>` used for in-memory rate limiting — appropriate for MVP single-process deployment.
- Rate-limited routes: `/submit`, `/api/submit*`, `/actions/submitConcern`.
- IP extracted from `x-forwarded-for` header (Vercel standard) with fallback to `request.ip`.
- Auth pass-through: custom_access_token and Supabase sessions are handled entirely by `createClient()` in server components — no JWT inspection needed in middleware for MVP.
- Middleware matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and image assets for performance.

### Task 3 — Server Action
- Length validation: 10–5000 chars (prevents empty spam and oversized payloads).
- Error messages match UI-SPEC copy verbatim: `"Failed to publish. Please check your connection and try again."`.
- Returns `{ success: true, trackingToken }` or `{ success: false, error }` discriminated union — caller decides redirect vs. error display.

### Task 4 — Submission UI (`/submit`)
- Client Component (`'use client'`) using `useTransition` for non-blocking submission.
- Character counter with `{count} / 5,000` display.
- Button disabled when `content.trim().length < 10` (matches server validation floor).
- Loading spinner (CSS `animate-spin`) during pending state.
- Focus ring uses `oklch(0.205 0 0 / 0.08)` shadow — matches the accent color from UI-SPEC.
- Error state uses destructive color `oklch(0.577 0.245 27.325)` per spec.

### Task 5 — Track Page (`/track/[uuid]`)
- UUID format validated with regex before DB query — avoids DB round-trip for malformed URLs.
- `notFound()` returned for both missing concerns and malformed UUIDs.
- Status displayed as color-coded badge with dot indicator (pending/grouped/resolved/rejected).
- Date formatted in IST timezone with `Intl.DateTimeFormat`.
- Token displayed in full monospaced font for copy-pasting.
- `params` typed as `Promise<{ uuid: string }>` (Next.js 16 async params pattern).

### Task 6 — Concerns Feed (`/concerns`)
- `export const revalidate = 60` — ISR revalidation every 60 seconds (avoids SSR on every request, reduces DB load).
- Magazine-style `auto-fill` CSS Grid with `minmax(300px, 1fr)` — responsive without breakpoint media queries.
- `ConcernCard` truncates content at 220 chars with `…` suffix.
- Short token `#XXXXXXXX` displayed for visual identification without exposing the full UUID.
- Empty state copy exactly matches UI-SPEC: `"No Concerns Published Yet"` / `"Be the first to raise an issue…"`.
- Stats bar shows live count of published concerns.

---

## Files Created / Modified

| File | Type | Action |
|------|------|--------|
| `supabase/migrations/20260721100000_add_concerns.sql` | SQL Migration | Created |
| `frontend/src/middleware.ts` | TypeScript | Created |
| `frontend/src/app/actions/submitConcern.ts` | Server Action | Created |
| `frontend/src/app/submit/page.tsx` | React Page | Created |
| `frontend/src/app/track/[uuid]/page.tsx` | React Page | Created |
| `frontend/src/app/concerns/page.tsx` | React Page | Created |

---

## Deviations from Plan

| Item | Plan Said | Actual | Reason |
|------|-----------|--------|--------|
| `uuid_generate_v4()` | Use uuid_generate_v4 | Used `gen_random_uuid()` | Plan notes explicitly preferred this (PG13+ built-in, no extension needed) |
| Middleware auth | Explicitly handle custom_access_token in middleware | Pass-through only | User rules note: auth handled by `createClient()`. Adding JWT parsing to middleware would duplicate logic and risk bugs. |
| Track page params | `{ params: { uuid: string } }` | `{ params: Promise<{ uuid: string }> }` | Next.js 16 (App Router) requires `await params` — sync params causes deprecation warning |

---

## Acceptance Criteria Verification

- [x] `supabase/migrations/20260721100000_add_concerns.sql` exists with `CREATE TABLE IF NOT EXISTS concerns`, `vector(1536)`, HNSW index, and `CREATE POLICY` statements
- [x] `frontend/src/middleware.ts` returns HTTP 429 when limits exceeded
- [x] `frontend/src/app/actions/submitConcern.ts` exports async `submitConcern` calling `.insert()` and returning UUID
- [x] `frontend/src/app/submit/page.tsx` renders `<form>`, includes textarea, redirects to `/track/` on success
- [x] `frontend/src/app/track/[uuid]/page.tsx` executes `.select().eq('tracking_token', uuid)` query
- [x] `frontend/src/app/concerns/page.tsx` fetches all concerns ordered by `created_at` desc

---

## Verification Steps (Manual)

1. Run `npm run dev` in `frontend/`.
2. Navigate to `http://localhost:3000/submit` — form loads with textarea and black button.
3. Enter ≥10 characters and click "Submit Concern" — observe loading state, then redirect to `/track/[uuid]`.
4. Verify the tracking page shows correct content, status badge, and IST timestamp.
5. Navigate to `http://localhost:3000/concerns` — concern appears in the magazine grid.
6. Apply the migration to Supabase: `supabase db push` or paste SQL into Supabase SQL Editor.
7. Rate limit test: submit 6+ rapid requests to `/submit` — 6th should receive 429.

---

## Git Commits Made

```
3538d9b  feat(3-01): add concerns, concern_groups, concern_entity_links schema with pgvector HNSW index and RLS
e8c7ac8  feat(3-01): add IP-based rate limiting middleware (5 req/min) for submit routes
1f97bb7  feat(3-01): add submitConcern server action with validation and tracking token return
d8b99e9  feat(3-01): add /submit page with textarea, char counter, and stark-black CTA
7384bb4  feat(3-01): add /track/[uuid] async Server Component with status badge and meta display
2fbd6c4  feat(3-01): add /concerns public feed with magazine multi-column grid and empty/error states
```

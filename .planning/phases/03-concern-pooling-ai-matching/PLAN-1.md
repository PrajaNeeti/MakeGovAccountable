---
wave: 1
depends_on: []
files_modified:
  - "supabase/migrations/20260721100000_add_concerns.sql"
  - "frontend/src/middleware.ts"
  - "frontend/src/app/submit/page.tsx"
  - "frontend/src/app/track/[uuid]/page.tsx"
  - "frontend/src/app/concerns/page.tsx"
  - "frontend/src/app/actions/submitConcern.ts"
autonomous: true
truths:
  - "D-01: Allow anonymous submissions (no login required) to minimize friction."
  - "D-02: Implement strict IP-based rate limiting to prevent spam and abuse."
  - "D-03: Adapt user profiles to work via a unique tracking link token or local session since there is no persistent user account."
  - "D-06: All submitted concerns are Public by default to ensure full transparency."
---

# Phase 3 - Wave 1: Core Submission & Tracking

<must_haves>
- [ ] Database schema for concerns, concern_groups, concern_entity_links with pgvector extension enabled and HNSW index configured
- [ ] D-01: Allow anonymous submissions (no login required) to minimize friction — no authentication required for concern submission
- [ ] D-02: Implement strict IP-based rate limiting to prevent spam and abuse — middleware blocks >5 requests/min per IP with HTTP 429
- [ ] D-03: Adapt "user profiles" to work via a unique tracking link (tracking_token UUID) since there is no persistent user account
- [ ] D-06: All submitted concerns are Public by default to ensure full transparency — public feed at /concerns displays all submissions
- [ ] Next.js middleware implements IP-based rate limiting while preserving custom_access_token and legacy Supabase session logic
- [ ] Concern submission form page built using shadcn/ui and Light Mode styling
- [ ] Server action inserts concern and generates an anonymous tracking token
- [ ] Track page fetches and displays a specific concern by tracking UUID
- [ ] Public feed page displaying all submitted concerns
</must_haves>

## 1. Database Schema
<read_first>
- .planning/phases/03-concern-pooling-ai-matching/03-PATTERNS.md
</read_first>
<action>
Create a new Supabase migration file `supabase/migrations/20260721100000_add_concerns.sql` that:
- Enables the `vector` extension if not exists (`CREATE EXTENSION IF NOT EXISTS vector`).
- Creates `concerns` table with: `id` (uuid pk), `tracking_token` (uuid default uuid_generate_v4()), `content` (text), `embedding` (vector(1536)), `status` (text default 'pending'), `created_at` (timestampz).
- Creates an `HNSW` index on the `embedding` column for scalable vector similarity search (e.g., `CREATE INDEX ON concerns USING hnsw (embedding vector_l2_ops);`).
- Creates `concern_groups` table with: `id` (uuid pk), `title` (text), `description` (text), `created_at` (timestampz).
- Creates `concern_entity_links` table with: `concern_id` (uuid), `entity_type` (text), `entity_id` (uuid).
- Enables Row Level Security (RLS) on `concerns` and adds a policy allowing anonymous inserts: `CREATE POLICY "Enable anonymous inserts" on concerns for insert to anon with check (true);`
</action>
<acceptance_criteria>
- File `supabase/migrations/20260721100000_add_concerns.sql` exists and contains `CREATE TABLE IF NOT EXISTS concerns`, `vector(1536)`, HNSW index creation, and `CREATE POLICY` statements.
</acceptance_criteria>

## 2. Rate Limiting Middleware
<read_first>
- frontend/src/middleware.ts
- .planning/phases/03-concern-pooling-ai-matching/03-PATTERNS.md
</read_first>
<action>
Create or update `frontend/src/middleware.ts` to implement IP-based rate limiting:
- Define `middleware` function to intercept requests to `/submit` and `/actions/submitConcern`.
- Use an in-memory Map or Upstash Redis to track request counts by IP address (extracted from `request.ip` or `x-forwarded-for` headers).
- Block requests with a 429 NextResponse if they exceed 5 requests per minute per IP.
- Ensure any existing authentication logic for custom backend tokens (`custom_access_token`) and legacy Supabase sessions remains intact.
</action>
<acceptance_criteria>
- `frontend/src/middleware.ts` contains rate limiting logic that returns HTTP 429 when limits are exceeded.
</acceptance_criteria>

## 3. Server Action: Submit Concern
<read_first>
- frontend/src/app/actions/submitConcern.ts
- .planning/phases/03-concern-pooling-ai-matching/03-PATTERNS.md
</read_first>
<action>
Create `frontend/src/app/actions/submitConcern.ts` with a `submitConcern(content: string)` server action:
- Initialize the Supabase server client using `@supabase/ssr` or your existing lib utility.
- Insert a new row into the `concerns` table with the provided `content`.
- Return the database-generated `tracking_token` to the caller.
</action>
<acceptance_criteria>
- `frontend/src/app/actions/submitConcern.ts` exports an async function `submitConcern` that calls `.insert()` on the `concerns` table and returns a UUID.
</acceptance_criteria>

## 4. Submission UI
<read_first>
- frontend/src/app/submit/page.tsx
- .planning/phases/03-concern-pooling-ai-matching/03-UI-SPEC.md
</read_first>
<action>
Create `frontend/src/app/submit/page.tsx` for the concern submission page:
- Build a structured form using Next.js and standard React state.
- Include a Textarea for the concern content and a Submit Button styled with stark black background for high contrast.
- Call the `submitConcern` server action `onSubmit`.
- Upon successful submission, redirect the user to `/track/[tracking_token]`.
</action>
<acceptance_criteria>
- `frontend/src/app/submit/page.tsx` renders a `<form>`, includes a textarea input, and handles redirection to `/track/` on success.
</acceptance_criteria>

## 5. Track Profile UI
<read_first>
- frontend/src/app/track/[uuid]/page.tsx
- .planning/phases/03-concern-pooling-ai-matching/03-PATTERNS.md
</read_first>
<action>
Create `frontend/src/app/track/[uuid]/page.tsx` to display an anonymous user's submission:
- Make it an async Server Component that extracts `uuid` from `params`.
- Fetch the `concerns` record from Supabase where `tracking_token` equals `uuid`.
- Display the concern content and its current `status` (e.g., Pending, Grouped).
- Render a clear "Not Found" state if the token yields no matching records.
</action>
<acceptance_criteria>
- `frontend/src/app/track/[uuid]/page.tsx` executes a Supabase `.select().eq('tracking_token', uuid)` query and renders the concern data.
</acceptance_criteria>

</acceptance_criteria>

## 6. Public Concerns Feed
<read_first>
- frontend/src/app/concerns/page.tsx
- .planning/phases/03-concern-pooling-ai-matching/03-UI-SPEC.md
</read_first>
<action>
Create `frontend/src/app/concerns/page.tsx` for the public concerns feed:
- Make it an async Server Component that fetches all concerns from Supabase ordered by `created_at` descending.
- Display a list or grid of these concerns, fulfilling the requirement that all submitted concerns are Public by default.
- Include the concern content and its current status.
</action>
<acceptance_criteria>
- `frontend/src/app/concerns/page.tsx` executes a Supabase query to fetch all concerns and renders them in a list.
</acceptance_criteria>

<verification>
- Navigate to `/submit` locally to ensure the page loads and matches the UI spec.
- Run a test submission and confirm redirection to the `/track/[uuid]` URL.
- Verify in Supabase that the `concerns` table received the insertion with a valid tracking_token.
</verification>

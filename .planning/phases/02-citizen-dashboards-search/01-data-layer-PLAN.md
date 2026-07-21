---
wave: 1
depends_on:
  - 01-foundation-data-ingestion-skeleton
files_modified:
  - frontend/package.json
  - supabase/migrations/20260721000001_add_activities_spending.sql
  - frontend/src/lib/supabase/client.ts
  - frontend/src/lib/supabase/server.ts
  - frontend/src/app/actions/search.ts
  - frontend/src/app/actions/feed.ts
autonomous: true
---

# Phase 02: Data Layer & Actions

## Goal
Set up dependencies, database schema for Phase 2 data, Supabase clients, and server actions for global searching and infinite-scroll feeds.

## Verification Criteria
- Required frontend dependencies (Supabase) are installed.
- Supabase clients are successfully typed and implemented for SSR.
- Server actions correctly return typed data for search and feed queries.
- Migration file creates `activities` and `spending` tables with RLS.

## must_haves
- [ ] activities and spending tables created via migration
- [ ] Supabase clients implemented using @supabase/ssr
- [ ] search.ts returns cross-table results
- [ ] feed.ts supports offset/limit and filtering by branch, department, politician, keyword

## Tasks

```xml
<task>
  <action>
    Install frontend dependencies: `@supabase/ssr`, `@supabase/supabase-js`, and `react-intersection-observer`. Update the package.json file.
  </action>
  <read_first>
    - frontend/package.json
  </read_first>
  <acceptance_criteria>
    - The `frontend/package.json` file contains `@supabase/ssr`, `@supabase/supabase-js`, and `react-intersection-observer` in the `dependencies` block.
    - The packages resolve without conflict when installing.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create a new Supabase database migration file `supabase/migrations/20260721000001_add_activities_spending.sql` that creates two tables: `activities` (id, entity_id, title, description, date, type) and `spending` (id, department_id, amount, category, date, description). Include Row Level Security (RLS) policies allowing public read access. Additionally, add a `branch` column (e.g., 'Executive', 'Legislative', 'Judicial') to the relevant entities and modify the `roles` table `CHECK` constraint to allow purely Legislative roles (which may lack both `department_id` and `court_id`).
  </action>
  <read_first>
    - supabase/migrations/00000000000000_initial_schema.sql
    - .planning/phases/02-citizen-dashboards-search/02-PATTERNS.md
  </read_first>
  <acceptance_criteria>
    - The SQL migration file exists at `supabase/migrations/20260721000001_add_activities_spending.sql`.
    - The file contains `CREATE TABLE public.activities` and `CREATE TABLE public.spending` with UUID primary keys.
    - The migration adds `branch` filtering support and updates the check constraint on `roles` to support legislative roles.
    - Contains `ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;` and a read policy.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create `frontend/src/lib/supabase/client.ts` and `frontend/src/lib/supabase/server.ts` to initialize the Supabase client using `@supabase/ssr` methods `createBrowserClient` and `createServerClient`.
  </action>
  <read_first>
    - .planning/phases/02-citizen-dashboards-search/02-PATTERNS.md
  </read_first>
  <acceptance_criteria>
    - `frontend/src/lib/supabase/client.ts` exports a function `createClient()` returning `createBrowserClient`.
    - `frontend/src/lib/supabase/server.ts` exports a function `createClient()` returning `createServerClient` with cookie handlers (get, set, remove).
  </acceptance_criteria>
</task>

<task>
  <action>
    Create a Server Action file `frontend/src/app/actions/search.ts` with a function `globalSearch(query: string)` that performs a query against `politicians`, `departments`, and `courts` tables using the Supabase server client and returns a combined array of typed search results.
  </action>
  <read_first>
    - frontend/src/lib/supabase/server.ts
    - .planning/phases/02-citizen-dashboards-search/02-PATTERNS.md
  </read_first>
  <acceptance_criteria>
    - `frontend/src/app/actions/search.ts` contains `"use server"` directive.
    - Function `globalSearch` is exported, accepts a string, and returns an array of results with `id`, `name`, `type`, and `url` properties.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create a Server Action file `frontend/src/app/actions/feed.ts` with a function `getUnifiedFeed(page: number, limit: number, filters?: { branch?: string, department?: string, politician?: string, keyword?: string })` that fetches and combines rows from `activities` and `spending` tables using `offset` and `limit` for infinite scrolling, while applying the optional filters.
  </action>
  <read_first>
    - frontend/src/lib/supabase/server.ts
  </read_first>
  <acceptance_criteria>
    - `frontend/src/app/actions/feed.ts` contains `"use server"` directive.
    - Function `getUnifiedFeed` executes queries via the server client with `.range()` derived from `page` and `limit`, and uses `.eq()` or `.ilike()` to apply any provided filters (branch, department, politician, keyword).
    - Returns an array of feed items sorted by date descending.
  </acceptance_criteria>
</task>
```

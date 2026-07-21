# Phase 1: Foundation & Data Ingestion Skeleton - Context

**Gathered:** 2026-07-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Initializing the Next.js foundation, setting up the PostgreSQL database schema for tracking government entities, and proving out a basic AI data ingestion flow.

</domain>

<decisions>
## Implementation Decisions

### Database & ORM Strategy
- **D-01:** Use the Supabase client natively to interact with PostgreSQL.
- **D-02:** Use Temporal tracking for core entities — keep history of all changes (e.g., when a politician changes roles).
- **D-03:** Auto-generate TypeScript types using the Supabase CLI.
- **D-04:** Use a Node.js seed script with Faker.js for local development seeding.
- **D-05:** Use a single 'Role' table with start/end dates linking Politicians to any government entity.
- **D-06:** Use UUIDs (v4) for database ID generation.
- **D-07:** Implement Full Row Level Security (RLS) from day one with strict public/admin policies.
- **D-08:** Store user roles in a separate public `users` table synced with `auth.users` via triggers.

### AI Extraction Stack
- **D-09:** Use Scrapling for web scraping and support a configurable selection of APIs (Gemini, OpenAI, Anthropic, OpenRouter).
- **D-10:** Configure the active AI provider via environment variables at deploy-time.
- **D-11:** Save raw extraction data (HTML/text) to the database for manual review in case of failures.
- **D-12:** Build the AI extraction logic as a custom Python backend.
- **D-13:** Python script acts as a background worker and writes directly to the Supabase Postgres database.
- **D-14:** Use `uv` for Python dependency management.
- **D-15:** Force the AI to output strictly typed JSON that matches the Postgres schema before writing to DB.
- **D-16:** Keep the Python code in a separate directory within the same monorepo (e.g., `/backend` or `/scraper`).

### Styling Framework
- **D-17:** Use `shadcn/ui` + Tailwind CSS for the frontend UI.
- **D-18:** Build Light Mode first; defer dark mode.
- **D-19:** Configure Tailwind with variables aimed at an editorial/modern media look, emphasizing clean structure and readability over heavy glassmorphism.
- **D-20:** Typography: Serif headings (e.g., Playfair Display) and Sans-serif body (e.g., Inter/Roboto).

### Citizen Auth Flow & Access
- **D-21:** Implement a strict two-role system: Public/Guest (read-only access to `public=true` data) and Admin (full access to all data, including backend processing logs).

### the agent's Discretion
- Exact naming of tables (other than Role, Politicians, Departments, Courts).
- Component structure for the initial public and admin dashboards.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (New project)

### Established Patterns
- None (New project)

### Integration Points
- None (New project)

</code_context>

<specifics>
## Specific Ideas

- The UI should have an "editorial looking website with an easy to read interface and something that looks like modern media."
- Security is tight: Backend data being processed is critical to the security of the platform and MUST NOT be open to the public, hence the strict 2-role system.

</specifics>

<deferred>
## Deferred Ideas

- Dark mode support (to be added in a later phase).

</deferred>

---

*Phase: 01-foundation-data-ingestion-skeleton*
*Context gathered: 2026-07-21*

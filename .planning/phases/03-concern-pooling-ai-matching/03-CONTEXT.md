# Phase 3: Concern Pooling & AI Matching - Context

**Gathered:** 2026-07-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Develop the user submission flow for concerns and petitions. Implement the AI matching logic to connect user concerns with database entities. Adapt user profile pages to support anonymous tracking.

</domain>

<decisions>
## Implementation Decisions

### Citizen Authentication & Submission
- **D-01:** Allow anonymous submissions (no login required) to minimize friction.
- **D-02:** Implement strict IP-based rate limiting to prevent spam and abuse.
- **D-03:** Adapt "user profiles" to work via a unique tracking link, token, or local session since there is no persistent user account.

### AI Matching Experience
- **D-04:** Use fast semantic clustering on submission to show instant potential matches to the user.
- **D-05:** Run a periodic backend LLM job to deeply analyze and group problems over time.

### Concern Privacy & Transparency
- **D-06:** All submitted concerns are Public by default to ensure full transparency.

### Concern Grouping & Moderation
- **D-07:** The AI suggests groupings, but merging similar concerns into a master petition is done manually by Moderators.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None.

### Established Patterns
- From Phase 1: `shadcn/ui` + Tailwind CSS (Light Mode, editorial look).
- From Phase 1: Custom Python backend for AI jobs (can be reused for the periodic LLM grouping job).
- From Phase 1: Supabase natively for Postgres database.

### Integration Points
- Next.js frontend needs an IP rate-limiting mechanism (e.g., via middleware or Redis).
- Python backend needs a new cron/worker task for the periodic LLM grouping.

</code_context>

<specifics>
## Specific Ideas

- None

</specifics>

<deferred>
## Deferred Ideas

- None

</deferred>

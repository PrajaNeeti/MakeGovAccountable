# Phase 4: Community Forums & Transparency Portal - Context

**Gathered:** 2026-07-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Create discussion forums tied to specific government actions, build the Transparency Portal (open-source docs, financial ledger), and finalize UI/UX polish and launch MVP.

</domain>

<decisions>
## Implementation Decisions

### Forum Creation
- **D-01:** Forums are User-initiated. A discussion thread is only created when a user clicks 'Start Discussion' to prevent empty ghost-town threads on every scraped action.

### Transparency Ledger Format
- **D-02:** Build a custom native Interactive UI data table fetching from the DB. It will take more time but feels properly integrated into the platform aesthetics.

### Forum Identity
- **D-03:** Use pseudonymous handles (auto-generated or user-chosen, e.g., 'Citizen_42') so participants can follow conversational threads while still protecting privacy.

### Moderation Approach
- **D-04:** Hybrid approach: Use a fast, lightweight moderation library (e.g., `bad-words`) for instant pre-filtering of obvious toxicity/profanity, and combine it with a user report-driven system for nuanced issues (like partisanship) which admins or AI can review later.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- From Phase 3: The anonymous submission flow with tracking links.

### Established Patterns
- From Phase 1: `shadcn/ui` + Tailwind CSS (Light Mode, editorial look).
- From Phase 1: Strict two-role system (Guest and Admin).
- From Phase 3: Fast semantic AI tasks and periodic backend grouping tasks.

### Integration Points
- Forums need to link to specific government entities, bills, or actions stored in the database.
- Transparency Ledger needs a DB table or schema to pull financial/funding data.

</code_context>

<specifics>
## Specific Ideas

- None

</specifics>

<deferred>
## Deferred Ideas

- None

</deferred>

---

*Phase: 04-community-forums-transparency-portal*
*Context gathered: 2026-07-21*

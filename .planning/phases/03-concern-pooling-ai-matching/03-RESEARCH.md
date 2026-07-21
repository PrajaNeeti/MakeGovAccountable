# Phase 3 Research: Concern Pooling & AI Matching

## 1. Overview & Goals
This phase focuses on allowing citizens to submit structured concerns anonymously, matching those concerns with existing database entities (policies, bills, court cases) or other concerns using AI, and providing a way for users to track their submissions.

## 2. Key Technical Areas to Plan

### A. Anonymous User Tracking & Submission (Next.js Frontend)
- **Tracking Mechanism:** Since authentication is not required (Decision D-01), the system must generate a unique identifier (UUID) upon the user's first submission. This token should be stored locally (e.g., `localStorage` or a strictly scoped cookie) and embedded in a tracking URL (e.g., `/track/[uuid]`).
- **Rate Limiting:** To prevent spam (Decision D-02), strict IP-based rate limiting is required. This should be planned in the Next.js Middleware. If using Vercel, integrating Upstash Redis is a common and robust pattern, or alternative edge-compatible rate limiting.
- **Submission Flow:** A structured form for the concern, which upon submission triggers the "fast semantic clustering" to show instant matches.

### B. Database Architecture (Supabase / Postgres)
- **Core Tables:**
  - `concerns`: Stores the raw submission, anonymous tracking token, and status. Must include a vector column (`pgvector`) to store embeddings for fast similarity search.
  - `concern_groups` (or `petitions`): Represents the master issues that moderators create by grouping individual concerns.
- **Entity Linking:** The matching engine needs to link concerns to ongoing policies, bills, or court cases. This requires mapping tables (e.g., `concern_entity_links`) to associate concerns with items ingested in Phase 2.

### C. AI Matching Engine (Python Backend & Supabase)
- **Real-Time Matching (D-04):** During submission, the frontend (or an API route) will generate an embedding for the user's text and perform a fast `pgvector` similarity search to instantly suggest existing concerns or government actions. 
- **Batch Grouping Job (D-05):** A cron task running on the Python backend that periodically fetches recent, ungrouped concerns. It will use an LLM to identify common themes, extract structured insights, and propose groupings.
- **Bias & Neutrality:** The prompt design for the LLM must strictly enforce neutrality, stripping out inflammatory language while preserving the core civic issue.

### D. Moderation & Transparency
- **Moderator Interface (D-07):** The AI only *suggests* groupings. The plan must include a basic moderator view to review suggested clusters and manually merge them into a master petition.
- **Public Visibility (D-06):** All concerns are public by default. The UI should display lists of concerns without exposing any sensitive PII (which shouldn't exist due to anonymity, but the LLM could optionally flag accidental PII in submissions).

## 3. Discrepancies & Considerations
- **UI Style Conflict:** `REQUIREMENTS.md` mentions "dark modes, glassmorphism", whereas `03-CONTEXT.md` explicitly references Phase 1's decision to use "Light Mode, editorial look". **Recommendation:** Follow the later decision from Phase 1 (`03-CONTEXT.md`) and stick to a clean, editorial Light Mode.
- **Database Search Integration:** Ensure the `pgvector` index configuration is planned (e.g., `ivfflat` or `hnsw` indexes) for scalable real-time matching.

## 4. Next Steps for Planning
When writing the Plan for Phase 3, ensure you define:
1. The Next.js routing structure for submission and anonymous profile tracking.
2. The exact Supabase schema additions (tables, `pgvector` columns, and RLS policies).
3. The architecture of the Next.js IP rate-limiting middleware.
4. The structure of the Python periodic background job for LLM clustering.

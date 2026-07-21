---
wave: 2
depends_on: ["PLAN-1.md"]
files_modified:
  - "frontend/src/app/submit/page.tsx"
  - "frontend/src/app/actions/submitConcern.ts"
  - "backend/app/jobs/concern_clustering.py"
  - "supabase/migrations/20260721100001_match_concerns_rpc.sql"
autonomous: true
truths:
  - "D-04: Use fast semantic clustering on submission to show instant potential matches to the user."
  - "D-05: Run a periodic backend LLM job to deeply analyze and group problems over time."
---

# Phase 3 - Wave 2: AI Matching & Clustering

<must_haves>
- [ ] D-04: Use fast semantic clustering on submission to show instant potential matches to the user — match_concerns RPC returns similar concerns and government entities in real time
- [ ] D-05: Run a periodic backend LLM job to deeply analyze and group problems over time — concern_clustering.py runs on a cron schedule
- [ ] Server action generates embeddings for concerns
- [ ] Real-time semantic matching surfaces similar concerns and relevant government entities to users during submission
- [ ] Python backend cron job periodically suggests groupings using an LLM (for manual moderator review) and links them to government entities
</must_haves>

## 1. AI Real-Time Embedding & Semantic Matching
<read_first>
- frontend/src/app/actions/submitConcern.ts
- frontend/src/app/submit/page.tsx
- supabase/migrations/20260721100000_add_concerns.sql
</read_first>
<action>
Create a new migration `supabase/migrations/20260721100001_match_concerns_rpc.sql` that defines a `match_concerns` Postgres RPC function to perform pgvector similarity search against other concerns AND against existing government entities (policies, bills, cases).
Update `frontend/src/app/actions/submitConcern.ts`:
- Create an action to generate an embedding for the user's input and call the `match_concerns` RPC to return similar existing concerns and relevant government entities.
- Update the submission flow so that before final insertion, the vector embedding is generated and inserted into the `concerns` table.
Update `frontend/src/app/submit/page.tsx`:
- Integrate the semantic matching action so that "instant potential matches" (both concerns and government actions) are surfaced to the user during the submission process, allowing them to see if their concern already exists.
</action>
<acceptance_criteria>
- Migration exists for `match_concerns` RPC.
- `frontend/src/app/actions/submitConcern.ts` contains code to call an embedding API and perform similarity search against concerns and entities.
- `frontend/src/app/submit/page.tsx` displays matching concerns and government entities to the user.
</acceptance_criteria>

## 2. Python Backend Clustering Job
<read_first>
- backend/app/jobs/concern_clustering.py
- .planning/phases/03-concern-pooling-ai-matching/03-PATTERNS.md
</read_first>
<action>
Create `backend/app/jobs/concern_clustering.py`:
- Write a function `group_concerns()` that queries Supabase for all concerns where `status = 'pending'`.
- Pass the batch of pending concerns to an LLM using the `openai` python package.
- Prompt the LLM to identify common themes, filter inflammatory language, and return proposed groups as structured JSON containing `title`, `description`, and a list of `concern_ids`.
- Prompt the LLM to also suggest relevant ongoing policies, bills, or court cases (entities ingested in Phase 2) that apply to the group based on vector search results.
- For each proposed group returned by the LLM, insert a row into `concern_groups` with a status indicating it is a "suggested" group for moderator review.
- Insert records into `concern_entity_links` to map each concern to its suggested `concern_group`, and to map the grouped concerns to the relevant government entities.
- DO NOT automatically update the `status` of the clustered `concerns` to 'grouped'. Leave the merging to be done manually by Moderators to satisfy the manual moderation requirement.
</action>
<acceptance_criteria>
- `backend/app/jobs/concern_clustering.py` contains a `group_concerns()` function that fetches from Supabase and calls an LLM API to group records and link them to government entities.
</acceptance_criteria>

<verification>
- Run python syntax check on `backend/app/jobs/concern_clustering.py`.
- Run typescript compilation `npm run build` in the `frontend` folder to ensure `submitConcern.ts` type checks successfully.
</verification>

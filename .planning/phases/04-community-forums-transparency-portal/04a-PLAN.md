---
wave: 1
depends_on: []
files_modified:
  - "supabase/migrations/*_phase4_forums.sql"
  - "frontend/src/app/actions/forumActions.ts"
  - "frontend/package.json"
autonomous: true
must_haves:
  - "discussions, forum_posts, moderation_reports tables exist"
  - "D-03: users table has pseudonym column to use pseudonymous handles"
  - "D-04: Hybrid approach: bad-words library is installed for pre-filtering, combined with user reports"
  - "forumActions.ts exports startDiscussion, createPost, reportPost"
---

# Phase 4a: Forum Database Schema & Core Server Actions

## Goal
Establish the backend infrastructure for community forums, including the database schema (with row-level security) and the server actions necessary for creating discussions, posting comments (with lightweight toxicity filtering), and reporting posts.

<threat_model>
- **SQL Injection / RLS Bypass:** High risk if RLS policies are missing on `discussions`, `forum_posts`, or `moderation_reports`. Mitigation: Implement strict RLS ensuring only authenticated actions.
- **Toxicity / Spam Injection:** Medium risk. Mitigation: Server-side validation using the `bad-words` library prior to inserting posts.
</threat_model>

## Tasks

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-PATTERNS.md</file>
    <file>supabase/migrations</file>
  </read_first>
  <action>
    Create a new Supabase migration file `supabase/migrations/[timestamp]_phase4_forums.sql`.
    Add `CREATE TABLE public.discussions` with columns `id` (UUID PRIMARY KEY), `activity_id` (TEXT or UUID depending on existing activity schema), and `created_at` (TIMESTAMPTZ).
    Add `CREATE TABLE public.forum_posts` with columns `id` (UUID PRIMARY KEY), `discussion_id` (UUID references discussions.id), `user_id` (UUID references auth.users or public.users), `content` (TEXT), `is_flagged` (BOOLEAN DEFAULT false), and `created_at` (TIMESTAMPTZ).
    Add `CREATE TABLE public.moderation_reports` with columns `id` (UUID PRIMARY KEY), `post_id` (UUID references forum_posts.id), `reported_by` (UUID), `reason` (TEXT), `status` (TEXT DEFAULT 'pending'), and `created_at` (TIMESTAMPTZ).
    Add `ALTER TABLE public.users ADD COLUMN pseudonym TEXT;` (if `public.users` exists, otherwise `auth.users`). 
    Enable RLS (`ENABLE ROW LEVEL SECURITY`) on all three new tables and add basic read/write policies.
  </action>
  <acceptance_criteria>
    Running `supabase db push` or `supabase migration up` succeeds.
    Checking the database schema via CLI or pgAdmin shows the new tables `discussions`, `forum_posts`, `moderation_reports` and the `pseudonym` column.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>frontend/package.json</file>
  </read_first>
  <action>
    Install the `bad-words` library and its types into the `frontend` workspace.
    Run `npm install bad-words` and `npm install -D @types/bad-words` within the `frontend/` directory.
  </action>
  <acceptance_criteria>
    `frontend/package.json` contains `bad-words` in dependencies.
    Importing `bad-words` in a TypeScript file does not throw a module resolution error.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>frontend/src/app/actions/submitConcern.ts</file>
    <file>.planning/phases/04-community-forums-transparency-portal/04-PATTERNS.md</file>
    <file>frontend/src/app/actions/forumActions.ts</file>
  </read_first>
  <action>
    Create `frontend/src/app/actions/forumActions.ts`.
    Implement `startDiscussion(activityId: string)`: Use Supabase client to check if a discussion for `activityId` exists. If not, insert one. Return the `discussionId`.
    Implement `createPost(discussionId: string, content: string)`: Use the `bad-words` library to check for profanity in `content`. If true, set `is_flagged = true`. Insert the post into `forum_posts`.
    Implement `reportPost(postId: string, reason: string)`: Insert a new row into `moderation_reports` with `status = 'pending'`.
  </action>
  <acceptance_criteria>
    `forumActions.ts` exports `startDiscussion`, `createPost`, and `reportPost`.
    `createPost` successfully flags messages containing profanity (e.g. by passing a known bad word in a test).
    Data successfully inserts into Supabase tables via these server actions.
  </acceptance_criteria>
</task>

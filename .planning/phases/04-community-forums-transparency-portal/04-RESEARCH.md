# Phase 4 Research: Community Forums & Transparency Portal

## 1. Objectives Overview
Based on the `04-CONTEXT.md` and `REQUIREMENTS.md`, Phase 4 focuses on:
- **Community Forums:** User-initiated discussions linked to specific government activities. Pseudonymous participation and a hybrid moderation approach.
- **Transparency Portal:** A dedicated UI data table that surfaces financial/spending data from the database.
- **UI/UX Polish:** Finalizing the application for an MVP launch.

## 2. Database Modifications
To support the new features, the following database schema changes will be required via a new Supabase migration:

### Forums Schema
- **`discussions` table:**
  - `id` (UUID, primary key)
  - `activity_id` (UUID, references `activities.id` or a generic `entity_id` for bills/actions)
  - `created_at` (TIMESTAMPTZ)
- **`forum_posts` table:**
  - `id` (UUID, primary key)
  - `discussion_id` (UUID, references `discussions.id`)
  - `user_id` (UUID, references `public.users.id`)
  - `content` (TEXT)
  - `is_flagged` (BOOLEAN, default false) - used by hybrid moderation
  - `created_at`, `updated_at` (TIMESTAMPTZ)

### Identity & Privacy (Decision D-03)
- **`users` table update:** Add a `pseudonym` column (TEXT) to `public.users` (e.g., "Citizen_42"). This can be auto-generated during sign-up or first forum interaction.

### Moderation (Decision D-04)
- **`moderation_reports` table:**
  - `id` (UUID, primary key)
  - `post_id` (UUID, references `forum_posts.id`)
  - `reported_by` (UUID, references `public.users.id`)
  - `reason` (TEXT)
  - `status` (TEXT, e.g., 'pending', 'resolved', 'dismissed')
  - `created_at` (TIMESTAMPTZ)

*(Note: The `spending` table already exists from Phase 1/2 and will be the data source for the Transparency Ledger)*

## 3. Server Actions & APIs
The following Next.js Server Actions will need to be implemented:

1. **`startDiscussion(activityId)`**: 
   - Fulfills **D-01**. Checks if a discussion exists for the activity. If not, creates one and returns the `discussionId`.
2. **`createPost(discussionId, content)`**:
   - Fulfills **D-04**. Integrates the lightweight `bad-words` library.
   - If the content contains profanity/toxicity, the action should either reject the submission immediately with a validation error or accept it but mark `is_flagged = true` for admin review (depending on exact UX preference).
3. **`reportPost(postId, reason)`**:
   - Allows citizens to flag nuanced issues (e.g., partisanship) to be added to `moderation_reports`.

## 4. Frontend Architecture
### 4.1 Transparency Ledger (Decision D-02)
- **Route:** `/transparency`
- **Implementation:** A custom native interactive UI data table using `shadcn/ui` `DataTable` (which leverages `@tanstack/react-table`).
- **Data Source:** Fetch data from the `spending` table (and potentially `activities`), with filtering and sorting capabilities.

### 4.2 Forum UI (Decisions D-01, D-03)
- **Route:** `/activities/[id]` (or similar entity page)
  - Needs a "Start Discussion" or "View Discussion" button.
- **Route:** `/forums/[discussionId]`
  - Displays the original activity context at the top.
  - Lists posts sequentially.
  - Shows author pseudonyms (`Citizen_42`) rather than real names or emails.
  - Includes a rich or plain text input for new posts.
  - Includes a "Report" button on each post for nuanced moderation issues.

### 4.3 Moderation Dashboard
- Extend the existing `/moderation` dashboard (built in Phase 3) to include a "Forum Reports" tab that lists rows from `moderation_reports` or `is_flagged = true` posts, allowing Admins to delete posts or ban users.

## 5. Next Steps for Planning
1. Draft the SQL migrations for `discussions`, `forum_posts`, `moderation_reports`, and adding `pseudonym` to `users`.
2. Define the page structures and required `shadcn/ui` components (e.g., Table, Button, Form, Toast for reports).
3. Select and add the `bad-words` (or similar) npm package.

## RESEARCH COMPLETE

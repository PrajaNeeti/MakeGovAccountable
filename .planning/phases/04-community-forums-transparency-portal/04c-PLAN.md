---
wave: 2
depends_on: ["04a-PLAN.md"]
files_modified:
  - "frontend/src/app/moderation/page.tsx"
  - "frontend/src/components/moderation/ForumReportsList.tsx"
  - "frontend/src/app/actions/moderateForum.ts"
autonomous: true
must_haves:
  - "Moderation actions resolveReport and dismissFlag exported"
  - "ForumReportsList component handles dismiss and delete"
  - "Moderation page fetches and displays forum reports alongside existing concerns"
---

# Phase 4c: Forum Moderation Dashboard

## Goal
Extend the existing moderation dashboard to support reviewing flagged forum posts and moderation reports.

<threat_model>
- **Unauthorized Access:** Medium risk. Mitigation: Ensure the moderation page and server actions have checks asserting the user has admin/moderator privileges.
</threat_model>

## Tasks

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-PATTERNS.md</file>
    <file>frontend/src/app/actions/moderateForum.ts</file>
  </read_first>
  <action>
    Create `frontend/src/app/actions/moderateForum.ts`.
    Implement `resolveReport(reportId: string, action: 'dismiss' | 'delete')`: Updates `moderation_reports` status to 'resolved'. If `action` is 'delete', it also deletes or soft-deletes the linked `forum_posts` row.
    Implement `dismissFlag(postId: string)`: Updates `forum_posts` setting `is_flagged = false`.
  </action>
  <acceptance_criteria>
    `resolveReport` correctly updates report status and handles the post deletion path.
    `dismissFlag` updates the post correctly.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>frontend/src/app/moderation/page.tsx</file>
    <file>frontend/src/components/moderation/ForumReportsList.tsx</file>
  </read_first>
  <action>
    Create `frontend/src/components/moderation/ForumReportsList.tsx`.
    Accept `reports` and `flaggedPosts` as props.
    Render two sections: "User Reports" and "AI Flagged Posts".
    Include "Dismiss" and "Delete Post" buttons for each item, wired to the server actions created in `moderateForum.ts`.
  </action>
  <acceptance_criteria>
    Component renders the lists of reports and flagged posts.
    Clicking "Dismiss" or "Delete" successfully triggers the server actions.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>frontend/src/app/moderation/page.tsx</file>
  </read_first>
  <action>
    Modify `frontend/src/app/moderation/page.tsx`.
    Update the server component to fetch:
    1. Rows from `moderation_reports` where `status = 'pending'`.
    2. Rows from `forum_posts` where `is_flagged = true`.
    Import and render `<ForumReportsList>` alongside the existing concern grouping moderation UI (e.g., using a shadcn `Tabs` component or placing it below the existing content).
  </action>
  <acceptance_criteria>
    Visiting `/moderation` shows both the existing concern groups and the new forum reports section.
    The page successfully fetches and passes the new data.
  </acceptance_criteria>
</task>

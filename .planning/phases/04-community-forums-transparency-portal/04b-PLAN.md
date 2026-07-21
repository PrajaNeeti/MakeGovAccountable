---
wave: 2
depends_on: ["04a-PLAN.md"]
files_modified:
  - "frontend/src/app/forums/[discussionId]/page.tsx"
  - "frontend/src/components/forums/discussion-thread.tsx"
  - "frontend/src/components/forums/create-post-form.tsx"
  - "frontend/src/components/UnifiedFeed.tsx"
autonomous: true
must_haves:
  - "Forums route handles discussionId dynamic parameter"
  - "Discussion thread component renders posts chronologically"
  - "Create post form submits successfully and clears"
  - "D-01: Unified feed includes Start Discussion button so forums are user-initiated"
---

# Phase 4b: Community Forums UI

## Goal
Build the frontend interfaces for citizens to start and participate in discussions pseudo-anonymously based on existing government actions.

<threat_model>
- **XSS (Cross-Site Scripting):** High risk if forum posts are rendered unsafely. Mitigation: Rely on React's automatic string escaping for `content` instead of using `dangerouslySetInnerHTML`.
- **Privacy Leak:** Medium risk of exposing real user names. Mitigation: Explicitly render `pseudonym` instead of raw user objects or emails.
</threat_model>

## Tasks

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-UI-SPEC.md</file>
    <file>frontend/src/app/actions/forumActions.ts</file>
    <file>frontend/src/components/forums/create-post-form.tsx</file>
  </read_first>
  <action>
    Create `frontend/src/components/forums/create-post-form.tsx`.
    Implement a form containing a textarea for `content` and a submit button.
    Wire the form submission to the `createPost` server action from `forumActions.ts`.
    Include standard loading states (e.g. disabling button while submitting) and clear the textarea on success.
  </action>
  <acceptance_criteria>
    Component renders a textarea and submit button.
    Entering text and clicking submit successfully invokes `createPost`.
    The textarea clears upon a successful post creation.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-UI-SPEC.md</file>
    <file>frontend/src/app/actions/forumActions.ts</file>
    <file>frontend/src/components/forums/discussion-thread.tsx</file>
  </read_first>
  <action>
    Create `frontend/src/components/forums/discussion-thread.tsx`.
    Accept a `posts` array prop (containing `id`, `content`, `pseudonym`, `created_at`).
    Render each post sequentially.
    Add a "Report" button to each post. Clicking it should prompt the user (using native `window.prompt` or a shadcn dialog) for a reason, and invoke `reportPost(postId, reason)`.
    Use copy: "Report User: Are you sure you want to flag this user's conduct?".
  </action>
  <acceptance_criteria>
    Component loops through `posts` and displays `pseudonym` and `content`.
    Clicking the Report button captures a reason string and correctly calls `reportPost`.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-UI-SPEC.md</file>
    <file>frontend/src/app/forums/[discussionId]/page.tsx</file>
  </read_first>
  <action>
    Create `frontend/src/app/forums/[discussionId]/page.tsx` as a Server Component.
    Fetch the discussion row and join `forum_posts` ordered by `created_at` ASC. (Join on `public.users` to fetch `pseudonym`).
    Render `<DiscussionThread posts={fetchedPosts} />` and `<CreatePostForm discussionId={discussionId} />`.
    If no posts exist, render empty state strings "No Discussion Yet" and "Be the first to start the conversation by discussing this action."
  </action>
  <acceptance_criteria>
    Visiting `/forums/<valid-discussion-uuid>` renders the posts in chronological order.
    The empty state correctly displays if zero posts are returned.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>frontend/src/components/UnifiedFeed.tsx</file>
    <file>frontend/src/app/actions/forumActions.ts</file>
  </read_first>
  <action>
    Modify `frontend/src/components/UnifiedFeed.tsx`.
    Add a "Start Discussion" button (using shadcn `<Button>`) to each item card rendered in the feed.
    Bind the button's `onClick` to invoke `startDiscussion(item.id)` and then use `next/navigation` `useRouter().push('/forums/' + newDiscussionId)` to navigate the user.
  </action>
  <acceptance_criteria>
    The unified feed displays a "Start Discussion" button on each item.
    Clicking the button redirects the user to the correct `/forums/[discussionId]` URL.
  </acceptance_criteria>
</task>

# Phase 4 Patterns: Community Forums & Transparency Portal

## 1. Database Migration: `supabase/migrations/<timestamp>_phase4_forums.sql`
- **Role:** Database Schema Setup
- **Data Flow:** DDL -> Postgres
- **Closest Analog:** `supabase/migrations/20260721100000_add_concerns.sql`

**Concrete Code Excerpt (Analog):**
```sql
CREATE TABLE IF NOT EXISTS public.concerns (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_token UUID       NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    content       TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;
```
**Notes:** Will create tables `discussions`, `forum_posts`, and `moderation_reports`. It will also add a `pseudonym` TEXT column to the `public.users` table.

## 2. Server Actions: `frontend/src/app/actions/forumActions.ts`
- **Role:** Server Actions (Data Mutation & Validation)
- **Data Flow:** Client Component -> Server Action -> Database
- **Closest Analog:** `frontend/src/app/actions/submitConcern.ts`

**Concrete Code Excerpt (Analog):**
```typescript
'use server';
import { createClient } from '@/lib/supabase/server';

export async function submitConcern(content: string): Promise<SubmitConcernResult> {
  const trimmed = content?.trim();
  if (!trimmed || trimmed.length < 10) {
    return { success: false, error: 'Concern must be at least 10 characters long.' };
  }
  
  const supabase = await createClient();
  const { data, error } = await supabase.from('concerns').insert({ content: trimmed }).select('tracking_token').single();
  
  if (error) return { success: false, error: 'Failed to publish.' };
  return { success: true, trackingToken: data.tracking_token as string };
}
```
**Notes:** We will add `startDiscussion(activityId)`, `createPost(discussionId, content)` (which integrates `bad-words` check), and `reportPost(postId, reason)`.

## 3. Transparency Portal Page: `frontend/src/app/transparency/page.tsx`
- **Role:** Page Route (Server Component)
- **Data Flow:** Supabase DB -> Server Component -> Client UI
- **Closest Analog:** `frontend/src/app/moderation/page.tsx` (Data fetching pattern)

**Concrete Code Excerpt (Analog):**
```typescript
export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: groups, error: groupsError } = await supabase
    .from('concern_groups')
    .select('*')
    .eq('status', 'suggested')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-8 lg:p-12 max-w-5xl">
       {/* Rendering the data */}
    </div>
  );
}
```
**Notes:** Will fetch financial/funding data from the `spending` table and pass it to a client-side DataTable component.

## 4. Spending Table Component: `frontend/src/components/transparency/spending-table.tsx`
- **Role:** Client UI Component (DataTable)
- **Data Flow:** Props -> Rendered Table with Sort/Filter
- **Closest Analog:** `frontend/src/components/UnifiedFeed.tsx` (or standard `shadcn/ui` table)

**Concrete Code Excerpt (Analog):**
```typescript
'use client';
import { useState } from 'react';

export function UnifiedFeed({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="p-4 border rounded shadow-sm">...</div>
      ))}
    </div>
  );
}
```
**Notes:** This will be a heavily interactive `shadcn/ui` `<DataTable>` wrapping `@tanstack/react-table` for displaying and filtering spending records.

## 5. Forums Thread Page: `frontend/src/app/forums/[discussionId]/page.tsx`
- **Role:** Page Route (Server Component)
- **Data Flow:** DB (Fetching Posts) -> UI
- **Closest Analog:** Standard Next.js Dynamic Route (e.g. `[id]` structures).

**Notes:** Retrieves a specific discussion, validating that it exists. Fetches all related `forum_posts` (ordered chronologically) along with the `pseudonym` of the users who posted them.

## 6. Forum UI Components: `frontend/src/components/forums/discussion-thread.tsx` & `create-post-form.tsx`
- **Role:** Interactive Client Components
- **Data Flow:** User Input -> Server Action -> UI Optimistic Update
- **Closest Analog:** Feedback forms / Submission patterns.

**Notes:** Need lightweight components to render individual posts, flag/report them, and a text area to reply. Submissions will trigger the `createPost` action and instantly display via Next.js router refreshes or optimistic UI.

## 7. Moderation Dashboard Updates: `frontend/src/app/moderation/page.tsx`
- **Role:** Admin UI Update
- **Data Flow:** DB (`moderation_reports`) -> Moderation UI
- **Closest Analog:** Existing `ModerationPage` structure

**Notes:** We will extend the existing Moderation Dashboard (which currently shows concern groupings) to add a new section or tab for "Forum Reports". Admins will be able to review flagged posts (`is_flagged = true` or entries in `moderation_reports`), and either delete the post or dismiss the report.

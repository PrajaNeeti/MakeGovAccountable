# Phase 3: Concern Pooling & AI Matching - Patterns

This document maps the architectural files to be created or modified based on the context and research for Phase 3.

## 1. frontend/src/app/submit/page.tsx
- **Role:** Concern submission form UI allowing anonymous users to submit their civic concerns.
- **Data Flow:** Collects user input (text, category) and calls a server action (`submitConcern.ts`) to save to Supabase. Fast semantic clustering results are then displayed.
- **Closest Analog:** `frontend/src/app/page.tsx` (for layout styling and basic React component structure).
- **Code Excerpt (Analog Pattern):**
  ```tsx
  export default function SubmitConcernPage() {
    // Form state and submission handler
    return (
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Submit a Concern</h1>
        {/* Form fields */}
      </main>
    );
  }
  ```

## 2. frontend/src/app/track/[uuid]/page.tsx
- **Role:** Anonymous user profile/tracking page for a specific submission.
- **Data Flow:** Fetches the specific concern from Supabase using the provided UUID in the URL path.
- **Closest Analog:** `frontend/src/app/dashboards/page.tsx` (for data fetching and display).
- **Code Excerpt (Analog Pattern):**
  ```tsx
  import { createClient } from '@/lib/supabase/server';
  
  export default async function TrackConcernPage({ params }: { params: { uuid: string } }) {
    const supabase = await createClient();
    const { data: concern } = await supabase.from('concerns').select('*').eq('tracking_id', params.uuid).single();
    // Render concern details and status
  }
  ```

## 3. frontend/src/middleware.ts
- **Role:** Next.js middleware for IP rate limiting and auth handling.
- **Data Flow:** Intercepts requests, particularly to the submission route, validates IP request counts (e.g., using Upstash Redis or local memory), and blocks if the limit is exceeded. Also handles custom backend tokens per user rules.
- **Closest Analog:** *New File* (No existing middleware analog, but relies on Next.js `NextRequest` and `NextResponse` patterns).
- **Code Excerpt (Planned Pattern):**
  ```typescript
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';

  export function middleware(request: NextRequest) {
    // Implement IP rate limiting logic
    // Verify auth if custom tokens are present
    return NextResponse.next();
  }
  ```

## 4. frontend/src/app/actions/submitConcern.ts
- **Role:** Server action to handle the submission of a concern and trigger fast semantic clustering.
- **Data Flow:** Receives form data, generates an embedding (via OpenAI API or local model), performs a `pgvector` similarity search via Supabase RPC, and inserts the new concern.
- **Closest Analog:** `frontend/src/app/actions/search.ts`
- **Code Excerpt (Analog Pattern):**
  ```typescript
  'use server';
  import { createClient } from '@/lib/supabase/server';

  export async function submitConcern(content: string) {
    const supabase = await createClient();
    // 1. Generate embedding
    // 2. Perform similarity search (fast clustering)
    // 3. Insert concern
  }
  ```

## 5. supabase/migrations/20260721XXXXXX_add_concerns.sql
- **Role:** Database schema definitions for the concerns module.
- **Data Flow:** DDL to create `concerns`, `concern_groups`, `concern_entity_links` tables, enable `pgvector` extension if not present, and define RLS policies for anonymous submission.
- **Closest Analog:** `supabase/migrations/00000000000000_initial_schema.sql`
- **Code Excerpt (Analog Pattern):**
  ```sql
  create table if not exists concerns (
      id uuid primary key default uuid_generate_v4(),
      tracking_token uuid not null default uuid_generate_v4(),
      content text not null,
      embedding vector(1536),
      status text default 'pending',
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- RLS for anonymous inserts
  alter table concerns enable row level security;
  create policy "Enable anonymous inserts" on concerns for insert to anon with check (true);
  ```

## 6. backend/app/jobs/concern_clustering.py
- **Role:** Periodic background job for deep LLM-based clustering.
- **Data Flow:** Cron task that fetches ungrouped concerns from Postgres, calls an LLM to identify themes, and proposes `concern_groups` in the database.
- **Closest Analog:** *New File* (First Python backend job introduced).
- **Code Excerpt (Planned Pattern):**
  ```python
  def group_concerns():
      # Fetch pending concerns from Supabase
      # Pass to LLM for theme extraction
      # Insert proposed groups and link concerns
      pass
  ```

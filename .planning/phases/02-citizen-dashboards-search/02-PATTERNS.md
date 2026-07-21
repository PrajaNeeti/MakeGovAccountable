# Phase 02: citizen-dashboards-search - Pattern Mapping

## 1. Database Expansion
- **File:** `supabase/migrations/2024XXXXXXXXXXXX_add_activities_spending.sql`
- **Role:** Database Schema (Migration)
- **Data Flow:** Extends the existing PostgreSQL schema to include tables for `activities` and `spending`, which are required for the unified feed and data visualization. 
- **Closest Analog:** `supabase/migrations/00000000000000_initial_schema.sql`
- **Analog Excerpt:**
  ```sql
  CREATE TABLE public.departments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      public BOOLEAN NOT NULL DEFAULT true
  );
  ```

## 2. Supabase Next.js Client
- **File:** `frontend/src/lib/supabase/client.ts` and `frontend/src/lib/supabase/server.ts`
- **Role:** Data Layer (Utility)
- **Data Flow:** Initializes `@supabase/ssr` to fetch data from Supabase across Client and Server Components for the public Guest view (dashboard).
- **Closest Analog:** None strictly analogous in `src/lib/`. 

## 3. Global Search Server Action
- **File:** `frontend/src/app/actions/search.ts`
- **Role:** Server Action (Backend Logic)
- **Data Flow:** Executes PostgreSQL full-text search (via Supabase client) across `politicians`, `departments`, and `courts` tables based on a user query string. Returns structured data to the Omnibar.
- **Closest Analog:** None strictly exists in this layer yet.

## 4. Omnibar Search UI
- **File:** `frontend/src/components/OmnibarSearch.tsx`
- **Role:** Client Component (UI)
- **Data Flow:** Resides in the global header, triggers `search.ts` server action on keystroke with debounce, and displays live typeahead results using a popover or command menu.
- **Closest Analog:** `frontend/src/components/ui/button.tsx` (for standard shadcn/tailwind component structure)
- **Analog Excerpt:**
  ```tsx
  import { cn } from "@/lib/utils"
  // ...
  export function Button({ className, variant = "default", size = "default", ...props }) {
    return (
      <ButtonPrimitive className={cn(buttonVariants({ variant, size, className }))} {...props} />
    )
  }
  ```

## 5. Unified Feed Component
- **File:** `frontend/src/components/UnifiedFeed.tsx`
- **Role:** Client Component (Data Presentation)
- **Data Flow:** Fetches combined data (activities, spending, role updates) using infinite scrolling logic (e.g., via `react-intersection-observer` and Supabase offset queries).
- **Closest Analog:** `frontend/src/components/ui/button.tsx` (for functional component pattern and styling).

## 6. Dashboard Charts Component
- **File:** `frontend/src/components/DashboardCharts.tsx`
- **Role:** Client Component (Data Visualization)
- **Data Flow:** Receives aggregated spending/activity data and uses `recharts` to render interactive SVG charts.
- **Closest Analog:** `frontend/src/components/ui/button.tsx` (as a standard wrapper component).

## 7. Main Dashboard Page
- **File:** `frontend/src/app/dashboards/page.tsx`
- **Role:** Server Component (Page Route)
- **Data Flow:** Serves as the primary public entry point for Phase 2. Instantiates the `UnifiedFeed`, `DashboardCharts`, and fetches initial server-side data for fast First Contentful Paint.
- **Closest Analog:** `frontend/src/app/page.tsx`
- **Analog Excerpt:**
  ```tsx
  export default function Home() {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-background text-foreground font-sans p-8">
        <main className="flex flex-col max-w-3xl items-center text-center gap-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-heading">MakeGovAccountable</h1>
  //...
  ```

## 8. Frontend Dependencies
- **File:** `frontend/package.json`
- **Role:** Configuration
- **Data Flow:** Updated to include `@supabase/ssr`, `@supabase/supabase-js`, `recharts`, and `react-intersection-observer`.

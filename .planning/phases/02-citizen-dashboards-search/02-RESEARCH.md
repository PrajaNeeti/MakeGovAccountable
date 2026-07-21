# Phase 2: Citizen Dashboards & Search - Research

## Technical Constraints & Considerations
- **Data Access:** Phase 1 established a Supabase PostgreSQL database with tables `politicians`, `departments`, `courts`, `roles`, `users`, and `extraction_logs`. RLS policies are in place to only allow public access where `public = true`.
- **Frontend Stack:** Next.js 15 (App Router), Tailwind CSS (v4), `shadcn/ui`, and Lucide icons are configured.
- **Styling:** Editorial/modern media vibe using `Inter` for body text and `Playfair Display` for headings. Light mode only for now.
- **Authentication:** Dual-token auth is checked in `middleware.ts`. Citizen auth is deferred, meaning the dashboard should primarily support unauthenticated (Guest) access.
- **API Routes:** The Phase 2 context mentions integrating with "PostgreSQL API routes built in Phase 1". However, inspection of the codebase reveals that no Next.js API routes or server actions were actually built in Phase 1 (only the database schema and a Python ingestion script). 

## Architectural Implications
- **Dashboards & Unified Feed:** The unified feed requires querying `roles`, `politicians`, `departments`, and `courts` concurrently. A SQL view or complex Supabase join will be needed to fetch this effectively for an infinite scroll unified feed.
- **Data Visualizations:** Recharts (or a similar interactive charting library) will be used for visualizations for spending/activities.
- **Missing Data Models:** The current Phase 1 schema ONLY covers government entities and roles. It lacks tables for `spending` (e.g., budgets, grants) and `activities` (e.g., bills, court cases, executive orders). We must either expand the database schema in this phase to store this data or mock it in the frontend for now.
- **Global Search:** Implementing an omnibar with live typeahead means we need a backend endpoint or server action that performs full-text search across multiple tables (`politicians`, `departments`, `courts`) efficiently. 
- **Infinite Scroll:** Will require data pagination (`limit/offset` or cursor-based via Supabase) combined with a client-side mechanism (e.g., `IntersectionObserver`).

## Patterns to Follow
- **UI Components:** Continue using `shadcn/ui` for primitives (e.g., input, button, dialog/command for omnibar, cards for feed items).
- **Styling:** Adhere to `globals.css` variable structures emphasizing a clean, editorial look with high readability over heavy glassmorphism.
- **Database Access:** Respect the established Row Level Security (RLS) policies and `public` flags when fetching data.

## Actionable Insights for Planner
1. **Database Expansion:** Explicitly plan a new Supabase migration to add tables for `activities` and `spending` (or define how to mock this data), as these are required for the unified feed and data visualizations but were not created in Phase 1.
2. **Supabase Client Setup:** Plan the installation and setup of `@supabase/ssr` or `@supabase/supabase-js` in the Next.js app, as well as the necessary environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), to facilitate data fetching.
3. **Search Mechanism:** Plan a dedicated Server Action or API route to handle the unified search query across multiple tables to feed the live typeahead omnibar effectively. Consider using PostgreSQL's full-text search capabilities.
4. **Dependencies:** Plan to add `recharts` for charting and `react-intersection-observer` (or similar) to handle infinite scrolling behavior.
5. **Component Architecture:**
    - `OmnibarSearch`: A client component in the global layout header.
    - `UnifiedFeed`: A client component utilizing infinite scroll and displaying activity/spending updates.
    - `DashboardCharts`: Client components wrapping `recharts` for data visualization.

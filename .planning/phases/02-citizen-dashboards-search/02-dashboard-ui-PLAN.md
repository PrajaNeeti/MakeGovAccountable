---
wave: 2
depends_on:
  - 02-citizen-dashboards-search/01-data-layer-PLAN
files_modified:
  - frontend/src/components/OmnibarSearch.tsx
  - frontend/src/components/DashboardCharts.tsx
  - frontend/src/components/UnifiedFeed.tsx
  - frontend/src/app/dashboards/page.tsx
  - frontend/src/app/layout.tsx
autonomous: true
---

# Phase 02: Dashboard UI

## Goal
Build the citizen dashboard frontend components, including the Omnibar search, infinite scrolling unified feed, and Recharts-based data visualizations, and integrate them into the global layout and dashboards page.

## Verification Criteria
- All client components render without errors.
- The Omnibar debounces input and fetches results using the server action.
- The UnifiedFeed triggers new fetches upon scrolling to the bottom.
- The shadcn chart visualizes data matching the UI SPEC visually.

## must_haves
- [ ] OmnibarSearch component created in global header
- [ ] DashboardCharts renders a shadcn Chart
- [ ] UnifiedFeed utilizes infinite scroll fetching
- [ ] UnifiedFeed includes UI controls for filtering by branch, department, and politician
- [ ] Main dashboard page aggregates feed and charts

## Tasks

```xml
<task>
  <action>
    Run the shadcn CLI to install required UI components: `npx shadcn@latest add input command dialog card chart`.
  </action>
  <read_first>
  </read_first>
  <acceptance_criteria>
    - The CLI command completes successfully.
    - The components `input.tsx`, `command.tsx`, `dialog.tsx`, `card.tsx`, and `chart.tsx` exist in `frontend/src/components/ui`.
  </acceptance_criteria>
</task>
<task>
  <action>
    Create the `OmnibarSearch` Client Component at `frontend/src/components/OmnibarSearch.tsx` that includes a text input, handles keystrokes with a 300ms debounce, calls the `globalSearch` server action, and displays a dropdown of results with links.
  </action>
  <read_first>
    - frontend/src/app/actions/search.ts
    - .planning/phases/02-citizen-dashboards-search/02-UI-SPEC.md
  </read_first>
  <acceptance_criteria>
    - Contains `"use client"`.
    - Returns an input element utilizing a search icon (e.g., from `lucide-react`).
    - Displays list of results or an empty state string matching the UI SPEC exactly: `We couldn't find any activities matching your search criteria. Try adjusting your filters.` (or `No Dashboard Data Found`).
  </acceptance_criteria>
</task>

<task>
  <action>
    Create the `DashboardCharts` Client Component at `frontend/src/components/DashboardCharts.tsx` utilizing the official shadcn `chart` component to render a `BarChart` or `LineChart` for the `spending` and `activities` data.
  </action>
  <read_first>
    - .planning/phases/02-citizen-dashboards-search/02-UI-SPEC.md
  </read_first>
  <acceptance_criteria>
    - Contains `"use client"`.
    - Imports and utilizes `ChartContainer`, `ChartTooltip`, and other required elements from `frontend/src/components/ui/chart.tsx` along with necessary `recharts` components.
    - Renders a chart that consumes a `data` array prop and respects the design system's Oklch colors defined in UI SPEC using shadcn chart config.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create the `UnifiedFeed` Client Component at `frontend/src/components/UnifiedFeed.tsx` that includes UI controls (e.g., dropdowns, toggle buttons) for filtering by branch, department, politician, and keyword. It should accept initial feed items and initial filters as props, render them, and use `react-intersection-observer` (or a standard scroll listener) to call the `getUnifiedFeed` action with the active filters to append more items when the bottom is reached or fetch new items when filters change.
  </action>
  <read_first>
    - frontend/src/app/actions/feed.ts
    - .planning/phases/02-citizen-dashboards-search/02-UI-SPEC.md
  </read_first>
  <acceptance_criteria>
    - Contains `"use client"`.
    - Renders filtering UI controls (branch, department, politician, keyword) and updates state or URL parameters on change.
    - Manages `items` state, fetching new results from `getUnifiedFeed` with active filters when filters change, or appending when scrolled.
    - Renders a loader element at the bottom that acts as the intersection target.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create the Main Dashboard Page Server Component at `frontend/src/app/dashboards/page.tsx` that reads search parameters for initial filters, fetches the first page of feed data using `getUnifiedFeed` with those filters, fetches initial chart data, and renders `DashboardCharts` and `UnifiedFeed`.
  </action>
  <read_first>
    - frontend/src/app/actions/feed.ts
    - frontend/src/components/UnifiedFeed.tsx
    - frontend/src/components/DashboardCharts.tsx
  </read_first>
  <acceptance_criteria>
    - Exports a default async function `DashboardsPage`.
    - Fetches server-side data on load without relying on `useEffect`, passing any URL search parameters as filters to `getUnifiedFeed`.
    - Renders `<DashboardCharts data={...} />` and `<UnifiedFeed initialItems={...} initialFilters={...} />`.
  </acceptance_criteria>
</task>

<task>
  <action>
    Update the global layout at `frontend/src/app/layout.tsx` to include the `OmnibarSearch` component in the main header area.
  </action>
  <read_first>
    - frontend/src/app/layout.tsx
    - frontend/src/components/OmnibarSearch.tsx
  </read_first>
  <acceptance_criteria>
    - `frontend/src/app/layout.tsx` imports `OmnibarSearch`.
    - `<OmnibarSearch />` is rendered inside the `<header>` or equivalent global top-navigation element of the layout.
  </acceptance_criteria>
</task>
```

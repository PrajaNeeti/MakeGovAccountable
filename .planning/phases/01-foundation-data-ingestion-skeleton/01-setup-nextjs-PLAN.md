---
wave: 1
depends_on: none
files_modified:
  - frontend/package.json
  - frontend/src/app/layout.tsx
  - frontend/src/app/page.tsx
  - frontend/tailwind.config.ts
  - frontend/src/middleware.ts
autonomous: true
requirements_addressed:
  - Initialize Next.js project with styling and authentication middleware
---

# Plan: Initialize Next.js and UI Framework

## Objective
Initialize the Next.js frontend with Tailwind CSS and shadcn/ui. Set up the authentication middleware at `frontend/src/middleware.ts` to support both custom backend tokens and legacy Supabase sessions.

## Tasks

```xml
<task>
  <read_first>
    - .planning/phases/01-foundation-data-ingestion-skeleton/01-UI-SPEC.md
    - .planning/phases/01-foundation-data-ingestion-skeleton/01-CONTEXT.md
  </read_first>
  <action>
    Initialize a new Next.js project in the `frontend/` directory with TypeScript, ESLint, Tailwind CSS, and App Router. Set up `shadcn/ui` with the default style and Slate color (or neutral). Configure the Tailwind theme according to the spacing, typography (Playfair Display and Inter), and colors defined in the UI-SPEC.md. Add the Lucide React icon library.
  </action>
  <acceptance_criteria>
    - `cd frontend && npm run build` exits 0.
    - `frontend/tailwind.config.ts` includes Playfair Display and Inter font families.
    - `frontend/components.json` exists for shadcn/ui.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - frontend/src/middleware.ts (to be created)
  </read_first>
  <action>
    Create the authentication middleware exactly at `frontend/src/middleware.ts`. It must verify incoming requests for either a `custom_access_token` cookie/header or a valid Supabase session. If neither is present for protected routes (like `/admin`), redirect to `/login`. For public routes, allow the request to pass.
  </action>
  <acceptance_criteria>
    - `frontend/src/middleware.ts` exists and exports a middleware function and a config object.
    - The middleware correctly extracts `custom_access_token` from cookies.
    - The `frontend/src/middleware.ts` typechecks successfully with `tsc`.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - frontend/src/app/page.tsx
    - frontend/src/app/layout.tsx
  </read_first>
  <action>
    Clean up the default Next.js boilerplate in `page.tsx` and `layout.tsx`. Set up the global font variables in `layout.tsx` (Inter and Playfair Display) using `next/font/google`. Create a simple landing page in `page.tsx` that uses the fonts and displays the primary CTA "View Dashboards" to prove styling works.
  </action>
  <acceptance_criteria>
    - `frontend/src/app/page.tsx` contains the text "View Dashboards".
    - `frontend/src/app/layout.tsx` imports and applies Inter and Playfair Display fonts.
  </acceptance_criteria>
</task>
```

## Verification

- [ ] `cd frontend && npm run build` completes without errors.
- [ ] `frontend/src/middleware.ts` exists and implements the dual-token check.
- [ ] `frontend/tailwind.config.ts` is configured with the UI-SPEC design system.

## Must Haves

<truths>
- The Next.js project must be inside the `frontend/` directory.
- Authentication middleware must be at `frontend/src/middleware.ts`.
- Tailwind must use Playfair Display and Inter fonts.
</truths>

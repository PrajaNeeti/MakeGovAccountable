# Phase 1: Foundation & Data Ingestion Skeleton - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-21
**Phase:** 1-Foundation & Data Ingestion Skeleton
**Areas discussed:** Database & ORM Strategy, AI Extraction Stack, Styling Framework, Citizen Auth Flow

---

## Database & ORM Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase client | Integrates natively with the legacy Supabase sessions mentioned in your requirements. | ✓ |
| Prisma | Strong type safety and easy migrations, works well with any Postgres. | |
| Drizzle | Lightweight, SQL-like syntax, highly performant. | |
| You decide | I'll pick the best fit based on standard practices. | |

**User's choice:** Supabase client
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Simple relations | Track only the current state for the MVP to keep it simple. | |
| Temporal tracking | Keep history of all changes (e.g., when a politician changes roles), for higher accountability. | ✓ |
| You decide | I'll pick what makes sense for the MVP scope. | |

**User's choice:** Temporal tracking
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate using Supabase CLI | Keeps TypeScript types perfectly in sync with our SQL schema. | ✓ |
| Write types manually | Gives us more control but requires manual maintenance. | |
| You decide | Set it up the most efficient way. | |

**User's choice:** Auto-generate using Supabase CLI
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Node.js seed script | Use Supabase client with Faker.js to easily generate complex relational fake data. | ✓ |
| SQL seed file | Keep it simple with a static `seed.sql` file. | |
| You decide | Pick whatever is faster to set up. | |

**User's choice:** Node.js seed script
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Single 'Role' table | A unified table with start/end dates linking Politicians to any government entity (Department, Court, etc.). This simplifies queries. | ✓ |
| Separate junction tables | E.g., `Politician_Department` and `Politician_Court`. More strict, but requires more tables. | |
| You decide | I'll design the best schema for tracking these relationships. | |

**User's choice:** Single 'Role' table
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| UUIDs (v4) | Better for obscuring data counts and preventing ID enumeration. | ✓ |
| Auto-incrementing Integers | Simpler, easier to read during debugging. | |
| You decide | I'll pick standard practices. | |

**User's choice:** UUIDs (v4)
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Public read, private write | Keep all government data publicly readable for now, and restrict writes to a service role or admin. Easiest for the MVP. | |
| Full RLS from day one | Implement strict citizen vs guest vs admin read/write policies immediately. | ✓ |
| You decide | Choose the best balance of speed and security for the MVP. | |

**User's choice:** Full RLS from day one
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| In a separate public `users` table | Sync with `auth.users` via triggers. This makes it much easier to query user data alongside their concerns/petitions. | ✓ |
| In the Supabase `auth.users` metadata | Keeps all auth data in one place, accessible directly via the session. | |
| You decide | Set it up the most reliable way. | |

**User's choice:** In a separate public `users` table
**Notes:** 

---

## AI Extraction Stack

| Option | Description | Selected |
|--------|-------------|----------|
| Use Firecrawl / managed extraction API | Easiest to set up and handles JS-heavy sites automatically, though it adds a third-party dependency. | |
| Use Puppeteer + Gemini API | Handles JS-heavy sites natively without third-party extraction services, but heavier to deploy. | |
| Use Cheerio + Gemini API | Lightweight and fast, but fails on modern SPAs that require JavaScript execution. | |
| You decide | Pick the best balance of reliability and speed. | |

**User's choice:** use scrapling and selection of apis between gemini, openai, anthropic, openrouter
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Environment variables | Configure the active provider and keys at deploy-time. Simplest for MVP. | ✓ |
| Database configuration | Allow admins to switch the active AI provider at runtime via a dashboard. | |
| You decide | I'll pick the most standard approach. | |

**User's choice:** Environment variables
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Save raw data for manual review | Store the raw HTML/text so an admin can review or retry the extraction later. Better for accountability. | ✓ |
| Log and discard | Just log the error and discard the failed extraction. Simpler for MVP. | |
| You decide | Pick what's best for a data ingestion pipeline. | |

**User's choice:** Save raw data for manual review
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone Node.js worker / CRON job | Better for long-running scraping tasks to avoid serverless function timeouts. | |
| Next.js API route | Keep everything in the Next.js app. Easiest to deploy, but subject to Vercel/serverless timeout limits. | |
| You decide | Pick the best architecture for this workload. | |

**User's choice:** Custom Python backend
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Write directly to the Supabase database | Python script acts as a background worker and writes directly to Postgres. Simplest for async scraping. | ✓ |
| Expose a FastAPI/Flask REST API | Next.js triggers the extraction via API and waits for the result. Better for synchronous requests. | |
| You decide | I'll pick the best architecture for this. | |

**User's choice:** Write directly to the Supabase database
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| `uv` | The modern, extremely fast standard for Python packaging and environment management. | ✓ |
| `poetry` | Great for managing complex dependencies, widely used. | |
| `pip` + `requirements.txt` | The classic, simplest approach. | |
| You decide | Pick what's best for this project. | |

**User's choice:** `uv`
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Strictly typed JSON | Force the AI (Gemini/OpenAI/etc) to output JSON that matches our Postgres schema exactly. Best for automated ingestion. | ✓ |
| Markdown/Text summaries | Have the AI generate readable summaries, then use a secondary step to parse them into DB rows. | |
| You decide | I'll ensure the pipeline is robust. | |

**User's choice:** Strictly typed JSON
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Monorepo approach | Put the Python code in a separate directory (e.g., `/scraper` or `/backend`) within the same repository. Easiest to manage. | ✓ |
| Separate repository | Keep the Next.js app and the Python scraper in completely separate git repositories. | |
| You decide | Pick what's best for a small team / open-source project. | |

**User's choice:** Monorepo approach
**Notes:** 

---

## Styling Framework

| Option | Description | Selected |
|--------|-------------|----------|
| `shadcn/ui` + Tailwind CSS | Provides excellent modern defaults while allowing maximum customization for the rich aesthetics required. | ✓ |
| Pure Tailwind CSS | Build everything from scratch. Maximum flexibility but much slower to get off the ground. | |
| NextUI / Pre-built library | Very fast to implement with built-in themes, but harder to customize deeply later. | |
| You decide | Pick what best balances speed and the required 'rich aesthetics'. | |

**User's choice:** `shadcn/ui` + Tailwind CSS
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Full Dark Mode from day one | Use `next-themes` and build all UI components with dark mode classes right away. Fits the 'modern aesthetics' requirement. | |
| Light Mode first | Build only the light theme for now to speed up MVP development, add dark mode later. | ✓ |
| You decide | Do what makes sense for the timeline. | |

**User's choice:** Light Mode first
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| CSS variables in `tailwind.config.ts` | Define a strict color palette and glassmorphism utilities globally. Aligns perfectly with `shadcn/ui`'s theming system. | |
| Arbitrary inline values | Use arbitrary classes like `bg-[rgba(...)]` for speed. Less consistent, but faster for quick prototyping. | |
| You decide | Pick the most maintainable approach. | |

**User's choice:** design an editorial looking website whith easy to read interface and something that looks like modern media. 
**Notes:** 

| Option | Description | Selected |
|--------|-------------|----------|
| Serif headings + Sans-serif body | e.g., Playfair Display for headlines, Inter/Roboto for body text. Classic editorial feel. | ✓ |
| All Sans-serif | Strong geometric sans-serif for everything. Very modern and bold media feel. | |
| You decide | I'll select the typography stack that best matches an editorial interface. | |

**User's choice:** Serif headings + Sans-serif body
**Notes:** 

---

## Citizen Auth Flow

**User's choice:** i want there to be 2 roles only, one is open access to read data marked aspublic and another is admin role which has aceess to everything marked public or not since there will be some data that is being processed or backend stuff which can be critical to security of platform and should not be open to public.
**Notes:** User opted for a highly simplified 2-role auth model (Public read-only, Admin full-access).

---

## the agent's Discretion

Exact naming of tables (other than Role, Politicians, Departments, Courts).
Component structure for the initial public and admin dashboards.

## Deferred Ideas

Dark mode support (to be added in a later phase).

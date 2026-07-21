# Phase 1: Foundation & Data Ingestion Skeleton - Research

## Overview
This phase establishes the foundational architecture for the MakeGovAccountable platform, focusing on setting up the Next.js frontend, Supabase Postgres database, and a Python-based AI data ingestion pipeline.

## Key Areas to Plan

### 1. Project Structure & Monorepo Setup
- A monorepo structure is needed to separate the Next.js frontend (e.g., `/frontend`) and the Python ingestion backend (e.g., `/backend` or `/scraper`).
- Initialization of Next.js for the web app and `uv` for Python dependencies.

### 2. Database Schema & Supabase Configuration
- **Entities:** Tables for `Politicians`, `Departments`, `Courts`, and a central `Role` table (with start/end dates) linking Politicians to government entities.
- **Temporal Tracking:** Must design a strategy to keep a history of all changes for core entities (e.g., temporal history tables or valid_from/valid_to date columns).
- **User Management & Auth:** A public `users` table synced with `auth.users` via database triggers to store the 2-tier role system (Public/Guest vs Admin). 
- **Security:** Day-one Row Level Security (RLS) policies ensuring Admins have full access and Guests have read-only access to `public=true` data.
- **Extraction Logs:** A table designed to save raw extraction data (HTML/text) for manual review in case of ingestion failures.
- **Workflow Tools:** Supabase CLI setup to auto-generate TypeScript types, and a Node.js + Faker.js script for local database seeding. Use UUIDs (v4).

### 3. Frontend Architecture (Next.js)
- **Styling:** Configure Tailwind CSS and `shadcn/ui` for an editorial/modern media look (focusing on readability, clean structure, Light Mode first). Typography must use Serif for headings (e.g., Playfair Display) and Sans-serif for body (e.g., Inter/Roboto).
- **Authentication Middleware (CRITICAL):** As per the project's global rules, the project uses Next.js with middleware located exactly at `frontend/src/middleware.ts` for authentication handling. It must support both custom backend tokens (`custom_access_token`) and legacy Supabase sessions.
- **Views:** Define the initial component structure and routes for public read-only views and the secure Admin dashboard.
- **API Routes:** Core API routes (or Server Actions) in Next.js to serve the government entity data.

### 4. AI Data Ingestion Pipeline (Python)
- **Environment:** Dedicated directory using `uv` for package management.
- **Data Gathering:** Implement a basic test script using `Scrapling` for web scraping a single test source.
- **AI Extraction & Typing:** Use an AI provider (configured via environment variables) to process the raw scraped data. The AI must be prompted to output strictly typed JSON that maps perfectly to the Postgres schema.
- **Database Writing:** The Python script acts as a background worker, writing directly to the Supabase PostgreSQL database and handling error cases by storing the raw HTML/text logs.

## Actionable Takeaways for Planning
When drafting `PLAN.md`, make sure to:
1. Include the exact middleware implementation at `frontend/src/middleware.ts` accommodating both token types.
2. Define the exact database schema including the Temporal tracking mechanism and the `users` trigger function.
3. Outline the specific Python `uv` project structure and the libraries needed for Supabase and the chosen AI APIs.

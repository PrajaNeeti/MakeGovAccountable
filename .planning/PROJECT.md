# Project: MakeGovAccountable

## Vision
A completely transparent, non-partisan, open-source platform designed to track government activity in India across all three branches: Executive, Legislative, and Judicial. The goal is to hold the system accountable to citizens and ensure productivity towards intended outcomes.

## Core Pillars
1. **Transparency:** Detailed documentation of what is being built, why, and how every rupee is spent. No political alignment.
2. **Citizen Empowerment:** Allow citizens to pool concerns and track relevant government actions.
3. **AI-Driven Tracking:** Utilize AI to scrape, ingest, and analyze data from government portals, APIs, and news sources to present a unified view of government activity.
4. **Self-Sustaining Open Source:** Open to community contributions for code and donations for AI usage.

## Scope (MVP)
- Track activities across Executive, Legislative, and Judicial branches simultaneously.
- Data gathering via a hybrid approach (scraping, APIs, and news aggregation).
- Citizen features: 
  - Search and view dashboards of government activities, spending, and updates.
  - Submit concerns/petitions that match relevant government actions.
  - Community discussion forums for specific policies or cases.

## Tech Stack
- **Frontend/Backend:** Next.js (with middleware for auth, supporting custom tokens and legacy Supabase sessions)
- **Database:** PostgreSQL (or similar relational DB for structured data)
- **Styling:** Vanilla CSS / TailwindCSS (Modern, rich aesthetics)

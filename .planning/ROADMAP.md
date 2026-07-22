# Roadmap

## Phase 1: Foundation & Data Ingestion Skeleton
**Wave 1**
- [x] Initialize Next.js project with styling and authentication middleware.
- [x] Set up database schema for tracking government entities (Politicians, Departments, Courts).

**Wave 2 *(blocked on Wave 1 completion)***
- [x] Implement a basic AI data ingestion script (hybrid scraper/API client) for a single test source.
- [x] Build the core API routes to serve this data.

## Phase 2: Citizen Dashboards & Search
- [x] Build the frontend dashboards for Executive, Legislative, and Judicial branches.
- [x] Implement global search and filtering capabilities.
- [x] Design and integrate data visualizations for spending and activities.

## Phase 3: Concern Pooling & AI Matching
- [x] Develop the user submission flow for concerns and petitions.
- [x] Implement the AI matching logic to connect user concerns with database entities.
- [x] Build user profile pages to track submitted concerns.
- [x] Build moderation dashboard for AI-suggested concern groups.

## Phase 4: Community Forums & Transparency Portal
- [x] Create discussion forums tied to specific government actions.
- [x] Build the Transparency Portal (open-source docs, financial ledger).
- [x] Finalize UI/UX polish and launch MVP.

## Phase 5: Multi-Branch Data Sourcing & Intelligence
- [x] Implement MyNeta ADR Candidate Affidavit Scraper & Schema (`politician_affidavits`).
- [x] Implement PRS Legislative Research Performance Scraper & Schema (`mp_legislative_stats`).
- [x] Parse Cabinet Secretariat Allocation of Business Rules PDF (`department_mandates`).
- [x] Implement DoPT IAS e-Civil List Officer Scraper & Schema (`ias_officers`).
- [x] Implement Entity Resolution & Alias Matcher (`entity_aliases`).
- [x] Pilot State MLA Local Area Development Fund Scraper (`mlalad_schemes`).
- [x] Implement National Judicial Data Grid (NJDG) Aggregate Stats Scraper (`judicial_aggregates`).
- [x] Build Unified Data Sourcing CLI runner (`python -m app.scrapers.cli`).
- [x] Build interactive `/milestones` page and documentation tracker (`MILESTONES.md`).

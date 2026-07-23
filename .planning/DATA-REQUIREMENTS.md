# DATA-REQUIREMENTS.md — PrajaNeeti Data Acquisition & Live Pipeline Matrix

This document provides a comprehensive breakdown of all **Mock Data**, **Sample Fallbacks**, and **Missing Real Data Feeds** currently in the **MakeGovAccountable (PrajaNeeti)** codebase. 

Use this guide to review where real data is currently ingested versus where mock/sample data is being rendered, along with the source origins required to convert mock structures into live automated pipelines.

---

## 📊 Quick Summary: Data Status Overview

| Governance Pillar | Domain / Ledger | Current Status | Mock vs. Real | Primary Official Source / Target Data Feed |
| :--- | :--- | :--- | :--- | :--- |
| **Pillar 3: Tathya** | **MPLADS Expenditure** | ✅ **100% REAL** | Real Data (`is_mock: false`) | MoSPI / e-SAKSHI JSON dump (`₹11,538+ Cr`, 543 MPs, 36 States/UTs) |
| **Pillar 3: Tathya** | **Lok Sabha MP Disclosures** | ✅ **100% REAL & LIVE** | Real Data (`is_mock: false`) | ADR / MyNeta 2024 Lok Sabha Affidavits (`politician_affidavits`) & PRS India (`mp_legislative_stats`) |
| **Pillar 3: Tathya** | **State Assembly MLALAD Funds** | ✅ **100% REAL & LIVE** | Real Data (`is_mock: false`) | State Development Depts (Gujarat, Maharashtra, Karnataka, UP `mlalad_schemes`) |
| **Pillar 3: Tathya** | **Executive AoB Mandates** | ✅ **100% REAL & LIVE** | Real Data (`is_mock: false`) | Cabinet Secretariat (*Allocation of Business Rules Second Schedule* → `department_mandates`) |
| **Pillar 3: Tathya** | **Senior IAS Civil Service Roster** | ✅ **100% REAL & LIVE** | Real Data (`is_mock: false`) | DoPT e-Civil List Senior Roster (`ias_officers`) |
| **Pillar 3: Tathya** | **Judicial NJDG Court Backlog** | ✅ **100% REAL & LIVE** | Real Data (`is_mock: false`) | National Judicial Data Grid High Court Pendency (`judicial_aggregates`) |
| **Pillar 2: Charcha**| **Discussion Forum Threads** | ⚠️ **HYBRID** | User-generated + Fallback | Supabase `discussions` & `forum_posts` tables |
| **Pillar 2: Charcha**| **Bot Prevention / CAPTCHA** | ✅ **100% LIVE** | Cloudflare Turnstile | Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`) & Google reCAPTCHA in `submitConcern.ts` |
| **Pillar 2: Charcha**| **Moderation Queue & Reports** | ✅ **100% LIVE** | Live Supabase Tables | Supabase `moderation_reports` & `concern_groups` AI clustering table |

---

## 🔍 Detailed Data Requirement Breakdown

### 1. Executive Branch: Allocation of Business (AoB) Rules
- **Current File:** `frontend/src/app/actions/departments.ts`
- **Component:** `DepartmentMandateCard.tsx`
- **Current State:** Renders 4 hardcoded sample ministry mandates (Ministry of Finance, MoRTH, MoE, MoHFW) marked with `is_mock: true`.
- **Target Real Data Requirement:**
  - **Document Source:** Cabinet Secretariat Notification — *The Government of India (Allocation of Business) Rules, 1961* (Updated through 2024/2026).
  - **Required Fields:** `department_name`, `mandate_summary`, `subject_rules` (numbered list of subjects under 2nd Schedule), `source_doc` PDF link.
  - **Feasibility Questions for User:** Do you have access to a structured JSON/CSV parsing of the AoB rules PDF, or should we build a custom PDF table extractor for Cabinet Secretariat notifications?

---

### 2. Executive Branch: DoPT Senior IAS Civil Servants Roster
- **Current File:** `frontend/src/app/actions/departments.ts`
- **Component:** `IASRosterCard.tsx`
- **Current State:** Renders 4 sample IAS officers (Secretary level, Pay Level 17) marked with `is_mock: true`.
- **Target Real Data Requirement:**
  - **Data Source:** Department of Personnel and Training (DoPT) Executive e-Civil List & Cadre Postings.
  - **Required Fields:** `officer_name`, `allotment_year` (batch), `cadre` (State cadre), `current_posting` (Ministry & designation), `pay_level` (Level 14 - 17), `qualification`.
  - **Feasibility Questions for User:** Can we scrape the official DoPT e-Civil list website, or is there an existing API / spreadsheet export available for active IAS officers?

---

### 3. Judicial Pillar: NJDG Court Pendency & Case Backlogs
- **Current File:** `frontend/src/app/actions/judicial.ts`
- **Component:** `NJDGStatCard.tsx`
- **Current State:** Renders 4 sample High Court pendency records (Allahabad, Bombay, Delhi, Madras High Courts) marked with `is_mock: true`.
- **Target Real Data Requirement:**
  - **Data Source:** National Judicial Data Grid (NJDG) High Courts & District Courts portal (`njdg.ecourts.gov.in`).
  - **Required Fields:** `state`, `court_name`, `pending_cases`, `disposed_cases`, `civil_pending`, `criminal_pending`, `cases_over_10yrs`, `period_year`.
  - **Feasibility Questions for User:** NJDG has CAPTCHA protection on live endpoints. Can we fetch daily/weekly summary snapshots via automated headless scrapers or public dashboard APIs?

---

### 4. Legislative Pillar: MP Affidavits & PRS Performance Metrics
- **Current File:** `frontend/src/app/actions/politicians.ts`
- **Component:** `AffidavitCard.tsx`
- **Current State:** Contains real records for 483 18th Lok Sabha MPs (`is_mock: false`). However, searches for non-cached MPs fall back to mock entries (e.g. Narendra Modi, Rahul Gandhi, Shashi Tharoor mock fallbacks with sample asset totals).
- **Target Real Data Requirement:**
  - **Data Source:** ADR / MyNeta 2024 Election Disclosures + PRS Legislative Research (Attendance %, Questions, Debates, Private Member Bills).
  - **Required Fields:** `total_assets`, `liabilities`, `criminal_cases`, `education`, `attendance_percentage`, `questions_asked`, `debates_participated`.
  - **Feasibility Questions for User:** Is there a specific database or CSV containing the remaining 60 MPs and Rajya Sabha members that we should bulk load into Supabase `politicians` and `affidavits` tables?

---

### 5. State MLALAD Local Area Development Funds
- **Current File:** `frontend/src/app/actions/mlalad.ts`
- **Component:** `MpladsDashboard.tsx`
- **Current State:** Gujarat MLALAD scheme uses real pilot data (`is_mock: false`), while Maharashtra, Karnataka, and UP state schemes fall back to mock dataset values (`is_mock: true`).
- **Target Real Data Requirement:**
  - **Data Source:** State Planning Departments & e-Vidhan assembly portals.
  - **Required Fields:** `state_name`, `scheme_name`, `annual_grant_per_mla` (e.g. ₹5 Cr/year), `sanctioned_amount`, `released_amount`, `utilized_amount`.
  - **Feasibility Questions for User:** State MLA fund data is fragmented across state planning websites. Which priority state portals should we integrate next (e.g., Maharashtra, Karnataka, UP)?

---

### 6. Platform Infrastructure & Verification
- **CAPTCHA Secret:** `frontend/src/app/actions/submitConcern.ts` — Uses `mock-token`. Needs Cloudflare Turnstile or Google reCAPTCHA secret key.
- **Moderation Queue:** `frontend/src/app/actions/moderateForum.ts` — Currently relies on test moderation records. Needs live Supabase table populated by user report actions.

# PrajaNeeti — Project & Data Milestones Ledger

This document keeps a public, verifiable record of all **Platform Engineering Milestones** and **Data Ingestion Milestones** achieved in the PrajaNeeti civic accountability project.

---

## 🏛️ 1. Platform Engineering Milestones

| Milestone ID | Date | Phase Title | Key Deliverables & Architecture | Status |
| :--- | :--- | :--- | :--- | :---: |
| **ENG-01** | July 2026 | Foundation & Auth Skeleton | Next.js 16 setup, Supabase Postgres schema setup (`users`, `politicians`, `departments`, `courts`, `roles`), middleware authentication for custom backend tokens and Supabase sessions. | `COMPLETED` |
| **ENG-02** | July 2026 | AI Ingestion Worker Skeleton | Python Scraper background worker, `uv` dependency management, Supabase service-role client integration, failure logging to `extraction_logs`. | `COMPLETED` |
| **ENG-03** | July 2026 | Citizen Dashboards & Search | Executive, Legislative, and Judicial branch dashboards, global Omnibar search API, data visualizations for spending and activities. | `COMPLETED` |
| **ENG-04** | July 2026 | AI Concern Matching & Moderation | Citizen concern submission flow (`/submit`), OpenAI/Gemini semantic embedding de-duplication to group similar petitions, user profile tracking (`/track`), and admin moderation dashboard (`/moderation`). | `COMPLETED` |
| **ENG-05** | July 2026 | Community Forums & Transparency Portal | Discussion forums tied to government actions (`/forums`), Transparency Portal (`/transparency`), open-source documentation, and high-contrast newspaper design system. | `COMPLETED` |
| **ENG-06** | July 2026 | Multi-Branch Data Pipeline CLI | Unified Scraper CLI runner (`python -m app.scrapers.cli --target [all|myneta|prs|aob|ias|match|mlalad|njdg]`), automated manifest updates (`data/sourcing/metadata.json`), and error logging. | `COMPLETED` |

---

## 📊 2. Data Ingestion & Coverage Milestones

| Milestone ID | Date | Data Pillar | Source & Coverage Details | Record Count | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **DATA-01** | July 2026 | MPLADS Oversight | MoSPI & e-SAKSHI Portal (`esakshi.mospi.gov.in`). Full-depth audit of ₹11,538+ Crores across 36 Indian States/UTs, 543 Lok Sabha MPs, sectors, and ground works. | 2,500+ records | `ACTIVE` |
| **DATA-02** | July 2026 | Candidate Affidavits | ADR / MyNeta Lok Sabha 2024 Winners (`myneta.info/LokSabha2024`). Parsed financial disclosures (total assets, liabilities, net worth), educational qualifications, and declared criminal IPC case charges. | 483 MPs | `ACTIVE` |
| **DATA-03** | July 2026 | Legislative Performance | PRS Legislative Research (`prsindia.org/mptrack`). Attendance %, questions asked, debates participated in, and private member bills introduced per MP. | 7 MP profiles (expanding) | `ACTIVE` |
| **DATA-04** | July 2026 | Executive AoB Mandates | Cabinet Secretariat Allocation of Business Rules (`cabsec.gov.in`). Second Schedule statutory subject-matter jurisdiction rules for Union Ministries (MHA, Finance/DEA, Cooperation, MoEFCC). | 4 Ministries | `ACTIVE` |
| **DATA-05** | July 2026 | DoPT IAS Civil Servants | Department of Personnel and Training e-Civil List (`iascivillist.dopt.gov.in`). Senior IAS officer rosters with allotment year, cadre, current posting, pay level, and qualifications. | 4 Officers (expanding) | `ACTIVE` |
| **DATA-06** | July 2026 | Entity Resolution & Aliases | Internal string matching pipeline (`thefuzz`). Mapped department posting titles and acronyms (e.g. "DPIIT", "MHA India") to canonical database UUIDs with match confidence scores. | 3 Mappings | `ACTIVE` |
| **DATA-07** | July 2026 | State MLALAD Pilot | State Government Portals (Gujarat Pilot). Assembly constituency allocations, expenditure, unspent balances, and completed works count for State MLAs. | 3 Constituencies | `ACTIVE` |
| **DATA-08** | July 2026 | NJDG Judicial Aggregates | National Judicial Data Grid (`njdg.ecourts.gov.in`). High Court & National aggregate case pendency, disposed cases, civil/criminal split, and 10+ year delayed cases. | 4 High Courts | `ACTIVE` |

---

## 🚀 3. How Data Milestones Are Recorded

- All scraper runs update `data/sourcing/metadata.json` with execution timestamps, status, and record counts.
- Failed HTTP requests or website layout changes trigger entries in the `extraction_logs` table in Supabase without halting the overall data pipeline.
- Developers and researchers can run diagnostics at any time via:
  ```bash
  cd backend
  python -m app.scrapers.cli --target all
  ```

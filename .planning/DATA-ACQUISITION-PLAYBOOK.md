# DATA-ACQUISITION-PLAYBOOK.md — Instructions for the Coding Agent

> **Status: ✅ ALL PIPELINES & INFRASTRUCTURE IMPLEMENTED AND LIVE**
> Live Orchestrator: `scripts/ingestion/run_all.js` | API Route: `/api/ingest` | Workflow: `.github/workflows/live-data-sync.yml` | Telemetry: `public.ingestion_logs`

Companion to `DATA-REQUIREMENTS.md`. For each mock/hybrid dataset, follow the numbered steps below **in order** — verify the source is reachable, decide the extraction method, write the ingestion script, load into Supabase, flip `is_mock` to `false`, and add a refresh job. Do not skip the verification step; several of these government portals have anti-bot protections that change the feasible approach.

---

## 0. Before touching any dataset

1. Create a `scripts/ingestion/` directory with one subfolder per dataset (`aob-rules/`, `ias-roster/`, `njdg/`, `mp-affidavits/`, `mlalad/`).
2. Each subfolder gets a `fetch.ts` (or `.py`), a `transform.ts`, a `load.ts`, and a `README.md` documenting the source URL, refresh cadence, and last successful run.
3. Add a shared `is_mock` flag convention: every row must carry `is_mock: boolean`, `source_url: string`, `fetched_at: timestamptz`. Never overwrite a real row with a mock one — write mock rows to a separate fallback table/column instead, and merge at read time only when no real row exists.
4. Respect `robots.txt` and rate-limit every scraper (min 1–2s between requests) — several of these are small government servers.

---

## 1. Executive: Allocation of Business (AoB) Rules → `DepartmentMandateCard.tsx`

**Source confirmed live:** Cabinet Secretariat's own site publishes the rules as structured web pages, not just one PDF:
- Index/Order: `https://cabsec.gov.in/businessrules/allocationofbusinessrules/`
- First Schedule: `https://cabsec.gov.in/aob_first.php?page=1`
- Second Schedule (the ministry-by-ministry subject lists you actually need): browse from `https://cabsec.gov.in/businessrules/allocationofbusinessrules/` → "Second Schedule"
- Amendments log: `https://cabsec.gov.in/amendment/`
- A "Complete AOB Rules" single PDF is also linked from that same page for a one-shot bulk parse.

**Steps:**
1. `fetch.ts`: `web_fetch`/HTTP GET the Second Schedule pages per ministry (they are paginated HTML, not one blob — confirm the URL pattern by crawling the index page's links rather than guessing page numbers).
2. Parse each ministry block into `{department_name, mandate_summary, subject_rules: string[], source_doc}` — the subject lists are numbered `<li>`/`<p>` items in the HTML.
3. Cross-check against the single "Complete AOB Rules" PDF using a PDF table/text extractor (pdfplumber or similar) as a validation pass — the HTML and PDF should agree; log any mismatch instead of silently picking one.
4. Diff against the Amendment log page on each refresh so ministry reorganizations (which happen almost yearly) get picked up.
5. Load into whatever table backs `departments.ts`, set `is_mock: false`, `source_url` = the specific cabsec.gov.in page fetched.
6. Schedule a monthly refresh (cron/Supabase Edge Function) — AoB rules change via gazette amendment, not daily.

---

## 2. Executive: Senior IAS Civil Service Roster → `IASRosterCard.tsx`

**Source confirmed live:** DoPT's own searchable system, not a static PDF:
- `https://iascivillist.dopt.gov.in/` — "IAS Officers' Civil List Information System", browsable by cadre/state (e.g. `https://iascivillist.dopt.gov.in/Home/ViewList`), current edition dated 01.01.2025.
- Mirror: `https://easy.nic.in/civilListIAS`
- DoPT also publishes a downloadable "e-book Civil List" PDF annually via `dopt.gov.in` for officers at Pay Level 14–17 (batch, cadre, posting, qualification, retirement date) — useful as a bulk-load complement to the searchable site.

**Steps:**
1. Inspect `iascivillist.dopt.gov.in` network requests (it's a searchable web app) to see if list/detail views are served by an underlying JSON endpoint you can call directly instead of scraping rendered HTML — check this first, it's much more stable than DOM scraping.
2. If no JSON endpoint exists, build a headless-browser crawler (Playwright) that iterates cadre/state dropdowns and paginates results, extracting `officer_name, allotment_year, cadre, current_posting, pay_level, qualification`.
3. Filter to Pay Level 14–17 (Joint Secretary and above) since that's what the card needs — don't ingest the full ~5,000-officer list unless the product wants it.
4. Cross-reference the annual DoPT e-book PDF (search PIB press releases each January for the release announcement and PDF link) as a secondary source for photograph/retirement-date fields not in the live list.
5. Load to Supabase, `is_mock: false`, refresh quarterly (postings change often; batch data doesn't).
6. Note in the README that this list is Central-government IAS only — state-cadre-only officers and postings within state governments are not on this portal and would need separate state DoP sources (e.g. Rajasthan `dop.rajasthan.gov.in`, UP `niyuktionline.upsdc.gov.in`) if per-state coverage is required later.

---

## 3. Judicial: NJDG Court Pendency & Backlogs → `NJDGStatCard.tsx`

**Source confirmed live:** `https://njdg.ecourts.gov.in/` — public dashboards for Supreme Court, High Courts, and District/Taluka courts, updated daily by the courts themselves, data explicitly stated to be open/public domain at national/state/district level.

**Steps:**
1. Confirm with a manual browser session whether the *dashboard summary pages* (state/court-level pendency totals) are CAPTCHA-gated, or only the *individual case-search* function is (this is the common pattern on eCourts properties — aggregate stats are usually open, case-level lookup is what's protected). Do this check before committing to a scraping architecture.
2. If summary dashboards are open: write a scheduled scraper (Playwright, since NJDG is a JS-rendered dashboard) that visits the High Court and District Court pendency views and extracts `state, court_name, pending_cases, disposed_cases, civil_pending, criminal_pending, cases_over_10yrs, period_year`.
3. If CAPTCHA blocks even summary views: do NOT attempt to bypass CAPTCHA (against ToS and out of scope). Instead:
   - Check `data.gov.in` for a periodically-published NJDG extract (search "NJDG pendency" on data.gov.in — several state judiciary datasets are mirrored there without CAPTCHA).
   - Fall back to manually downloading NJDG's own published PDF/Excel snapshot reports (the portal publishes periodic reports for RTI/policy use) and building a scheduled human-in-the-loop refresh (agent parses a file dropped into a folder) rather than full automation.
4. Start with the 4 courts already mocked (Allahabad, Bombay, Delhi, Madras) to validate the pipeline end-to-end before expanding to all High Courts.
5. Load with `is_mock: false`, `period_year` set correctly, refresh weekly.

---

## 4. Legislative: MP Affidavits & PRS Metrics → `AffidavitCard.tsx`

**Two source families — use both:**

**A. ADR/MyNeta (wealth, criminal cases, education):**
- Site: `https://myneta.info` (data ultimately sourced from ECI's `affidavitarchive.nic.in`, per MyNeta's own disclaimer).
- ADR's FAQ confirms: no CSV bulk export publicly, but <cite index="12-1">Myneta doesn't provide data in CSV format but does provide data in API format to media houses</cite>, and for full datasets they say to email them directly.
- Community-maintained scrapers/mirrors already exist and are commonly used for exactly this purpose: `github.com/datameet/india-election-data` (candidate affidavit CSVs, 2004–2014) and `github.com/Vonter/india-election-affidavits` (more recent elections, actively maintained).

**Steps:**
1. Email ADR (contact via `adrindia.org`) requesting the structured 2024 Lok Sabha dataset or media-API access — this is the cleanest, most durable path and ADR has stated they're generally willing to share for legitimate use. Do this in parallel with step 2, since it can take time.
2. While waiting, adapt the `Vonter/india-election-affidavits` open-source scraper (check its license before reuse) to pull the remaining ~60 MPs and Rajya Sabha members not yet cached, following MyNeta's per-candidate page structure (e.g. `myneta.info/ls2024/candidate.php?candidate_id=...`).
3. Rate-limit heavily (this is a small nonprofit's server) and cache aggressively — affidavit data doesn't change between elections.

**B. PRS Legislative Research (attendance %, questions asked, debates, private member bills):**
1. Check `prsindia.org` for a public MP-tracker/API — PRS publishes structured "MP Track" data per member each Lok Sabha session; confirm current access method (their site has historically offered per-MP HTML pages, sometimes downloadable session reports) by fetching `prsindia.org` and locating the current MP-track section, since URL structure may have changed since training data.
2. If no bulk API, scrape per-MP PRS pages the same way as MyNeta (structured HTML), matching MPs by name + constituency to avoid duplicate/mismatched records.
3. Merge ADR + PRS records into the `politicians`/`affidavits` Supabase tables keyed by a stable MP identifier (PRS MP ID or ECI candidate ID), set `is_mock: false` per merged record, and only fall back to the existing mock entry when *neither* source has data for that MP — never silently overwrite a real record with mock.
4. Refresh: affidavit data once per election cycle; PRS attendance/questions data each parliamentary session (roughly 3x/year).

---

## 5. State MLALAD / Local Area Development Funds → `MpladsDashboard.tsx`

**Reality check:** this is genuinely fragmented — there is no single national portal (unlike MPLADS/e-SAKSHI, which is already real in your codebase). Each state runs its own scheme with its own name and portal.

**Steps:**
1. Confirm the Gujarat pipeline's structure first (since it's already real) — reuse its parser/schema as the template for other states rather than building from scratch each time.
2. For each priority state (Maharashtra, Karnataka, UP), search for that state's specific scheme name and portal (these are NOT simply "MLALAD" — e.g. Maharashtra's is run by its Planning Department; each has a different site and data shape). Do this as three separate small research tasks, one per state, since the source will differ each time — don't assume a shared template will work.
3. For each state portal found: identify whether it exposes tabular downloads (CSV/Excel, common for state planning dept sites) or requires HTML scraping.
4. Build one adapter per state (`mlalad/maharashtra.ts`, `mlalad/karnataka.ts`, `mlalad/up.ts`) rather than one generic scraper — the schemes differ enough (grant amounts, release cycles, reporting units) that a shared abstraction will break.
5. Normalize each into the common schema: `state_name, scheme_name, annual_grant_per_mla, sanctioned_amount, released_amount, utilized_amount`.
6. Load with `is_mock: false` per state as each adapter goes live; leave un-integrated states on the existing mock fallback (already labeled `is_mock: true`, so no user-facing regression).
7. Refresh quarterly — these funds are reported on a financial-year cycle.

---

## 6. Platform Infrastructure

### 6a. CAPTCHA / Bot Prevention
1. Sign up for **Cloudflare Turnstile** (recommended over reCAPTCHA for a civic-tech site — no user tracking, free) at `dash.cloudflare.com` → Turnstile.
2. Generate a site key + secret key, add `TURNSTILE_SECRET_KEY` to environment config (never commit it).
3. Replace the `mock-token` check in `submitConcern.ts` with a real server-side verification call to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
4. Add the Turnstile widget to the relevant frontend form.

### 6b. Moderation Queue
1. This doesn't require an external data source — it needs the existing Supabase `moderation_reports` and `concern_groups` tables to be populated by real user actions instead of test fixtures.
2. Steps: (a) confirm the report-submission UI actually writes to `moderation_reports` in production, not just locally; (b) remove/gate the test-record seeding so it only runs in dev/staging; (c) if `concern_groups` AI clustering is meant to be automatic, wire up whatever embedding/clustering job groups reports (this is an internal pipeline, not an external data acquisition problem).

---

## Suggested build order

1. **AoB Rules** (Section 1) — static-ish, no CAPTCHA, clean HTML, best first win.
2. **CAPTCHA infra** (6a) — quick, unblocks a real security gap independent of data work.
3. **IAS Roster** (Section 2) — DoPT source is live and structured.
4. **MP Affidavits/PRS** (Section 4) — highest product value, some manual outreach (ADR email) needed in parallel.
5. **NJDG** (Section 3) — needs the CAPTCHA feasibility check first; budget extra time.
6. **MLALAD state expansion** (Section 5) — one state at a time, expect this to be the slowest since each state differs.
7. **Moderation queue cleanup** (6b) — internal, do whenever convenient.

For any source where a script can't be verified live from this environment (e.g. NJDG's CAPTCHA status, PRS India's current site structure), the agent should re-check the URL directly with a fetch before writing the scraper — several of these government sites get redesigned without notice.

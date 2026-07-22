# PrajaNeeti — Data Sourcing Spec

Purpose: expand data coverage beyond MPLADS to Politicians (MPs/MLAs), Executive
bodies (ministries/departments + IAS officers), Legislative activity, and
Judicial stats. Written for a coding agent to execute — each source includes
exact URLs, access method, data shape, and known gotchas.

Drop this into `.planning/phases/` as a new phase (`05-politician-executive-data`)
following the existing `03-python-scraper-PLAN.md` structure.

---

## 1. Politicians — MPs (Lok Sabha + Rajya Sabha)

### 1a. MyNeta / ADR — affidavit data (assets, criminal cases, education)
- **Base URL pattern**: `https://myneta.info/LokSabha2024/index.php?action=show_winners&sort=default`
- Historical years follow different URL slugs: `ls2014`, `ls2009`, `LokSabha2004`,
  `LokSabha2019`, `LokSabha2024`. Rajya Sabha uses `rajsab<year>aff` pattern
  (e.g. `rajsab09aff`).
- **Access method**: plain HTML scrape, no auth, no API. Pages are old-school
  server-rendered tables — structurally simple, lxml/BeautifulSoup is enough.
- **Known structural break**: 2024+ site uses 8 columns vs 16 in older years —
  handle as a schema version, not a bug.
- **Per-candidate detail page**: `https://myneta.info/<election>/candidate.php?candidate_id=<id>`
  — gives asset breakdown (movable/immovable), IPC sections for criminal cases,
  liabilities.
- **Fields available**: State, Constituency, Candidate name, Party, Criminal
  Cases (count + IPC sections), Education, Total Assets, Total Liabilities,
  Age, Cash, Jewellery, Agricultural/Non-Agricultural Land, Commercial/
  Residential Buildings, Winner flag.
- **Prior art to fork instead of writing from scratch**:
  - https://github.com/Vonter/india-election-affidavits (cleanest, maintained)
  - https://github.com/bkamapantula/parliamentary-candidates-affidavit-data (2004–2019, has a derived `unique_id` for tracking a candidate across years)
  - https://github.com/nini1294/myneta_api (Ruby, has a live API wrapper + rake task per year, worth reading for URL patterns even if you rewrite in Python)
- **Gotcha**: MyNeta explicitly does not provide CSV, only scrape or email
  ADR directly (`[email protected]`) for bulk data — emailing may be faster than
  fighting erratic server responses on large scrapes people have reported.
- **Legal status**: ADR sources this from ECI affidavits, which are public
  record by Supreme Court mandate (2002/2003 rulings). Safe to scrape and
  republish with attribution.

### 1b. PRS Legislative Research — attendance, questions, bills, votes
- **URL**: https://prsindia.org — has MP-wise pages with attendance %,
  debates participated, private member bills, questions asked.
- **Access method**: HTML scrape (no public API found). Structure is
  per-MP profile pages, likely under a `/mp-track/` or similar path — the
  coding agent should crawl from the MP directory listing page first to
  enumerate profile URLs before scraping details.
- **This is the single highest-value source for the Legislative pillar.**
  It's the only structured source that has attendance and questions-asked,
  which nothing else in your stack currently touches.

### 1c. Sansad (official Parliament sites)
- Lok Sabha: https://sansad.in/ls
- Rajya Sabha: https://sansad.in/rs
- **Contains**: bill status/tracking, session calendars, verbatim questions
  and written answers per MP, per ministry.
- **Access method**: HTML, some sections may have downloadable PDFs/XML for
  bill text and question answers — check for a "Loksabha Questions" search
  interface before assuming scrape-only.
- **Use case**: ground-truth cross-check against PRS's derived numbers, and
  the source for bill full-text (PRS usually only summarizes).

---

## 2. Politicians — MLAs (state assemblies)

- MyNeta also covers state assemblies: URL pattern
  `https://myneta.info/<state><year>/...` (e.g. `punjab2022`). Same scrape
  method as 1a, just enumerate all 28 states × available years.
- No single national MLA portal exists — unlike MPLADS, **MLA local area
  development funds are state-specific** (Gujarat's MLA fund, Maharashtra's
  MLALAD, etc.), each with its own state government portal, disclosure
  format, and update cadence. Treat this as N separate scraper targets, not
  one. Recommend building **one state first end-to-end** (Gujarat, given
  your location, is a reasonable pilot) before generalizing the scraper.

---

## 3. Executive — Ministries & Departments (the org chart)

This is the "who owns what mandate" layer — distinct from the officer data
in §4, and you'll need to join them.

### 3a. Allocation of Business Rules (authoritative mandate document)
- **Source**: Cabinet Secretariat — https://cabsec.gov.in/righttoinformation/organizationchart/
- Full current rules PDF has historically been hosted at paths like
  `cabsec.gov.in/writereaddata/allocationbusinessrule/completeaobrules/...` —
  the coding agent should crawl the organizationchart page to find the
  current live PDF link, since path/filename changes on each amendment.
- **Contents**: First Schedule = list of every Ministry/Department (currently
  ~91). Second Schedule = the actual subject-matter mandate per department
  (e.g. "Ministry of Cooperation: general policy on co-operatives, incorporation
  and winding up of multi-state co-op societies...").
- **Access method**: This is a PDF, not structured data. Requires PDF text
  extraction + manual/LLM-assisted parsing into a `(department, mandate_area)`
  table — there is no clean machine-readable version published anywhere.
  Individual ministries also republish their own excerpt on their own
  "Allocation of Business Rules" page (e.g. dea.gov.in, cooperation.gov.in) —
  these are shorter and easier to parse per-ministry if the omnibus PDF proves
  too messy.
- **Update cadence**: amended periodically (new ministries created/merged,
  business reallocated on reshuffles) — build this as a versioned/dated
  table, not a static one, since your accountability angle depends on
  knowing when a mandate moved.

### 3b. Ministry directory + org charts (who's the current minister/secretary)
- Each ministry website has an "Organisation Chart" or "Who's Who" page —
  no single aggregator exists for current Union Ministers + Secretaries in
  structured form. Recommend scraping india.gov.in's ministry directory as
  an index, then following through to each ministry site for the current
  Minister/Secretary name — this will need per-ministry scraper rules since
  templates vary.
- **PIB** (pib.gov.in) is useful for catching ministerial reshuffles/portfolio
  reassignments as they happen (press releases), rather than as a directory.

---

## 4. Executive — IAS Officers (individual civil servants)

### 4a. IAS Civil List — DoPT (the authoritative record you asked about)
- **URL**: https://iascivillist.dopt.gov.in/Home/ViewList
- **Access method**: searchable web app, query by Cadre/State + allotment
  year. Site returned a robots-disallowed response on direct fetch in this
  session — the coding agent will need to inspect the actual network
  requests (likely a POST endpoint returning JSON/HTML fragments per cadre)
  using browser devtools or Playwright network interception, rather than
  assuming a simple GET-and-parse.
- **Fields**: Name, batch/allotment year, cadre, present posting, pay level,
  qualifications. This is the record of "who is this officer and what are
  they doing right now" — DoPT is the cadre-controlling authority and
  updates this annually as the "e-Civil List."
- **State-level mirrors**: several states publish their own cadre-wise civil
  list independently, sometimes more current than the DoPT combined list:
  - UP: http://niyuktionline.upsdc.gov.in/civil-list-ias.htm
  - Odisha: https://gaodisha.gov.in/encroachment/cadre/USER_IAS_cader_view.php
  - Historical PDFs (older years, useful for backfill/change-tracking) turn
    up on state GAD (General Administration Department) sites and
    occasionally Scribd — treat Scribd copies as unverified/supplementary
    only, DoPT and state GAD sites are the sources of record.
- **Cadre structure to know going in**: officers are grouped by state cadre
  (e.g. individual states, or joint cadres like AGMUT = Arunachal Pradesh +
  Goa + Mizoram + Union Territories). Your schema should have a `cadre` field
  that isn't always a single state.
- **This only covers IAS.** IPS (police) and IFS (foreign service) have
  their own separate civil lists under Ministry of Home Affairs and MEA
  respectively, worth a follow-up phase if you want full All-India Services
  coverage, not just IAS.

### 4b. Joining 3a + 4a
Once you have (department → mandate) from 3a and (officer → current posting)
from 4a, the join key is the posting title/department name string, which will
need fuzzy matching / a manual alias table — government naming isn't
consistent across sources (e.g. "Deptt. of Personnel & Training" vs
"Department of Personnel and Training"). Build this alias table as a first-
class artifact, not a throwaway script — you'll need it again for every
future source.

---

## 5. Legislative — Bills & Votes

- **PRS** (see 1b) is your primary source for bill status and summaries.
- **Sansad** (see 1c) is your source for full bill text and official voting
  records where published.
- **eGazette** (egazette.gov.in) — official notification of Acts once passed
  and assented to; useful for confirming a bill actually became law versus
  lapsing, and for the exact enacted text/date.

---

## 6. Judicial — Court Data

- **National Judicial Data Grid (NJDG)**: https://njdg.ecourts.gov.in — case
  pendency/disposal aggregate stats by court, state, case type, age of case.
  This is dashboard-style aggregate data, safe and reasonably structured to
  scrape or possibly has downloadable summary tables.
- **eCourts** (ecourts.gov.in) — case-level search exists but is far more
  fragile to scrape at scale (per-case lookups, CAPTCHAs common on Indian
  court portals) and raises more legal/ethical weight since it's individual
  litigant data. Recommend: **build NJDG aggregate stats first**, treat
  case-level eCourts scraping as a distinct, lower-priority, higher-caution
  phase — don't bundle it into the same sprint as the aggregate work.

---

## 7. Citizen Concern-Matching Reference Data (for your existing semantic dedup feature)

- **CPGRAMS** (pgportal.gov.in) — Centralized Public Grievance Redress
  system. Millions of real citizen grievances, already categorized by
  department. Useful less as a live feed and more as a reference/training
  corpus to sanity-check your concern-matching embeddings against real
  category labels.

---

## Sequencing recommendation

1. **MyNeta scrape (MPs, current Lok Sabha)** — fork Vonter's repo, adapt to
   your schema. Highest signal, cleanest structure, plugs directly into the
   existing Politician Directory.
2. **PRS attendance/questions scrape** — gives you the Legislative pillar
   for free, joins to the same MP records from step 1.
3. **Allocation of Business Rules PDF parse** — one-time-ish structured
   extraction, gives you the department mandate table.
4. **IAS Civil List** — the officer-level data, join to step 3's departments.
5. **One state's MLA fund scraper, end-to-end** (pilot before generalizing
   to all 28 states).
6. **NJDG aggregate judicial stats.**
7. Everything else (CPGRAMS, eGazette, per-case eCourts) as follow-on phases.

## Cross-cutting notes for the coding agent

- None of these sources have a clean public API except the semi-documented
  MyNeta scraping pattern — budget for HTML-scrape fragility across the
  board, and build each scraper to fail loudly (like your existing
  `works_recommended: FAILED — Request timed out` pattern in
  `metadata.json`) rather than silently dropping records.
- Government sites change layout/URLs on ministry reshuffles and portal
  redesigns without redirects — version your scrapers' selectors and keep
  a `last_verified_at` per source in metadata, same pattern you're already
  using in `data/mplads/metadata.json`.
- Build the department-name alias table (§4b) early — it's the connective
  tissue across almost every source above.

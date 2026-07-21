---
wave: 2
depends_on: []
files_modified:
  - "frontend/src/app/transparency/page.tsx"
  - "frontend/src/components/transparency/spending-table.tsx"
autonomous: true
must_haves:
  - "Transparency page route renders at /transparency"
  - "D-02: SpendingTable component implements sortable/pageable custom native Interactive UI data table fetching from the DB"
  - "Page fetches max 1000 spending records and passes to table"
---

# Phase 4d: Transparency Ledger

## Goal
Build the Transparency Portal (financial ledger) natively inside the app using a robust data table UI.

<threat_model>
- **Data Leakage:** Low risk, since the data is intended to be public.
- **DDoS / Expensive Queries:** High risk if the table supports unpaginated fetching of the entire database. Mitigation: Enforce strict pagination/limits on database queries.
</threat_model>

## Tasks

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-PATTERNS.md</file>
    <file>frontend/src/components/transparency/spending-table.tsx</file>
  </read_first>
  <action>
    Create `frontend/src/components/transparency/spending-table.tsx` as a Client Component.
    Implement a `shadcn/ui` `DataTable` (which wraps `@tanstack/react-table`).
    Define table columns: `date`, `department`, `amount`, `description`, `recipient`.
    Implement basic client-side pagination and column sorting features.
  </action>
  <acceptance_criteria>
    Component renders a table with the specified columns.
    Sorting clicking on column headers works.
    Pagination controls (next/prev page) work.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>frontend/src/app/transparency/page.tsx</file>
  </read_first>
  <action>
    Create the server component `frontend/src/app/transparency/page.tsx`.
    Fetch up to 1000 records from the `spending` table (order by date descending) using the Supabase server client.
    Pass the fetched data to `<SpendingTable data={spendingRecords} />`.
    Include a page header "Transparency Ledger".
  </action>
  <acceptance_criteria>
    Visiting `/transparency` route loads without error.
    The data table displays rows populated directly from the `spending` table.
  </acceptance_criteria>
</task>

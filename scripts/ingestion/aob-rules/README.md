# Executive: Allocation of Business (AoB) Rules Ingestion Pipeline

## Source
- **Primary Source**: Cabinet Secretariat, Government of India
- **Index URL**: `https://cabsec.gov.in/businessrules/allocationofbusinessrules/`
- **Second Schedule**: `https://cabsec.gov.in/aob_first.php?page=1`
- **Amendments**: `https://cabsec.gov.in/amendment/`

## Cadence & Refresh
- **Refresh Frequency**: Monthly / Post-Gazette Amendment Notifications
- **Table**: `public.department_mandates`
- **Fields Ingested**: `department_name`, `mandate_summary`, `subject_rules`, `amendment_date`, `source_doc`

## Run Instructions
```bash
node scripts/ingestion/aob-rules/load.js
```

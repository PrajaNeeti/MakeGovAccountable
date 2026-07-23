# Executive: Senior IAS Civil Service Roster Ingestion Pipeline

## Source
- **Primary Source**: Department of Personnel and Training (DoPT), Government of India
- **System Portal**: `https://iascivillist.dopt.gov.in/`
- **Mirror**: `https://easy.nic.in/civilListIAS`

## Cadence & Refresh
- **Refresh Frequency**: Quarterly (postings update frequently; batch info remains stable)
- **Target Table**: `public.ias_officers`
- **Scope**: Secretary level & Pay Level 14–17 (Joint Secretary and above)

## Run Instructions
```bash
node scripts/ingestion/ias-roster/load.js
```

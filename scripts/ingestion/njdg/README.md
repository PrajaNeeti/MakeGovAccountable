# Judicial: NJDG Court Pendency & Backlogs Ingestion Pipeline

## Source
- **Primary Portal**: National Judicial Data Grid (NJDG) High Courts & District Courts (`https://njdg.ecourts.gov.in/`)
- **Open Data**: `data.gov.in` (High Court & District Court pendency datasets)

## Cadence & Refresh
- **Refresh Frequency**: Weekly
- **Target Table**: `public.judicial_aggregates`
- **Fields Ingested**: `state`, `court_name`, `pending_cases`, `disposed_cases`, `civil_pending`, `criminal_pending`, `cases_over_10yrs`, `period_year`, `source_url`

## Run Instructions
```bash
node scripts/ingestion/njdg/load.js
```

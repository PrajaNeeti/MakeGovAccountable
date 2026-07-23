# Legislative: MP Affidavits & PRS Performance Metrics Ingestion Pipeline

## Source
- **ADR / MyNeta**: `https://myneta.info/LokSabha2024` (Election Disclosures - Wealth, Liabilities, Cases, Education)
- **ECI Archive**: `affidavitarchive.nic.in`
- **PRS Legislative Research**: `https://prsindia.org/mptrack` (Attendance %, Questions asked, Debates, Bills)

## Cadence & Refresh
- **Affidavits**: Once per election cycle (5 years)
- **PRS Stats**: 3x per year (post parliamentary session)
- **Tables**: `public.politician_affidavits`, `public.mp_legislative_stats`

## Run Instructions
```bash
node scripts/ingestion/mp-affidavits/load.js
```

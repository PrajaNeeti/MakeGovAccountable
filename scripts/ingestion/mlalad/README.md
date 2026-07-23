# State MLALAD / Local Area Development Funds Ingestion Pipeline

## Source
- **Gujarat MLALAD**: Gujarat State Planning Department (`gujarat.gov.in`)
- **Maharashtra MLAD**: Maharashtra Planning Department (`planning.maharashtra.gov.in`)
- **Karnataka MLALAD**: Finance Department, Govt of Karnataka (`finance.karnataka.gov.in`)
- **UP Vidhayak Nidhi**: Urban & Rural Development Dept, Govt of UP (`up.gov.in/vidhayaknidhi`)

## Cadence & Refresh
- **Refresh Frequency**: Quarterly (financial year cycle updates)
- **Target Table**: `public.mlalad_schemes`
- **Fields Ingested**: `state`, `district`, `constituency`, `mla_name`, `allocated_amount`, `total_expenditure`, `unspent_amount`, `completed_works_count`, `source_url`

## Run Instructions
```bash
node scripts/ingestion/mlalad/load.js
```

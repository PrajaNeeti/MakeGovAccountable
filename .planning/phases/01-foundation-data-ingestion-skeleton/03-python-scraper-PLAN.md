---
wave: 2
depends_on: 02-supabase-schema-PLAN.md
files_modified:
  - backend/pyproject.toml
  - backend/main.py
  - backend/.env.example
autonomous: true
requirements_addressed:
  - Implement a basic AI data ingestion script (hybrid scraper/API client) for a single test source.
---

# Plan: AI Data Ingestion Pipeline (Python)

## Objective
Implement a basic AI data ingestion script using Scrapling for web scraping and an AI provider for extraction. The script will act as a background worker, process raw scraped data into strictly typed JSON mapping to the Postgres schema, and write it directly to the Supabase database.

## Tasks

```xml
<task>
  <read_first>
    - .planning/phases/01-foundation-data-ingestion-skeleton/01-CONTEXT.md
  </read_first>
  <action>
    Initialize a new Python project in the `backend/` directory using `uv`. Define dependencies in `pyproject.toml` including `scrapling`, `supabase`, and a library for LLM interaction (e.g., `openai` or `langchain-core` if preferred, but simple `openai` client works for Gemini/OpenRouter/Anthropic). Add an `.env.example` file specifying `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (for admin access), and `AI_PROVIDER_API_KEY`.
  </action>
  <acceptance_criteria>
    - `backend/pyproject.toml` exists and lists `scrapling` and `supabase`.
    - `uv pip install -e backend/` or `uv sync` succeeds.
    - `backend/.env.example` includes the required Supabase and AI keys.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - backend/main.py (to be created)
  </read_first>
  <action>
    Implement a test scraping script in `backend/main.py` using `scrapling`. Configure the script to fetch a single predefined public government test source (e.g., a dummy URL or public press release). Implement the AI extraction prompt that enforces output as strictly typed JSON mapping to the `politicians` or `departments` Postgres schema.
  </action>
  <acceptance_criteria>
    - `backend/main.py` exists and contains imports for `scrapling` and the LLM client.
    - The LLM prompt explicitly requests strict JSON output matching the target schema.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - backend/main.py
  </read_first>
  <action>
    Extend `backend/main.py` to connect to Supabase using the service role key. Write the AI-extracted JSON data directly to the respective Supabase tables. Implement error handling to catch extraction failures and save the raw HTML/text to the `extraction_logs` table for manual review.
  </action>
  <acceptance_criteria>
    - `backend/main.py` contains `supabase.table('politicians').insert(...)` or similar logic.
    - An exception block exists that executes `supabase.table('extraction_logs').insert(...)` if parsing or validation fails.
  </acceptance_criteria>
</task>
```

## Verification

- [ ] Python project successfully initializes with `uv`.
- [ ] `backend/main.py` can be executed without syntax errors.
- [ ] The script connects to Supabase and writes data (or writes to `extraction_logs` on failure).

## Must Haves

<truths>
- The Python scraper must reside in the `backend/` directory.
- `uv` must be used for Python dependency management.
- The scraper must connect to Supabase using the service role key to bypass RLS for writing.
- Extraction failures must be logged to the `extraction_logs` table.
</truths>

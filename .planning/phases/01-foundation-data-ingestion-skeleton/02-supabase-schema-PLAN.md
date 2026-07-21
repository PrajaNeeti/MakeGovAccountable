---
wave: 1
depends_on: none
files_modified:
  - supabase/migrations/00000000000000_initial_schema.sql
  - supabase/seed.sql
autonomous: false
requirements_addressed:
  - Set up database schema for tracking government entities (Politicians, Departments, Courts).
---

# Plan: Supabase Schema and Database Setup

## Objective
Set up the PostgreSQL database schema using Supabase migrations for tracking government entities (Politicians, Departments, Courts). Implement temporal tracking, public users table mapping, and Row Level Security (RLS) policies.

## Tasks

```xml
<task>
  <read_first>
    - .planning/phases/01-foundation-data-ingestion-skeleton/01-CONTEXT.md
  </read_first>
  <action>
    Create the initial Supabase migration file `supabase/migrations/00000000000000_initial_schema.sql`. Define the tables: `politicians`, `departments`, `courts`, and `roles`. The `roles` table links politicians to entities and includes `valid_from` and `valid_to` date columns for Temporal tracking. Define a public `users` table with a trigger that automatically inserts a row when a new user signs up in `auth.users`, storing their role (Guest vs Admin). Use UUID v4 for all primary keys.
  </action>
  <acceptance_criteria>
    - `supabase/migrations/00000000000000_initial_schema.sql` contains `CREATE TABLE politicians`, `CREATE TABLE roles`, etc.
    - The `roles` table contains `valid_from` and `valid_to` columns.
    - A trigger function `on_auth_user_created` is defined.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - supabase/migrations/00000000000000_initial_schema.sql
  </read_first>
  <action>
    Add Row Level Security (RLS) policies in the migration file. Enable RLS on all tables. Create policies such that Admins have full access (ALL) to all tables, while public/guest users have read-only (SELECT) access to tables where `public=true` (or appropriate data). Create a `extraction_logs` table for saving raw extraction data, restricted strictly to Admins.
  </action>
  <acceptance_criteria>
    - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` is present for all new tables.
    - `CREATE POLICY` statements exist granting read access to guests and full access to admins.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - supabase/migrations/00000000000000_initial_schema.sql
  </read_first>
  <action>
    **[BLOCKING] Schema Push Required**
    This phase modifies schema-relevant files (`supabase/migrations/*.sql`). Run the database schema push command to apply migrations to the local Supabase instance.
    Command: `supabase db push` (or `supabase start` if running locally for the first time).
  </action>
  <acceptance_criteria>
    - The local Supabase database has the new tables (can be verified with a `psql` query or Supabase CLI status).
  </acceptance_criteria>
</task>
```

## Verification

- [ ] Supabase CLI successfully starts and applies migrations without errors.
- [ ] Tables `politicians`, `roles`, `departments`, `courts`, `users`, and `extraction_logs` exist in the database.
- [ ] RLS is enabled on all tables.

## Must Haves

<truths>
- The database schema must use UUIDs for primary keys.
- Temporal tracking is implemented via `valid_from` and `valid_to` in the `roles` table.
- A mandatory schema push task must run before verification.
</truths>

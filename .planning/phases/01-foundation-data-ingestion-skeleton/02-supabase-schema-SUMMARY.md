# Supabase Schema Setup Summary

## Completed Tasks
- Created the initial Supabase migration file `supabase/migrations/00000000000000_initial_schema.sql` with tables for `politicians`, `departments`, `courts`, `roles`, `users`, and `extraction_logs`.
- Defined temporal tracking columns (`valid_from`, `valid_to`) in the `roles` table.
- Added a trigger `on_auth_user_created` to sync new signups from `auth.users` to `public.users` with a default 'Guest' role.
- Enabled Full Row Level Security (RLS) on all tables and defined strict policies for Admins and read-only access for Guests/Public.
- Created an empty `supabase/seed.sql` file.

## Blockers / Unfinished Tasks
- **Supabase Start/Push**: The `npx supabase start` command failed because Docker Desktop is not running or not installed on this system (could not connect to the Docker pipe). The migrations could not be pushed to a local Supabase instance and the verification steps relying on a running database were skipped.

## Next Steps
- Start Docker Desktop and run `npx supabase start` to apply the migrations locally and verify the tables and RLS policies.

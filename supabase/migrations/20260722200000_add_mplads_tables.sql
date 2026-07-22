-- Migration to add MPLADS Oversight tables in Supabase Postgres

CREATE TABLE IF NOT EXISTS mplads_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT UNIQUE NOT NULL,
    total_allocated NUMERIC DEFAULT 0,
    total_expenditure NUMERIC DEFAULT 0,
    utilization_percentage NUMERIC DEFAULT 0,
    completed_works_count INT DEFAULT 0,
    recommended_works_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mplads_mps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mp_name TEXT NOT NULL,
    house TEXT DEFAULT 'Lok Sabha',
    constituency TEXT,
    state TEXT,
    allocated_amount NUMERIC DEFAULT 0,
    total_expenditure NUMERIC DEFAULT 0,
    unspent_amount NUMERIC DEFAULT 0,
    utilization_percentage NUMERIC DEFAULT 0,
    completed_works_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mplads_completed_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id BIGINT UNIQUE,
    work_description TEXT NOT NULL,
    category TEXT,
    cost NUMERIC DEFAULT 0,
    location TEXT,
    district TEXT,
    state TEXT,
    mp_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE mplads_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE mplads_mps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mplads_completed_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on mplads_states" ON mplads_states FOR SELECT USING (true);
CREATE POLICY "Allow public read access on mplads_mps" ON mplads_mps FOR SELECT USING (true);
CREATE POLICY "Allow public read access on mplads_completed_works" ON mplads_completed_works FOR SELECT USING (true);

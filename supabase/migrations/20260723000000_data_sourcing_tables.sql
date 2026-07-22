-- Migration for Data Sourcing Spec: Politicians, Legislative, Executive (AoB + IAS), MLALAD, Judicial, Entity Aliases

-- 1. Politician Affidavits (MyNeta / ADR data)
CREATE TABLE IF NOT EXISTS public.politician_affidavits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES public.politicians(id) ON DELETE SET NULL,
    election_year INT NOT NULL,
    house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha', 'Vidhan Sabha')),
    state TEXT NOT NULL,
    constituency TEXT NOT NULL,
    party TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    myneta_candidate_id TEXT,
    winner_flag BOOLEAN DEFAULT false,
    criminal_cases_count INT DEFAULT 0,
    criminal_ipc_sections TEXT,
    education TEXT,
    total_assets NUMERIC DEFAULT 0,
    total_liabilities NUMERIC DEFAULT 0,
    movable_assets NUMERIC DEFAULT 0,
    immovable_assets NUMERIC DEFAULT 0,
    cash_amount NUMERIC DEFAULT 0,
    jewellery_value NUMERIC DEFAULT 0,
    age INT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MP Legislative Statistics (PRS India data)
CREATE TABLE IF NOT EXISTS public.mp_legislative_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES public.politicians(id) ON DELETE SET NULL,
    mp_name TEXT NOT NULL,
    house TEXT NOT NULL CHECK (house IN ('Lok Sabha', 'Rajya Sabha', 'Vidhan Sabha', 'Vidhan Parishad')),
    attendance_pct NUMERIC DEFAULT 0,
    questions_asked INT DEFAULT 0,
    debates_participated INT DEFAULT 0,
    private_bills_introduced INT DEFAULT 0,
    state TEXT,
    constituency TEXT,
    source_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Executive Department Mandates (Allocation of Business Rules)
CREATE TABLE IF NOT EXISTS public.department_mandates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    department_name TEXT NOT NULL,
    mandate_summary TEXT NOT NULL,
    subject_rules TEXT,
    amendment_date DATE,
    source_doc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IAS Civil List Officers
CREATE TABLE IF NOT EXISTS public.ias_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_name TEXT NOT NULL,
    allotment_year INT,
    cadre TEXT NOT NULL,
    current_posting TEXT,
    pay_level TEXT,
    qualification TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Entity Aliases (connects variations in department/officer names)
CREATE TABLE IF NOT EXISTS public.entity_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_name TEXT UNIQUE NOT NULL,
    canonical_entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('department', 'politician', 'court', 'ias_officer')),
    similarity_score NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MLALAD State Schemes (Gujarat Pilot & expansion)
CREATE TABLE IF NOT EXISTS public.mlalad_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL DEFAULT 'Gujarat',
    district TEXT,
    constituency TEXT,
    mla_name TEXT NOT NULL,
    allocated_amount NUMERIC DEFAULT 0,
    total_expenditure NUMERIC DEFAULT 0,
    unspent_amount NUMERIC DEFAULT 0,
    completed_works_count INT DEFAULT 0,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Judicial Aggregates (NJDG data)
CREATE TABLE IF NOT EXISTS public.judicial_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
    state TEXT NOT NULL,
    court_name TEXT NOT NULL,
    pending_cases INT DEFAULT 0,
    disposed_cases INT DEFAULT 0,
    civil_pending INT DEFAULT 0,
    criminal_pending INT DEFAULT 0,
    cases_over_10yrs INT DEFAULT 0,
    period_year INT NOT NULL DEFAULT 2024,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE public.politician_affidavits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_legislative_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ias_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mlalad_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_aggregates ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public read politician_affidavits" ON public.politician_affidavits;
CREATE POLICY "Public read politician_affidavits" ON public.politician_affidavits FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read mp_legislative_stats" ON public.mp_legislative_stats;
CREATE POLICY "Public read mp_legislative_stats" ON public.mp_legislative_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read department_mandates" ON public.department_mandates;
CREATE POLICY "Public read department_mandates" ON public.department_mandates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ias_officers" ON public.ias_officers;
CREATE POLICY "Public read ias_officers" ON public.ias_officers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read entity_aliases" ON public.entity_aliases;
CREATE POLICY "Public read entity_aliases" ON public.entity_aliases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read mlalad_schemes" ON public.mlalad_schemes;
CREATE POLICY "Public read mlalad_schemes" ON public.mlalad_schemes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read judicial_aggregates" ON public.judicial_aggregates;
CREATE POLICY "Public read judicial_aggregates" ON public.judicial_aggregates FOR SELECT USING (true);

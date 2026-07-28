-- Migration: Add tables for MP Career Timelines, Case Allegations, and Public Promises

-- 1. Politician Career Timelines
CREATE TABLE IF NOT EXISTS public.politician_career_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES public.politicians(id) ON DELETE CASCADE,
    mp_name_key TEXT NOT NULL,
    period TEXT NOT NULL,
    position TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    start_year INT,
    end_year INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Politician Case Allegations & Legal Disclosures
CREATE TABLE IF NOT EXISTS public.politician_case_allegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES public.politicians(id) ON DELETE CASCADE,
    mp_name_key TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('declared_affidavit', 'media_allegation')),
    description TEXT NOT NULL,
    case_summary TEXT,
    status TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    event_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Politician Public Promises & Fact-Check Records
CREATE TABLE IF NOT EXISTS public.politician_public_promises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID REFERENCES public.politicians(id) ON DELETE CASCADE,
    mp_name_key TEXT NOT NULL,
    promise_text TEXT NOT NULL,
    context TEXT,
    public_belief_vs_fact TEXT,
    source_name TEXT,
    source_url TEXT,
    pledge_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_career_timeline_pol_id ON public.politician_career_timeline(politician_id);
CREATE INDEX IF NOT EXISTS idx_career_timeline_mp_name ON public.politician_career_timeline(mp_name_key);

CREATE INDEX IF NOT EXISTS idx_case_allegations_pol_id ON public.politician_case_allegations(politician_id);
CREATE INDEX IF NOT EXISTS idx_case_allegations_mp_name ON public.politician_case_allegations(mp_name_key);

CREATE INDEX IF NOT EXISTS idx_public_promises_pol_id ON public.politician_public_promises(politician_id);
CREATE INDEX IF NOT EXISTS idx_public_promises_mp_name ON public.politician_public_promises(mp_name_key);

-- Enable RLS
ALTER TABLE public.politician_career_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_case_allegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_public_promises ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public read politician_career_timeline" ON public.politician_career_timeline;
CREATE POLICY "Public read politician_career_timeline" ON public.politician_career_timeline FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read politician_case_allegations" ON public.politician_case_allegations;
CREATE POLICY "Public read politician_case_allegations" ON public.politician_case_allegations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read politician_public_promises" ON public.politician_public_promises;
CREATE POLICY "Public read politician_public_promises" ON public.politician_public_promises FOR SELECT USING (true);

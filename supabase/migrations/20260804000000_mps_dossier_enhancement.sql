-- Migration for 781 MPS Database Integration

ALTER TABLE public.politicians
  ADD COLUMN IF NOT EXISTS house TEXT,
  ADD COLUMN IF NOT EXISTS constituency TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS party TEXT,
  ADD COLUMN IF NOT EXISTS prs_source_url TEXT,
  ADD COLUMN IF NOT EXISTS career_timeline JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS case_allegations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS promises JSONB DEFAULT '[]'::jsonb;

-- Indexing for fast search and filtering across 781 MPs
CREATE INDEX IF NOT EXISTS idx_politicians_house ON public.politicians(house);
CREATE INDEX IF NOT EXISTS idx_politicians_state ON public.politicians(state);
CREATE INDEX IF NOT EXISTS idx_politicians_party ON public.politicians(party);

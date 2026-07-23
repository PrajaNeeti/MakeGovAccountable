-- Migration for Ingestion Telemetry & Audit Logs

CREATE TABLE IF NOT EXISTS public.ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
    records_processed INT DEFAULT 0,
    error_message TEXT,
    execution_time_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policy for Transparency Dashboard
DROP POLICY IF EXISTS "Public read ingestion_logs" ON public.ingestion_logs;
CREATE POLICY "Public read ingestion_logs" ON public.ingestion_logs FOR SELECT USING (true);

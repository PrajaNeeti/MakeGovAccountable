-- Add location fields to concerns
ALTER TABLE public.concerns
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS area TEXT;

CREATE INDEX IF NOT EXISTS concerns_state_idx ON public.concerns(state);
CREATE INDEX IF NOT EXISTS concerns_city_idx ON public.concerns(city);

-- Create signatures table (1 vote per user per concern)
CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concern_id UUID NOT NULL REFERENCES public.concerns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(concern_id, user_id) -- Prevents double voting
);

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can sign once" ON public.signatures
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view signatures" ON public.signatures
    FOR SELECT USING (true);

ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS signatures_count INTEGER NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION update_signatures_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.concerns SET signatures_count = signatures_count + 1 WHERE id = NEW.concern_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.concerns SET signatures_count = signatures_count - 1 WHERE id = OLD.concern_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_signatures_count ON public.signatures;
CREATE TRIGGER trigger_update_signatures_count
AFTER INSERT OR DELETE ON public.signatures
FOR EACH ROW EXECUTE FUNCTION update_signatures_count();
CREATE TABLE public.statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
    statement_text TEXT NOT NULL,
    date_made DATE NOT NULL,
    source_url TEXT,
    context TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    public BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to statements" ON public.statements FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to public statements" ON public.statements FOR SELECT USING (public = true);

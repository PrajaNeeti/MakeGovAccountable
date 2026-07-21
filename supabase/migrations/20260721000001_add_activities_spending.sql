-- Create activities table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create spending table
CREATE TABLE public.spending (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add branch column to relevant entities
ALTER TABLE public.departments ADD COLUMN branch TEXT DEFAULT 'Executive';
ALTER TABLE public.courts ADD COLUMN branch TEXT DEFAULT 'Judicial';
ALTER TABLE public.roles ADD COLUMN branch TEXT;

-- Update roles check constraint
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_check;
ALTER TABLE public.roles ADD CONSTRAINT roles_check CHECK (department_id IS NOT NULL OR court_id IS NOT NULL OR branch = 'Legislative');

-- RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to activities" ON public.activities FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to activities" ON public.activities FOR SELECT USING (true);

CREATE POLICY "Admins have full access to spending" ON public.spending FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to spending" ON public.spending FOR SELECT USING (true);

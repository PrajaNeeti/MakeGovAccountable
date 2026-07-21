CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Guest' CHECK (role IN ('Guest', 'Admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.politicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    public BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    public BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    jurisdiction TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    public BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    public BOOLEAN NOT NULL DEFAULT true,
    CHECK (department_id IS NOT NULL OR court_id IS NOT NULL)
);

CREATE TABLE public.extraction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url TEXT,
    raw_content TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Triggers for auth

CREATE OR REPLACE FUNCTION public.on_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (new.id, 'Guest');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.on_auth_user_created();

-- 3. RLS

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN coalesce(user_role = 'Admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- users policies
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());

-- politicians policies
CREATE POLICY "Admins have full access to politicians" ON public.politicians FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to public politicians" ON public.politicians FOR SELECT USING (public = true);

-- departments policies
CREATE POLICY "Admins have full access to departments" ON public.departments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to public departments" ON public.departments FOR SELECT USING (public = true);

-- courts policies
CREATE POLICY "Admins have full access to courts" ON public.courts FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to public courts" ON public.courts FOR SELECT USING (public = true);

-- roles policies
CREATE POLICY "Admins have full access to roles" ON public.roles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Public has read access to public roles" ON public.roles FOR SELECT USING (public = true);

-- extraction_logs policies
CREATE POLICY "Admins have full access to extraction logs" ON public.extraction_logs FOR ALL TO authenticated USING (public.is_admin());

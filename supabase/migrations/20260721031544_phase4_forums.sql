CREATE TABLE public.discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pseudonym TEXT;

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read discussions" ON public.discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create discussions" ON public.discussions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public can read forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to forum posts" ON public.forum_posts FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authenticated users can report posts" ON public.moderation_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Admins have full access to moderation reports" ON public.moderation_reports FOR ALL TO authenticated USING (public.is_admin());

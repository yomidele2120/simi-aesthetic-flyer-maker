
-- Add missing columns to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS hero_enabled boolean DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS hero_expires_at timestamp with time zone;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS importance_score integer DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS subheadline text;

-- Create article_media table
CREATE TABLE IF NOT EXISTS public.article_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  is_featured boolean DEFAULT false,
  position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article media" ON public.article_media FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can manage article media" ON public.article_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create article_views table
CREATE TABLE IF NOT EXISTS public.article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  session_id text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article views" ON public.article_views FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert article views" ON public.article_views FOR INSERT TO public WITH CHECK (true);

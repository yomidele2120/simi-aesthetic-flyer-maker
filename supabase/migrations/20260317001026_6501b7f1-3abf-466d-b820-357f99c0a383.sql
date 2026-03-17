
-- Add new columns to articles (non-breaking additions)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS hero_enabled boolean DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS hero_expires_at timestamptz;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS importance_score integer DEFAULT 50;

-- Article media table
CREATE TABLE IF NOT EXISTS public.article_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  media_url text NOT NULL,
  media_type text DEFAULT 'image',
  is_featured boolean DEFAULT false,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view article media" ON public.article_media
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users manage media" ON public.article_media
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Article views for trending detection
CREATE TABLE IF NOT EXISTS public.article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  session_id text
);

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert views" ON public.article_views
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Authenticated users read views" ON public.article_views
  FOR SELECT TO authenticated USING (true);

-- Storage bucket for article media
INSERT INTO storage.buckets (id, name, public) VALUES ('article-media', 'article-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view article media files" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'article-media');

CREATE POLICY "Authenticated users upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-media');

CREATE POLICY "Authenticated users delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'article-media');

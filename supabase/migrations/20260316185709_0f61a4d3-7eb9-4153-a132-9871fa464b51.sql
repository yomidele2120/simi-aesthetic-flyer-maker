
-- Articles table
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  content text,
  category text NOT NULL DEFAULT 'Nigeria',
  subcategory text,
  author text DEFAULT 'CoreNews Staff',
  image_url text,
  source_url text,
  source_name text,
  read_time text DEFAULT '5 min',
  is_breaking boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  is_opinion boolean DEFAULT false,
  is_important boolean DEFAULT false,
  show_in_hero boolean DEFAULT false,
  hero_duration_hours integer DEFAULT 24,
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can read published articles" ON public.articles
  FOR SELECT USING (status = 'published');

-- Authenticated users can manage articles
CREATE POLICY "Authenticated users can insert articles" ON public.articles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles" ON public.articles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete articles" ON public.articles
  FOR DELETE TO authenticated USING (true);

-- AI Suggestions table
CREATE TABLE public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_title text NOT NULL,
  original_summary text,
  ai_title text,
  ai_summary text,
  ai_content text,
  ai_headlines jsonb DEFAULT '[]'::jsonb,
  source_url text,
  source_name text,
  image_url text,
  category text,
  confidence integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage suggestions
CREATE POLICY "Authenticated users can read suggestions" ON public.ai_suggestions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert suggestions" ON public.ai_suggestions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update suggestions" ON public.ai_suggestions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Service role inserts from edge functions bypass RLS, but also allow anon for edge function inserts
CREATE POLICY "Allow inserts from edge functions" ON public.ai_suggestions
  FOR INSERT WITH CHECK (true);

-- Enable realtime for articles
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;

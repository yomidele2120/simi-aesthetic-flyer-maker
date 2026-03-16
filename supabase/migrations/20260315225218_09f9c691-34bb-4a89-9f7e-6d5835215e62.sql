
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
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI suggestions table
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
  category text DEFAULT 'Nigeria',
  confidence integer DEFAULT 50,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can read published articles" ON public.articles
  FOR SELECT USING (status = 'published');

-- Authenticated can manage all articles
CREATE POLICY "Authenticated users manage articles" ON public.articles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Authenticated can manage suggestions
CREATE POLICY "Authenticated users manage suggestions" ON public.ai_suggestions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for articles
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;

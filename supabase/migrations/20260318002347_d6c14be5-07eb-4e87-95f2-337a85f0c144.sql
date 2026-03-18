
-- Article likes table
CREATE TABLE public.article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id)
);

ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can see like counts
CREATE POLICY "Anyone can read likes" ON public.article_likes
  FOR SELECT TO public USING (true);

-- Authenticated users can like
CREATE POLICY "Authenticated users can insert likes" ON public.article_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own
CREATE POLICY "Users can delete own likes" ON public.article_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Article comments table
CREATE TABLE public.article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments" ON public.article_comments
  FOR SELECT TO public USING (status = 'approved');

-- Authenticated users can post comments
CREATE POLICY "Authenticated users can insert comments" ON public.article_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can delete own comments
CREATE POLICY "Users can delete own comments" ON public.article_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Authenticated users can read all comments (for admin moderation)
CREATE POLICY "Authenticated users can read all comments" ON public.article_comments
  FOR SELECT TO authenticated USING (true);

-- Authenticated users can update comment status (moderation)
CREATE POLICY "Authenticated users can moderate comments" ON public.article_comments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

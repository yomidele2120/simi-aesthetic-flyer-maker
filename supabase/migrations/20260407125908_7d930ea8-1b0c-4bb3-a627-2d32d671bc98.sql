
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS viral_headline text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.ai_suggestions ADD COLUMN IF NOT EXISTS viral_headline text;
ALTER TABLE public.ai_suggestions ADD COLUMN IF NOT EXISTS video_url text;

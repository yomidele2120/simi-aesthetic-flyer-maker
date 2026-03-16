
-- Create storage bucket for article media
INSERT INTO storage.buckets (id, name, public) VALUES ('article-media', 'article-media', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-media');

-- Allow public read access
CREATE POLICY "Public can read article media" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-media');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'article-media');

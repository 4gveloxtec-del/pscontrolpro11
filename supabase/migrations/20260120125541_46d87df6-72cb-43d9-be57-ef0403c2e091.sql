-- Create storage bucket for server icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('server-icons', 'server-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view server icons (public bucket)
CREATE POLICY "Server icons are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'server-icons');

-- Allow authenticated users to upload their own server icons
CREATE POLICY "Users can upload server icons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'server-icons' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own uploaded icons
CREATE POLICY "Users can update their server icons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'server-icons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploaded icons
CREATE POLICY "Users can delete their server icons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'server-icons' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Create public bucket for cached story audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-audio', 'story-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read audio files (they are public URLs)
CREATE POLICY "Public read story audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-audio');

-- Allow service role (edge functions) to upload audio files
CREATE POLICY "Service role insert story audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-audio');

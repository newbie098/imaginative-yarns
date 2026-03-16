CREATE TABLE public.cached_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_hash TEXT NOT NULL UNIQUE,
  answers JSONB NOT NULL,
  story_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anyone to read cached stories (public cache to save AI credits)
ALTER TABLE public.cached_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached stories"
ON public.cached_stories
FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can insert (after generating a story)
CREATE POLICY "Authenticated users can insert cached stories"
ON public.cached_stories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also allow anon to insert since the app doesn't require auth to generate
CREATE POLICY "Anon can insert cached stories"
ON public.cached_stories
FOR INSERT
TO anon
WITH CHECK (true);
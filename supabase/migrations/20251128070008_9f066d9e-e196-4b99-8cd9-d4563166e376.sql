-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  is_public BOOLEAN DEFAULT true
);

-- Create story_views table to track who viewed stories
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Users can view public stories that haven't expired"
ON public.stories FOR SELECT
USING (is_public = true AND expires_at > now());

CREATE POLICY "Users can view their own stories"
ON public.stories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories"
ON public.stories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
ON public.stories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
ON public.stories FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for story_views
CREATE POLICY "Anyone can view story views"
ON public.story_views FOR SELECT
USING (true);

CREATE POLICY "Users can create story views"
ON public.story_views FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Create storage bucket for stories
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for stories
CREATE POLICY "Users can upload their own stories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view story files"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Users can update their own story files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own story files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
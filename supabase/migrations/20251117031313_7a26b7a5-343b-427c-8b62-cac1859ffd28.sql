-- Create reposts table
CREATE TABLE public.reposts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reposts
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reposts
CREATE POLICY "Users can view all reposts"
ON public.reposts
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own reposts"
ON public.reposts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts"
ON public.reposts
FOR DELETE
USING (auth.uid() = user_id);

-- Create video_tags table
CREATE TABLE public.video_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for video_tags
ALTER TABLE public.video_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_tags
CREATE POLICY "Users can view all video tags"
ON public.video_tags
FOR SELECT
USING (true);

CREATE POLICY "Users can create tags"
ON public.video_tags
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete tags they created or tags of them"
ON public.video_tags
FOR DELETE
USING (auth.uid() = created_by OR auth.uid() = tagged_user_id);

-- Create indexes for better performance
CREATE INDEX idx_reposts_user_id ON public.reposts(user_id);
CREATE INDEX idx_reposts_video_id ON public.reposts(original_video_id);
CREATE INDEX idx_video_tags_video_id ON public.video_tags(video_id);
CREATE INDEX idx_video_tags_tagged_user ON public.video_tags(tagged_user_id);
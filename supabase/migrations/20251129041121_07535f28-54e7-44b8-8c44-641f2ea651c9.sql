-- Add is_archived column to stories table
ALTER TABLE public.stories 
ADD COLUMN is_archived BOOLEAN DEFAULT false;

-- Add index for better query performance on archived stories
CREATE INDEX idx_stories_archived ON public.stories(user_id, is_archived, created_at DESC);

-- Update RLS policies to allow viewing archived stories
DROP POLICY IF EXISTS "Users can view public stories that haven't expired" ON public.stories;

CREATE POLICY "Users can view public stories that haven't expired or archived" 
ON public.stories 
FOR SELECT 
USING (
  (is_public = true AND expires_at > now()) 
  OR (auth.uid() = user_id)
  OR (is_archived = true AND is_public = true)
);
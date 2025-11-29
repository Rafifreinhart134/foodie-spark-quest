-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

-- Create a more restrictive policy that only allows viewing comments on accessible videos
CREATE POLICY "Users can view comments on accessible videos"
ON public.comments
FOR SELECT
USING (
  -- Allow if the related video is public
  EXISTS (
    SELECT 1 FROM public.videos
    WHERE videos.id = comments.video_id
    AND videos.is_public = true
  )
  OR
  -- Allow if user owns the video
  EXISTS (
    SELECT 1 FROM public.videos
    WHERE videos.id = comments.video_id
    AND videos.user_id = auth.uid()
  )
);
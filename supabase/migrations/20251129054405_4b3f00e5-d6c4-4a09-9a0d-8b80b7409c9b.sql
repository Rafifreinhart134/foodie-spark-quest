-- Create playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists
CREATE POLICY "Users can view public playlists"
  ON public.playlists FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Create playlist_videos junction table
CREATE TABLE public.playlist_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(playlist_id, video_id)
);

-- Enable RLS
ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlist_videos
CREATE POLICY "Anyone can view playlist videos"
  ON public.playlist_videos FOR SELECT
  USING (true);

CREATE POLICY "Playlist owners can add videos"
  ON public.playlist_videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Playlist owners can remove videos"
  ON public.playlist_videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE id = playlist_id AND user_id = auth.uid()
    )
  );

-- Create function to update playlist updated_at
CREATE OR REPLACE FUNCTION public.update_playlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for playlist updates
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_playlist_updated_at();
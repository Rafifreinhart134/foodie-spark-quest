-- Create custom types
CREATE TYPE public.content_category AS ENUM ('resep', 'hidden_gem', 'tips');
CREATE TYPE public.notification_type AS ENUM ('like', 'comment', 'follow', 'badge', 'voucher');
CREATE TYPE public.badge_type AS ENUM ('first_upload', 'viral_content', 'helpful_reviewer', 'explorer');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT,
  thumbnail_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category content_category NOT NULL,
  tags TEXT[],
  budget TEXT,
  cooking_time TEXT,
  location TEXT,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create saved_videos table (for wishlist)
CREATE TABLE public.saved_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  content TEXT NOT NULL,
  related_video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coins table
CREATE TABLE public.coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  value INTEGER NOT NULL,
  description TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create places table (for hidden gems)
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  photo_url TEXT,
  description TEXT,
  price_range TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true),
  ('avatars', 'avatars', true),
  ('places', 'places', true);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for videos
CREATE POLICY "Anyone can view public videos" ON public.videos FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own videos" ON public.videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own videos" ON public.videos FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own likes" ON public.likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_videos
CREATE POLICY "Users can view their own saved videos" ON public.saved_videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save videos" ON public.saved_videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own saved videos" ON public.saved_videos FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for coins
CREATE POLICY "Users can view their own coins" ON public.coins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert/update coins" ON public.coins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update coins" ON public.coins FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Users can view their own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can award badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vouchers
CREATE POLICY "Users can view their own vouchers" ON public.vouchers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create vouchers" ON public.vouchers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vouchers" ON public.vouchers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for places
CREATE POLICY "Anyone can view places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create places" ON public.places FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own places" ON public.places FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own places" ON public.places FOR DELETE USING (auth.uid() = created_by);

-- Storage policies for videos
CREATE POLICY "Anyone can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Authenticated users can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for thumbnails
CREATE POLICY "Anyone can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for places
CREATE POLICY "Anyone can view place photos" ON storage.objects FOR SELECT USING (bucket_id = 'places');
CREATE POLICY "Authenticated users can upload place photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'places' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own place photos" ON storage.objects FOR UPDATE USING (bucket_id = 'places' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own place photos" ON storage.objects FOR DELETE USING (bucket_id = 'places' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'avatar_url');
  
  INSERT INTO public.coins (user_id, balance)
  VALUES (NEW.id, 100); -- Welcome bonus
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle like/unlike and update counts
CREATE OR REPLACE FUNCTION public.handle_like_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos 
    SET like_count = like_count + 1 
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos 
    SET like_count = like_count - 1 
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count updates
CREATE TRIGGER like_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_change();

-- Function to handle comment count updates
CREATE OR REPLACE FUNCTION public.handle_comment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count updates
CREATE TRIGGER comment_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_change();

-- Enable realtime for key tables
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Video {
  id: string;
  user_id: string;
  video_url?: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  category: 'resep' | 'hidden_gem' | 'tips';
  tags?: string[];
  budget?: string;
  cooking_time?: string;
  location?: string;
  like_count: number;
  comment_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
  user_saved?: boolean;
}

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();

    // Set up real-time subscriptions
    const videosSubscription = supabase
      .channel('videos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'videos' },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    const likesSubscription = supabase
      .channel('likes-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(videosSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [user]);

  const fetchVideos = async () => {
    try {
      let query = supabase
        .from('videos')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: "Error",
          description: "Failed to load videos",
          variant: "destructive"
        });
        return;
      }

      // Check user likes and saves if authenticated
      if (user && data) {
        const videoIds = data.map(v => v.id);
        
        const [likesResponse, savesResponse] = await Promise.all([
          supabase
            .from('likes')
            .select('video_id')
            .eq('user_id', user.id)
            .in('video_id', videoIds),
          supabase
            .from('saved_videos')
            .select('video_id')
            .eq('user_id', user.id)
            .in('video_id', videoIds)
        ]);

        const likedVideos = new Set(likesResponse.data?.map(l => l.video_id) || []);
        const savedVideos = new Set(savesResponse.data?.map(s => s.video_id) || []);

        const videosWithUserData = data.map(video => ({
          ...video,
          user_liked: likedVideos.has(video.id),
          user_saved: savedVideos.has(video.id)
        }));

        setVideos(videosWithUserData as Video[]);
      } else {
        setVideos((data as Video[]) || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (videoId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like videos",
        variant: "destructive"
      });
      return;
    }

    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      if (video.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            video_id: videoId,
            user_id: user.id,
            is_like: true
          });

        if (error) throw error;
      }

      // Update local state immediately for better UX
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { 
              ...v, 
              user_liked: !v.user_liked,
              like_count: v.user_liked ? v.like_count - 1 : v.like_count + 1
            }
          : v
      ));

    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const toggleSave = async (videoId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save videos",
        variant: "destructive"
      });
      return;
    }

    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      if (video.user_saved) {
        // Unsave
        const { error } = await supabase
          .from('saved_videos')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Save
        const { error } = await supabase
          .from('saved_videos')
          .insert({
            video_id: videoId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state immediately
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, user_saved: !v.user_saved }
          : v
      ));

      toast({
        title: video.user_saved ? "Removed from saved" : "Saved successfully",
        description: video.user_saved ? "Video removed from your saved list" : "Video added to your saved list",
      });

    } catch (error: any) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive"
      });
    }
  };

  return {
    videos,
    loading,
    toggleLike,
    toggleSave,
    refetch: fetchVideos
  };
};
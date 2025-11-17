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

export const useVideos = (feedType: 'inspirasi' | 'mengikuti' = 'inspirasi') => {
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
  }, [user, feedType]);

  const fetchVideos = async () => {
    try {
      // If feedType is 'mengikuti', first get the list of users current user follows
      let followingUserIds: string[] = [];
      if (feedType === 'mengikuti' && user) {
        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        followingUserIds = followsData?.map(f => f.following_id) || [];
        
        // If user doesn't follow anyone, return empty array
        if (followingUserIds.length === 0) {
          setVideos([]);
          setLoading(false);
          return;
        }
      }

      let query = supabase
        .from('videos')
        .select(`
          id,
          user_id,
          video_url,
          thumbnail_url,
          title,
          description,
          category,
          tags,
          budget,
          cooking_time,
          location,
          like_count,
          comment_count,
          is_public,
          created_at,
          updated_at
        `)
        .eq('is_public', true);

      // Apply filtering based on feed type
      if (feedType === 'mengikuti' && followingUserIds.length > 0) {
        query = query.in('user_id', followingUserIds);
      }

      // Apply sorting based on feed type
      if (feedType === 'inspirasi') {
        // For inspiration feed, show viral videos (sorted by like count)
        query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });
      } else {
        // For following feed, show latest videos first
        query = query.order('created_at', { ascending: false });
      }

      const { data: videosData, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: "Error",
          description: "Failed to load videos",
          variant: "destructive"
        });
        return;
      }

      // Fetch profiles separately to avoid relationship issues
      let videosWithProfiles: Video[] = [];
      if (videosData && videosData.length > 0) {
        const userIds = [...new Set(videosData.map(v => v.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, p]) || []
        );

        videosWithProfiles = videosData.map(video => ({
          ...video,
          profiles: profilesMap.get(video.user_id) || null
        })) as Video[];
      }

      const finalData = videosWithProfiles;

      // Check user likes and saves if authenticated
      if (user && finalData && finalData.length > 0) {
        const videoIds = finalData.map(v => v.id);
        
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

        const videosWithUserData = finalData.map(video => ({
          ...video,
          user_liked: likedVideos.has(video.id),
          user_saved: savedVideos.has(video.id)
        }));

        setVideos(videosWithUserData as Video[]);
      } else {
        setVideos(finalData || []);
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
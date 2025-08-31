import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Video } from '@/hooks/useVideos';

export const useSavedVideos = () => {
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSavedVideos();
      
      // Set up real-time subscription for saved videos
      const channel = supabase
        .channel('saved-videos-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'saved_videos', filter: `user_id=eq.${user.id}` },
          () => {
            fetchSavedVideos();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchSavedVideos = async () => {
    if (!user) return;

    try {
      // Get saved video IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_videos')
        .select('video_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setSavedVideos([]);
        setLoading(false);
        return;
      }

      const videoIds = savedData.map(s => s.video_id);

      // Get video details
      const { data: videosData, error: videosError } = await supabase
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
        .in('id', videoIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Fetch profiles for video owners
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
          profiles: profilesMap.get(video.user_id) || null,
          user_saved: true // All these videos are saved by definition
        })) as Video[];
      }

      // Check user likes for these videos
      if (videosWithProfiles.length > 0) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('video_id')
          .eq('user_id', user.id)
          .in('video_id', videoIds);

        const likedVideos = new Set(likesData?.map(l => l.video_id) || []);

        const finalVideos = videosWithProfiles.map(video => ({
          ...video,
          user_liked: likedVideos.has(video.id)
        }));

        setSavedVideos(finalVideos);
      } else {
        setSavedVideos([]);
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
      toast({
        title: "Error",
        description: "Failed to load saved videos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    savedVideos,
    loading,
    refetch: fetchSavedVideos
  };
};
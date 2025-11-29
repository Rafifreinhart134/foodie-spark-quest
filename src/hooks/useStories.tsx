import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url?: string;
  duration: number;
  created_at: string;
  expires_at: string;
  is_public: boolean;
  is_archived?: boolean;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
  view_count?: number;
  has_viewed?: boolean;
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // Fetch all active stories OR user's own stories (including expired)
      let query = supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If user is logged in, fetch their own stories + public active stories
      // Otherwise, just fetch public active stories
      if (user) {
        query = query.or(`expires_at.gt.${new Date().toISOString()},user_id.eq.${user.id}`);
      } else {
        query = query.gt('expires_at', new Date().toISOString());
      }
      
      const { data: storiesData, error: storiesError } = await query;

      if (storiesError) throw storiesError;

      if (!storiesData) {
        setStories([]);
        return;
      }

      // Fetch profiles separately
      const userIds = [...new Set(storiesData.map(s => s.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      // Fetch view counts and check if current user has viewed
      if (user) {
        const storyIds = storiesData.map(s => s.id);
        const { data: viewsData } = await supabase
          .from('story_views')
          .select('story_id, viewer_id')
          .in('story_id', storyIds);

        // Combine all data
        const storiesWithViews = storiesData.map(story => ({
          ...story,
          profiles: profilesData?.find(p => p.user_id === story.user_id),
          view_count: viewsData?.filter(v => v.story_id === story.id).length || 0,
          has_viewed: viewsData?.some(v => v.story_id === story.id && v.viewer_id === user.id) || false
        })) as Story[];

        setStories(storiesWithViews);
      } else {
        const storiesWithProfiles = storiesData.map(story => ({
          ...story,
          profiles: profilesData?.find(p => p.user_id === story.user_id)
        })) as Story[];
        
        setStories(storiesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (file: File, mediaType: 'image' | 'video', duration: number = 5) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a story',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story record
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: mediaType,
          thumbnail_url: mediaType === 'video' ? publicUrl : undefined,
          duration: duration
        })
        .select()
        .single();

      if (storyError) throw storyError;

      toast({
        title: 'Success',
        description: 'Story created successfully!'
      });

      fetchStories();
      return storyData;
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: 'Error',
        description: 'Failed to create story',
        variant: 'destructive'
      });
      return null;
    }
  };

  const markStoryAsViewed = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          viewer_id: user.id
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, has_viewed: true, view_count: (story.view_count || 0) + 1 }
          : story
      ));
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story deleted successfully'
      });

      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete story',
        variant: 'destructive'
      });
    }
  };

  const archiveStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_archived: true })
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story archived successfully'
      });

      fetchStories();
    } catch (error) {
      console.error('Error archiving story:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive story',
        variant: 'destructive'
      });
    }
  };

  const unarchiveStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_archived: false })
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Story unarchived successfully'
      });

      fetchStories();
    } catch (error) {
      console.error('Error unarchiving story:', error);
      toast({
        title: 'Error',
        description: 'Failed to unarchive story',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchStories();

    // Subscribe to new stories
    const channel = supabase
      .channel('stories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        () => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    stories,
    loading,
    createStory,
    markStoryAsViewed,
    deleteStory,
    archiveStory,
    unarchiveStory,
    refreshStories: fetchStories
  };
};
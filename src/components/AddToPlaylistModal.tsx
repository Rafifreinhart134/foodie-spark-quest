import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  onSuccess?: () => void;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  playlist_videos: any[];
  isVideoInPlaylist?: boolean;
}

const AddToPlaylistModal = ({ isOpen, onClose, videoId, onSuccess }: AddToPlaylistModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlaylistId, setProcessingPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchPlaylists();
    }
  }, [isOpen, user, videoId]);

  const fetchPlaylists = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_videos (
            video_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which playlists already contain this video
      const playlistsWithStatus = (data || []).map(playlist => ({
        ...playlist,
        isVideoInPlaylist: playlist.playlist_videos?.some(
          (pv: any) => pv.video_id === videoId
        ) || false
      }));

      setPlaylists(playlistsWithStatus);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlaylist = async (playlistId: string, isCurrentlyInPlaylist: boolean) => {
    if (!user) return;

    setProcessingPlaylistId(playlistId);
    try {
      if (isCurrentlyInPlaylist) {
        // Remove from playlist
        const { error } = await supabase
          .from('playlist_videos')
          .delete()
          .eq('playlist_id', playlistId)
          .eq('video_id', videoId);

        if (error) throw error;

        toast({
          title: "Removed from playlist",
          description: "Video removed from playlist successfully"
        });
      } else {
        // Get the current max position in the playlist
        const { data: existingVideos, error: fetchError } = await supabase
          .from('playlist_videos')
          .select('position')
          .eq('playlist_id', playlistId)
          .order('position', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        const nextPosition = existingVideos && existingVideos.length > 0 
          ? existingVideos[0].position + 1 
          : 0;

        // Add to playlist
        const { error } = await supabase
          .from('playlist_videos')
          .insert({
            playlist_id: playlistId,
            video_id: videoId,
            position: nextPosition
          });

        if (error) throw error;

        toast({
          title: "Added to playlist",
          description: "Video added to playlist successfully"
        });
      }

      // Update local state
      setPlaylists(prev => prev.map(p => 
        p.id === playlistId 
          ? { ...p, isVideoInPlaylist: !isCurrentlyInPlaylist }
          : p
      ));

      onSuccess?.();
    } catch (error: any) {
      console.error('Error toggling playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update playlist",
        variant: "destructive"
      });
    } finally {
      setProcessingPlaylistId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have any playlists yet</p>
            <Button onClick={onClose}>Create a Playlist First</Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleTogglePlaylist(playlist.id, playlist.isVideoInPlaylist || false)}
                  disabled={processingPlaylistId === playlist.id}
                  className="w-full p-3 border rounded-lg hover:bg-accent transition-colors flex items-center justify-between disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    {playlist.thumbnail_url ? (
                      <img
                        src={playlist.thumbnail_url}
                        alt={playlist.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.name}</p>
                      {playlist.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {playlist.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {playlist.playlist_videos?.length || 0} videos
                      </p>
                    </div>
                  </div>
                  
                  {processingPlaylistId === playlist.id ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : playlist.isVideoInPlaylist ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistModal;

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: () => void;
}

const PlaylistModal = ({ isOpen, onClose, onPlaylistCreated }: PlaylistModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a playlist name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Playlist created!",
        description: "Your new playlist has been created"
      });

      setName('');
      setDescription('');
      onPlaylistCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create playlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Playlist Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Playlist'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistModal;

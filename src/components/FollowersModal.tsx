import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  isFollowing?: boolean;
}

const FollowersModal = ({ isOpen, onClose, userId, type }: FollowersModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let query;
      
      if (type === 'followers') {
        // Get followers
        query = supabase
          .from('follows')
          .select(`
            follower_id,
            profiles!follows_follower_id_fkey (
              user_id,
              username,
              display_name,
              avatar_url,
              bio
            )
          `)
          .eq('following_id', userId);
      } else {
        // Get following
        query = supabase
          .from('follows')
          .select(`
            following_id,
            profiles!follows_following_id_fkey (
              user_id,
              username,
              display_name,
              avatar_url,
              bio
            )
          `)
          .eq('follower_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Extract profiles and check if current user follows them
      const profiles = data.map((item: any) => 
        type === 'followers' ? item.profiles : item.profiles
      ).filter(Boolean);

      // Check follow status for each user
      if (user) {
        const profilesWithFollowStatus = await Promise.all(
          profiles.map(async (profile: any) => {
            const { data: followData } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', profile.user_id)
              .single();

            return {
              ...profile,
              isFollowing: !!followData
            };
          })
        );
        setUsers(profilesWithFollowStatus);
      } else {
        setUsers(profiles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to follow users",
        variant: "destructive"
      });
      return;
    }

    try {
      const targetUser = users.find(u => u.user_id === targetUserId);
      
      if (targetUser?.isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.user_id === targetUserId 
          ? { ...u, isFollowing: !u.isFollowing }
          : u
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type === 'followers' ? 'followers' : 'following'} yet
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((profile) => (
                <div key={profile.user_id} className="flex items-center gap-3 py-2">
                  <img
                    src={profile.avatar_url || '/placeholder.svg'}
                    alt={profile.display_name}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                    onClick={() => {
                      navigate(`/user/${profile.username}`);
                      onClose();
                    }}
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                    navigate(`/user/${profile.username}`);
                    onClose();
                  }}>
                    <p className="font-semibold text-sm truncate">{profile.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                    {profile.bio && (
                      <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
                    )}
                  </div>
                  {user && user.id !== profile.user_id && (
                    <Button
                      size="sm"
                      variant={profile.isFollowing ? "outline" : "default"}
                      onClick={() => handleFollowToggle(profile.user_id)}
                    >
                      {profile.isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;

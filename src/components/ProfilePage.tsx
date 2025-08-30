import { useState, useEffect } from 'react';
import { Settings, LogOut, Award, Gift, Heart, Play, Users, Video, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProfileEditModal from './ProfileEditModal';

interface ProfilePageProps {
  onNavigateToSettings?: () => void;
}

const ProfilePage = ({ onNavigateToSettings }: ProfilePageProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('videos');
  const [profile, setProfile] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserVideos();
      fetchSavedVideos();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserVideos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserVideos(data || []);
    } catch (error) {
      console.error('Error fetching user videos:', error);
    }
  };

  const fetchSavedVideos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_videos')
        .select(`
          *,
          videos (
            *,
            profiles (display_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedVideos(data || []);
    } catch (error) {
      console.error('Error fetching saved videos:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Profile Header */}
      <div className="bg-white">
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-32 gradient-primary"></div>
          
          {/* Profile info */}
          <div className="px-4 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <img
                src={profile?.avatar_url || '/placeholder.svg'}
                alt={profile?.display_name || 'User'}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold">{profile?.display_name || 'Anonymous User'}</h1>
                    <p className="text-muted-foreground">@{profile?.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm mb-4">{profile?.bio || 'No bio available'}</p>

            {/* Stats */}
            <div className="flex justify-around py-4 border-t border-b">
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(profile?.follower_count || 0)}</p>
                <p className="text-muted-foreground text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile?.following_count || 0}</p>
                <p className="text-muted-foreground text-sm">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userVideos.length}</p>
                <p className="text-muted-foreground text-sm">Videos</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(userVideos.reduce((acc, video) => acc + (video.like_count || 0), 0))}</p>
                <p className="text-muted-foreground text-sm">Likes</p>
              </div>
            </div>

            {/* Coins & Level */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <span className="text-yellow-500 mr-1">🪙</span>
                  <span className="font-semibold text-yellow-700">0</span>
                </div>
                <Badge className="gradient-golden text-food-brown">
                  Beginner
                </Badge>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos" className="text-xs">
              <Video className="w-4 h-4 mr-1" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">
              <Heart className="w-4 h-4 mr-1" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">
              <Award className="w-4 h-4 mr-1" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="text-xs">
              <Gift className="w-4 h-4 mr-1" />
              Vouchers
            </TabsTrigger>
          </TabsList>

          {/* My Videos */}
          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {userVideos.map((video) => (
                <div key={video.id} className="aspect-video relative group">
                  <img
                    src={video.thumbnail_url || '/placeholder.svg'}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/40 transition-all">
                    <div className="absolute bottom-2 left-2 text-white text-xs">
                      <div className="flex items-center space-x-1 mb-1">
                        <Play className="w-3 h-3" />
                        <span>{formatNumber(0)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{formatNumber(video.like_count || 0)}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                      {video.cooking_time || '2:30'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Saved Videos */}
          <TabsContent value="saved" className="mt-4">
            <div className="space-y-3">
              {savedVideos.map((savedVideo) => (
                <Card key={savedVideo.id} className="p-3">
                  <div className="flex space-x-3">
                    <img
                      src={savedVideo.videos?.thumbnail_url || '/placeholder.svg'}
                      alt={savedVideo.videos?.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{savedVideo.videos?.title}</h4>
                      <p className="text-sm text-muted-foreground">@{savedVideo.videos?.profiles?.display_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(0)} views</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="text-4xl mb-2">👨‍🍳</div>
                <h4 className="font-semibold mb-1">New Chef</h4>
                <p className="text-xs text-muted-foreground">Welcome to FoodTok!</p>
              </Card>
            </div>
          </TabsContent>

          {/* Vouchers */}
          <TabsContent value="vouchers" className="mt-4">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="text-center text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-2" />
                  <p>No vouchers available yet</p>
                  <p className="text-sm">Upload more content to earn coins and unlock vouchers!</p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />
    </div>
  );
};

export default ProfilePage;
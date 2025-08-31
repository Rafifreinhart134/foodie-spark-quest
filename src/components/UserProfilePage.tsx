import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Play, Grid3X3, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useVideos } from '@/hooks/useVideos';
import ContentDetailModal from './ContentDetailModal';
import UserBadges from './UserBadges';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { toggleLike, toggleSave } = useVideos();
  
  const [profile, setProfile] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'badges'>('content');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserVideos();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserVideos = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserVideos(data || []);
    } catch (error) {
      console.error('Error fetching user videos:', error);
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

  const handleContentClick = (video: any, index: number) => {
    setSelectedContent(video);
    setCurrentContentIndex(index);
    setIsContentModalOpen(true);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(userVideos.length - 1, currentContentIndex + 1)
      : Math.max(0, currentContentIndex - 1);
    
    setCurrentContentIndex(newIndex);
    setSelectedContent(userVideos[newIndex]);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold">@{profile.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Profile Header */}
      <div className="bg-white">
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-32 gradient-primary"></div>
          
          {/* Profile info */}
          <div className="px-4 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img
                  src={profile.avatar_url || '/placeholder.svg'}
                  alt={profile.display_name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h1 className="text-xl font-bold">{profile.display_name || 'Anonymous User'}</h1>
                <p className="text-muted-foreground">@{profile.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</p>
              </div>
            </div>

            <p className="text-sm mb-4">{profile.bio || 'No bio available'}</p>

            {/* Stats */}
            <div className="flex justify-around py-4 border-t border-b">
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(profile.follower_count || 0)}</p>
                <p className="text-muted-foreground text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{profile.following_count || 0}</p>
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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'content' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('content')}
          >
            <Grid3X3 className="w-4 h-4 mx-auto mb-1" />
            Content
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'badges' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('badges')}
          >
            <Award className="w-4 h-4 mx-auto mb-1" />
            Badges
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' ? (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {userVideos.map((video, index) => {
            const isVideoContent = video.video_url && (
              video.video_url.includes('.mp4') || 
              video.video_url.includes('.mov') || 
              video.video_url.includes('.avi') ||
              video.video_url.includes('.webm') ||
              video.video_url.includes('video')
            );
            
            return (
              <div 
                key={video.id} 
                className="aspect-video relative group cursor-pointer"
                onClick={() => handleContentClick(video, index)}
              >
                {isVideoContent ? (
                  <>
                    <video 
                      className="w-full h-full object-cover rounded-lg"
                      src={video.video_url}
                      poster={video.thumbnail_url}
                      preload="metadata"
                      muted
                    />
                    <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                      <Play className="w-3 h-3 text-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/40 transition-all">
                  <div className="absolute bottom-2 left-2 text-white text-xs">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{formatNumber(video.like_count || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {userVideos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground col-span-3">
              <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No content yet</p>
              <p className="text-sm">This user hasn't uploaded any content</p>
            </div>
          )}
        </div>
        </div>
      ) : (
        <UserBadges userId={userId || ''} />
      )}

      {/* Enhanced Content Detail Modal with Navigation */}
      {selectedContent && (
        <ContentDetailModal
          isOpen={isContentModalOpen}
          onClose={() => {
            setIsContentModalOpen(false);
            setSelectedContent(null);
          }}
          content={selectedContent}
          onLike={() => toggleLike(selectedContent.id)}
          onSave={() => toggleSave(selectedContent.id)}
          canNavigate={userVideos.length > 1}
          onNavigate={handleNavigation}
          currentIndex={currentContentIndex}
          totalCount={userVideos.length}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal, Play, Grid3X3, Award, UserPlus, UserMinus, Repeat2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useVideos } from '@/hooks/useVideos';
import { useFollow } from '@/hooks/useFollow';
import ContentDetailModal from './ContentDetailModal';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import UserBadges from './UserBadges';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { toggleLike, toggleSave } = useVideos();
  const { isFollowing, isLoading: followLoading, toggleFollow, canFollow } = useFollow(userId);
  
  const [profile, setProfile] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [userReposts, setUserReposts] = useState<any[]>([]);
  const [userTags, setUserTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'badges' | 'repost' | 'tag'>('content');
  
  // Modal states for comments and share
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserVideos();
      fetchUserReposts();
      fetchUserTags();
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

  const fetchUserReposts = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('reposts')
        .select(`
          id,
          created_at,
          original_video_id,
          videos:original_video_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReposts(data || []);
    } catch (error) {
      console.error('Error fetching user reposts:', error);
    }
  };

  const fetchUserTags = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('video_tags')
        .select(`
          id,
          created_at,
          video_id,
          videos:video_id (*)
        `)
        .eq('tagged_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserTags(data || []);
    } catch (error) {
      console.error('Error fetching user tags:', error);
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

  const handleLike = async (videoId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like content",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            video_id: videoId,
            user_id: user.id,
            is_like: true
          });
      }

      // Update local state
      setUserVideos(prev => prev.map(item => 
        item.id === videoId 
          ? { 
              ...item, 
              like_count: existingLike ? (item.like_count || 1) - 1 : (item.like_count || 0) + 1,
              user_liked: !existingLike 
            }
          : item
      ));

      if (selectedContent?.id === videoId) {
        setSelectedContent(prev => ({
          ...prev,
          like_count: existingLike ? (prev.like_count || 1) - 1 : (prev.like_count || 0) + 1,
          user_liked: !existingLike
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to like content",
        variant: "destructive"
      });
    }
  };

  const handleSave = async (videoId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save content",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: existingSave } = await supabase
        .from('saved_videos')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();

      if (existingSave) {
        await supabase
          .from('saved_videos')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);
        
        toast({
          title: "Removed from saved",
          description: "Content removed from your saved list"
        });
      } else {
        await supabase
          .from('saved_videos')
          .insert({
            video_id: videoId,
            user_id: user.id
          });
        
        toast({
          title: "Saved!",
          description: "Content added to your saved list"
        });
      }

      if (selectedContent?.id === videoId) {
        setSelectedContent(prev => ({
          ...prev,
          user_saved: !existingSave
        }));
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive"
      });
    }
  };

  const handleComment = (videoId: string, videoTitle: string) => {
    setSelectedVideoId(videoId);
    setSelectedVideoTitle(videoTitle);
    setShowCommentsModal(true);
  };

  const handleShare = (videoId: string, videoTitle: string) => {
    setSelectedVideoId(videoId);
    setSelectedVideoTitle(videoTitle);
    setShowShareModal(true);
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header - no top padding */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold text-sm">@{profile.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Profile Header - minimal spacing */}
      <div className="bg-white">
        <div className="relative">
          {/* Cover gradient - minimal height */}
          <div className="h-16 gradient-primary"></div>
          
          {/* Profile info - minimal padding */}
          <div className="px-4 pb-2">
            {/* Profile picture and info row - tight spacing */}
            <div className="flex items-start gap-2.5 -mt-8 mb-2">
              {/* Left side: Profile picture only */}
              <div className="w-16 h-16 rounded-lg border-3 border-white shadow-lg overflow-hidden flex-shrink-0">
                <img
                  src={profile.avatar_url || '/placeholder.svg'}
                  alt={profile.display_name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right side: Name and stats */}
              <div className="flex-1 flex flex-col gap-1 mt-1">
                {/* Name only */}
                <h1 className="text-sm font-bold leading-none">{profile.display_name || 'Anonymous User'}</h1>
                
                {/* Stats in a row */}
                <div className="flex justify-around items-center gap-0.5 mt-0.5">
                  <div className="text-center">
                    <p className="font-bold text-xs leading-none">{formatNumber(profile.follower_count || 0)}</p>
                    <p className="text-muted-foreground text-[9px] leading-none mt-0.5">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs leading-none">{profile.following_count || 0}</p>
                    <p className="text-muted-foreground text-[9px] leading-none mt-0.5">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs leading-none">{userVideos.length}</p>
                    <p className="text-muted-foreground text-[9px] leading-none mt-0.5">Videos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs leading-none">{formatNumber(userVideos.reduce((acc, video) => acc + (video.like_count || 0), 0))}</p>
                    <p className="text-muted-foreground text-[9px] leading-none mt-0.5">Likes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio - minimal spacing */}
            <p className="text-xs mb-2 leading-tight">{profile.bio || 'No bio available'}</p>

            {/* Follow Button or Edit Profile - minimal spacing */}
            {user?.id === userId ? (
              <Button
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            ) : canFollow ? (
              <Button
                onClick={toggleFollow}
                disabled={followLoading}
                variant={isFollowing ? "outline" : "default"}
                className="w-full h-8 text-xs"
              >
                {followLoading ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                ) : isFollowing ? (
                  <UserMinus className="w-3 h-3 mr-1" />
                ) : (
                  <UserPlus className="w-3 h-3 mr-1" />
                )}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button 
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'content' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('content')}
          >
            <Grid3X3 className="w-4 h-4 mx-auto" />
          </button>

          {user?.id === userId ? (
            // Tampilkan badges untuk profil sendiri
            <button 
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'badges' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('badges')}
            >
              <Award className="w-4 h-4 mx-auto" />
            </button>
          ) : (
            // Tampilkan repost dan tag untuk profil orang lain
            <>
              <button 
                className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                  activeTab === 'repost' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('repost')}
              >
                <Repeat2 className="w-4 h-4 mx-auto" />
              </button>
              <button 
                className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                  activeTab === 'tag' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('tag')}
              >
                <Tag className="w-4 h-4 mx-auto" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content - minimal padding */}
      {activeTab === 'content' ? (
        <div className="p-1">
          <div className="grid grid-cols-3 gap-0.5">
            {userVideos.map((video, index) => (
              <div
                key={video.id}
                className="cursor-pointer group"
                onClick={() => handleContentClick(video, index)}
              >
                <div className="relative aspect-[3/5] bg-muted overflow-hidden">
                  <img
                    src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100" />
                  
                  {/* Video info overlay - always visible at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                      <span className="flex items-center gap-0.5">
                        <Play className="w-3 h-3" fill="white" />
                        {formatNumber(video.view_count || 0)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3" fill="white" />
                        {formatNumber(video.like_count || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {userVideos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground col-span-3">
                <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No content yet</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'badges' && user?.id === userId ? (
        <div className="p-2">
          <UserBadges userId={userId || ''} />
        </div>
      ) : activeTab === 'repost' ? (
        <div className="p-1">
          <div className="grid grid-cols-3 gap-0.5">
            {userReposts.map((repost: any, index: number) => {
              const video = repost.videos;
              if (!video) return null;
              
              return (
                <div
                  key={repost.id}
                  className="cursor-pointer group"
                  onClick={() => handleContentClick(video, index)}
                >
                  <div className="relative aspect-[3/5] bg-muted overflow-hidden">
                    <img
                      src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100" />
                    <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Repeat2 className="w-2.5 h-2.5" />
                      Repost
                    </div>
                    
                    {/* Video info overlay - always visible at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5">
                      <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                        <span className="flex items-center gap-0.5">
                          <Play className="w-3 h-3" fill="white" />
                          {formatNumber(video.view_count || 0)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3" fill="white" />
                          {formatNumber(video.like_count || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {userReposts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground col-span-3">
                <Repeat2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No reposts yet</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'tag' ? (
        <div className="p-1">
          <div className="grid grid-cols-3 gap-0.5">
            {userTags.map((tag: any, index: number) => {
              const video = tag.videos;
              if (!video) return null;
              
              return (
                <div
                  key={tag.id}
                  className="cursor-pointer group"
                  onClick={() => handleContentClick(video, index)}
                >
                  <div className="relative aspect-[3/5] bg-muted overflow-hidden">
                    <img
                      src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100" />
                    <div className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" />
                      Tag
                    </div>
                    
                    {/* Video info overlay - always visible at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5">
                      <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                        <span className="flex items-center gap-0.5">
                          <Play className="w-3 h-3" fill="white" />
                          {formatNumber(video.view_count || 0)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3" fill="white" />
                          {formatNumber(video.like_count || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {userTags.length === 0 && (
              <div className="text-center py-12 text-muted-foreground col-span-3">
                <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tagged content yet</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Enhanced Content Detail Modal with Navigation */}
      {selectedContent && (
        <ContentDetailModal
          isOpen={isContentModalOpen}
          onClose={() => {
            setIsContentModalOpen(false);
            setSelectedContent(null);
          }}
          content={selectedContent}
          onLike={() => handleLike(selectedContent.id)}
          onComment={() => handleComment(selectedContent.id, selectedContent.title)}
          onShare={() => handleShare(selectedContent.id, selectedContent.title)}
          onSave={() => handleSave(selectedContent.id)}
          canNavigate={userVideos.length > 1}
          onNavigate={handleNavigation}
          currentIndex={currentContentIndex}
          totalCount={userVideos.length}
        />
      )}

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        videoId={selectedVideoId}
        videoTitle={selectedVideoTitle}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoId={selectedVideoId}
        videoTitle={selectedVideoTitle}
      />
    </div>
  );
};

export default UserProfilePage;
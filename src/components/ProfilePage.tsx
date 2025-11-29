import { useState, useEffect } from 'react';
import { Settings, LogOut, Heart, Play, Grid3X3, Edit, Repeat2, Tag, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProfileEditModal from './ProfileEditModal';
import ContentDetailModal from './ContentDetailModal';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { useNavigate } from 'react-router-dom';
import { useStories } from '@/hooks/useStories';
import StoryBar from './StoryBar';
import { StoryCreationFlow } from './story/StoryCreationFlow';
import { StoryViewerModal } from './StoryViewerModal';

interface ProfilePageProps {
  onNavigateToSettings?: () => void;
}

const ProfilePage = ({ onNavigateToSettings }: ProfilePageProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stories, loading: storiesLoading, markStoryAsViewed, deleteStory, archiveStory, unarchiveStory } = useStories();
  
  const [activeTab, setActiveTab] = useState<'content' | 'repost' | 'tag'>('content');
  const [profile, setProfile] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [userReposts, setUserReposts] = useState<any[]>([]);
  const [userTags, setUserTags] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  
  // Story modal states
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [isViewStoryModalOpen, setIsViewStoryModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  
  // Modal states
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');

  // Get current content array based on active tab
  const getCurrentContentArray = () => {
    if (activeTab === 'repost') {
      return userReposts.map((r: any) => r.videos).filter(Boolean);
    } else if (activeTab === 'tag') {
      return userTags.map((t: any) => t.videos).filter(Boolean);
    }
    return userVideos;
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserVideos();
      fetchUserReposts();
      fetchUserTags();
      fetchPlaylists();
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

  const fetchUserReposts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reposts')
        .select(`
          id,
          created_at,
          original_video_id,
          videos:original_video_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReposts(data || []);
    } catch (error) {
      console.error('Error fetching user reposts:', error);
    }
  };

  const fetchUserTags = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_tags')
        .select(`
          id,
          created_at,
          video_id,
          videos:video_id (*)
        `)
        .eq('tagged_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserTags(data || []);
    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  };

  const fetchPlaylists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_videos (
            video_id,
            videos (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
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

      // Update local state for userVideos
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

  const handleNavigate = (direction: 'prev' | 'next') => {
    const contentArray = getCurrentContentArray();
    let newIndex = currentContentIndex;
    
    if (direction === 'prev' && currentContentIndex > 0) {
      newIndex = currentContentIndex - 1;
    } else if (direction === 'next' && currentContentIndex < contentArray.length - 1) {
      newIndex = currentContentIndex + 1;
    }
    
    if (newIndex !== currentContentIndex) {
      setCurrentContentIndex(newIndex);
      setSelectedContent(contentArray[newIndex]);
    }
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
      <div className="bg-card border-b">
        {/* Username dan Settings button */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="text-lg font-bold">@{profile?.display_name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</h1>
          <Button variant="ghost" size="icon" onClick={onNavigateToSettings}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile info */}
        <div className="px-4 py-6">
          {/* Profile Avatar with Story Indicator */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              {stories.filter(s => s.user_id === user?.id).length > 0 ? (
                <div className={`${
                  stories.filter(s => s.user_id === user?.id && !s.has_viewed).length > 0
                    ? 'p-[3px] rounded-lg bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30'
                    : 'p-[3px] rounded-lg bg-gradient-to-tr from-gray-400 via-gray-300 to-gray-400'
                }`}>
                  <div className="p-[3px] bg-white rounded-lg">
                    <img
                      src={profile?.avatar_url || '/placeholder.svg'}
                      alt={profile?.display_name || 'User'}
                      className="w-20 h-20 rounded-lg cursor-pointer"
                      onClick={() => {
                        const userStories = stories.filter(s => s.user_id === user?.id);
                        if (userStories.length > 0) {
                          setSelectedStoryIndex(0);
                          setIsViewStoryModalOpen(true);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={profile?.avatar_url || '/placeholder.svg'}
                  alt={profile?.display_name || 'User'}
                  className="w-20 h-20 rounded-lg border-2 border-border cursor-pointer"
                  onClick={() => {
                    const userStories = stories.filter(s => s.user_id === user?.id);
                    if (userStories.length > 0) {
                      setSelectedStoryIndex(0);
                      setIsViewStoryModalOpen(true);
                    } else {
                      setIsCreateStoryModalOpen(true);
                    }
                  }}
                />
              )}
            </div>
            
            {/* Stats - sejajar horizontal dengan foto */}
            <div className="flex-1 flex items-center justify-around">
              <div className="text-center">
                <p className="font-bold text-base">{formatNumber(profile?.follower_count || 0)}</p>
                <p className="text-muted-foreground text-xs">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base">{profile?.following_count || 0}</p>
                <p className="text-muted-foreground text-xs">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base">{userVideos.length}</p>
                <p className="text-muted-foreground text-xs">Videos</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-base">{formatNumber(userVideos.reduce((acc, video) => acc + (video.like_count || 0), 0))}</p>
                <p className="text-muted-foreground text-xs">Likes</p>
              </div>
            </div>
          </div>
          
          {/* Display name */}
          <h2 className="text-lg font-bold mb-4">{profile?.display_name || 'Anonymous User'}</h2>

          {/* Edit Profile button */}
          <Button 
            variant="outline" 
            className="w-full mb-4" 
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm mb-4 text-muted-foreground">{profile.bio}</p>
          )}

          {/* Coins & Level & Logout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                <span className="text-yellow-500 mr-1">🪙</span>
                <span className="font-semibold text-yellow-700">0</span>
              </div>
              <Badge className="gradient-golden text-food-brown">
                Beginner
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
              activeTab === 'content' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('content')}
          >
            <Grid3X3 className="w-5 h-5 mx-auto mb-0.5" />
            <span className="text-[10px]">Post</span>
          </button>

          <button 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
              activeTab === 'repost' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('repost')}
          >
            <Repeat2 className="w-5 h-5 mx-auto mb-0.5" />
            <span className="text-[10px]">Repost</span>
          </button>
          
          <button 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all ${
              activeTab === 'tag' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('tag')}
          >
            <Tag className="w-5 h-5 mx-auto mb-0.5" />
            <span className="text-[10px]">Tag</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' ? (
        <div className="p-1">
          <div className="grid grid-cols-3 gap-0.5">
            {userVideos.map((video) => {
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
                     className="cursor-pointer group"
                     onClick={() => {
                       const contentArray = getCurrentContentArray();
                       const contentIndex = contentArray.findIndex(item => item.id === video.id);
                       setCurrentContentIndex(contentIndex);
                       setSelectedContent(video);
                       setIsContentModalOpen(true);
                     }}
                  >
                    <div className="relative aspect-[3/5] bg-muted overflow-hidden">
                      {isVideoContent ? (
                        <>
                          <video 
                            className="w-full h-full object-cover"
                            src={video.video_url}
                            poster={video.thumbnail_url}
                            preload="metadata"
                            muted
                          />
                        </>
                      ) : (
                        <img
                          src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Glitch wave divider */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
                        <svg className="absolute bottom-0 w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0L50 10L100 5L150 15L200 8L250 12L300 6L350 14L400 9L450 11L500 7L550 13L600 10L650 8L700 12L750 9L800 11L850 7L900 13L950 10L1000 8L1050 12L1100 9L1150 11L1200 8V120H0V0Z" 
                                fill="url(#glitchGradient)" 
                                className="opacity-90"/>
                          <defs>
                            <linearGradient id="glitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: 'rgba(0,0,0,0.3)', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.85)', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      
                      {/* Video info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 z-10">
                        <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                          <span className="flex items-center gap-0.5">
                            <Play className="w-3 h-3" fill="white" />
                            {formatNumber((video as any).view_count || 0)}
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
            {userVideos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground col-span-3">
                <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No content yet</p>
              </div>
            )}
          </div>
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
                  onClick={() => {
                    setCurrentContentIndex(index);
                    setSelectedContent(video);
                    setIsContentModalOpen(true);
                  }}
                >
                  <div className="relative aspect-[3/5] bg-muted overflow-hidden">
                    <img
                      src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Glitch wave divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
                      <svg className="absolute bottom-0 w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0L50 10L100 5L150 15L200 8L250 12L300 6L350 14L400 9L450 11L500 7L550 13L600 10L650 8L700 12L750 9L800 11L850 7L900 13L950 10L1000 8L1050 12L1100 9L1150 11L1200 8V120H0V0Z" 
                              fill="url(#glitchGradient)" 
                              className="opacity-90"/>
                        <defs>
                          <linearGradient id="glitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'rgba(0,0,0,0.3)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.85)', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 z-10">
                      <Repeat2 className="w-2.5 h-2.5" />
                      Repost
                    </div>
                    
                    {/* Video info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 z-10">
                      <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                        <span className="flex items-center gap-0.5">
                          <Play className="w-3 h-3" fill="white" />
                          {formatNumber((video as any).view_count || 0)}
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
                  onClick={() => {
                    setCurrentContentIndex(index);
                    setSelectedContent(video);
                    setIsContentModalOpen(true);
                  }}
                >
                  <div className="relative aspect-[3/5] bg-muted overflow-hidden">
                    <img
                      src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Glitch wave divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
                      <svg className="absolute bottom-0 w-full h-8" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 0L50 10L100 5L150 15L200 8L250 12L300 6L350 14L400 9L450 11L500 7L550 13L600 10L650 8L700 12L750 9L800 11L850 7L900 13L950 10L1000 8L1050 12L1100 9L1150 11L1200 8V120H0V0Z" 
                              fill="url(#glitchGradient)" 
                              className="opacity-90"/>
                        <defs>
                          <linearGradient id="glitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'rgba(0,0,0,0.3)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.85)', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    <div className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 z-10">
                      <Tag className="w-2.5 h-2.5" />
                      Tag
                    </div>
                    
                    {/* Video info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 z-10">
                      <div className="flex items-center gap-1.5 text-white text-[10px] font-medium">
                        <span className="flex items-center gap-0.5">
                          <Play className="w-3 h-3" fill="white" />
                          {formatNumber((video as any).view_count || 0)}
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

      {/* Playlists Section */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <List className="w-5 h-5" />
            Playlists
          </h2>
        </div>

        {playlists.length > 0 ? (
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/30">
                  <h3 className="font-semibold">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {playlist.playlist_videos?.length || 0} videos
                  </p>
                </div>
                
                {playlist.playlist_videos && playlist.playlist_videos.length > 0 && (
                  <div className="flex overflow-x-auto gap-2 p-2 bg-background">
                    {playlist.playlist_videos.slice(0, 5).map((pv: any) => {
                      const video = pv.videos;
                      if (!video) return null;
                      
                      return (
                        <div
                          key={pv.video_id}
                          className="flex-shrink-0 w-24 cursor-pointer"
                          onClick={() => {
                            setSelectedContent(video);
                            setIsContentModalOpen(true);
                          }}
                        >
                          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                            <img
                              src={video.thumbnail_url || video.video_url || '/placeholder.svg'}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                              <span className="text-white text-[10px] flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5" fill="white" />
                                {formatNumber(video.like_count || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <List className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No playlists yet</p>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      {/* Content Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          isOpen={isContentModalOpen}
          onClose={() => {
            setIsContentModalOpen(false);
            setSelectedContent(null);
          }}
          content={{
            id: selectedContent.id,
            title: selectedContent.title,
            description: selectedContent.description,
            video_url: selectedContent.video_url,
            thumbnail_url: selectedContent.thumbnail_url,
            like_count: selectedContent.like_count || 0,
            comment_count: selectedContent.comment_count || 0,
            user_liked: selectedContent.user_liked || false,
            user_saved: selectedContent.user_saved || false
          }}
          onLike={() => handleLike(selectedContent.id)}
          onComment={() => handleComment(selectedContent.id, selectedContent.title)}
          onShare={() => handleShare(selectedContent.id, selectedContent.title)}
          onSave={() => handleSave(selectedContent.id)}
          canNavigate={getCurrentContentArray().length > 1}
          onNavigate={handleNavigate}
          currentIndex={currentContentIndex}
          totalCount={getCurrentContentArray().length}
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

      {/* Story Creation Modal */}
      <StoryCreationFlow 
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
      />

      {/* Story Viewer Modal */}
      {stories.filter(s => s.user_id === user?.id).length > 0 && (
        <StoryViewerModal
          isOpen={isViewStoryModalOpen}
          onClose={() => setIsViewStoryModalOpen(false)}
          stories={stories.filter(s => s.user_id === user?.id)}
          initialStoryIndex={selectedStoryIndex}
          onMarkAsViewed={markStoryAsViewed}
          onDeleteStory={deleteStory}
          onArchiveStory={archiveStory}
          onUnarchiveStory={unarchiveStory}
        />
      )}
    </div>
  );
};

export default ProfilePage;
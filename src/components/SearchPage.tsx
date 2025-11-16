import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Heart, Play, ArrowLeft, UserPlus, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SearchWizard from './SearchWizard';
import ContentDetailModal from './ContentDetailModal';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';

interface SearchFilters {
  serving?: string;
  budget?: string;
  preference?: string;
}

const SearchPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendedAccounts, setRecommendedAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({});
  const [activeTab, setActiveTab] = useState('top');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  
  // Modal states
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');

  useEffect(() => {
    // Load all content by default
    fetchAllVideos();
  }, []);

  const fetchAllVideos = async () => {
    setIsLoading(true);
    try {
      // Fetch videos first
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
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (videosError) throw videosError;

      // Fetch profiles separately if videos exist
      let videosWithProfiles = videosData || [];
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
        }));
      }

      setSearchResults(videosWithProfiles);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error loading content",
        description: "Failed to load videos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchVideos = async (query: string, filters: SearchFilters = {}) => {
    setIsLoading(true);
    setAppliedFilters(filters);
    
    try {
      let queryBuilder = supabase
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

      // Enhanced text search with user search capability
      if (query.trim()) {
        // First, check if searching for a user
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('user_id')
          .ilike('display_name', `%${query.trim()}%`);
        
        const userIds = userProfiles?.map(p => p.user_id) || [];
        
        if (userIds.length > 0) {
          // Search by user ID if username matches
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%, user_id.in.(${userIds.join(',')})`);
        } else {
          // Regular content search with partial matching
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%`);
        }
      }

      // Add budget filter - Fixed filter matching
      if (filters.budget) {
        const budgetText = getBudgetText(filters.budget);
        queryBuilder = queryBuilder.eq('budget', budgetText);
      }

      // Add cooking time filter - Fixed filter matching
      if (filters.preference === 'cepat') {
        queryBuilder = queryBuilder.eq('cooking_time', 'Under 15 menit');
      }

      // Add serving filter if needed
      if (filters.serving) {
        // You can add serving filter logic here if you have a serving field
      }

      const { data: videosData, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profiles separately if videos exist
      let videosWithProfiles = videosData || [];
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
        }));
      }

      setSearchResults(videosWithProfiles);
      
      if (videosWithProfiles && videosWithProfiles.length === 0) {
        toast({
          title: "Tidak ada hasil",
          description: "Coba sesuaikan kriteria pencarian Anda",
        });
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: "Pencarian gagal",
        description: "Gagal mencari video",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetText = (budgetId: string) => {
    switch (budgetId) {
      case 'hemat': return 'Under Rp 10k';
      case 'sedang': return 'Rp 10k - 25k';
      case 'menengah': return 'Rp 25k - 50k';
      case 'bebas': return 'Above Rp 50k';
      default: return '';
    }
  };

  const handleWizardSearch = (filters: SearchFilters) => {
    setShowWizard(false);
    searchVideos(searchQuery, filters);
  };

  const handleTextSearch = () => {
    searchVideos(searchQuery, appliedFilters);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleContentClick = (content: any) => {
    setSelectedContent(content);
    setShowContentModal(true);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
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
      setSearchResults(prev => prev.map(item => 
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

      // Update local state
      setSearchResults(prev => prev.map(item => 
        item.id === videoId 
          ? { ...item, user_saved: !existingSave }
          : item
      ));

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

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          Cari Resep & Tempat
        </h1>
        <p className="text-muted-foreground">Temukan inspirasi masakan terbaik!</p>
      </div>

      <div className="p-4">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={appliedFilters.budget === 'hemat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => searchVideos(searchQuery, { ...appliedFilters, budget: 'hemat' })}
            className="text-xs"
          >
            💰 Hemat
          </Button>
          <Button
            variant={appliedFilters.budget === 'sedang' ? 'default' : 'outline'}
            size="sm"
            onClick={() => searchVideos(searchQuery, { ...appliedFilters, budget: 'sedang' })}
            className="text-xs"
          >
            💰 Sedang
          </Button>
          <Button
            variant={appliedFilters.budget === 'menengah' ? 'default' : 'outline'}
            size="sm"
            onClick={() => searchVideos(searchQuery, { ...appliedFilters, budget: 'menengah' })}
            className="text-xs"
          >
            💰 Menengah
          </Button>
          <Button
            variant={appliedFilters.preference === 'cepat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => searchVideos(searchQuery, { ...appliedFilters, preference: 'cepat' })}
            className="text-xs"
          >
            ⚡ Cepat
          </Button>
          <Button
            variant={appliedFilters.serving === '1-2' ? 'default' : 'outline'}
            size="sm"
            onClick={() => searchVideos(searchQuery, { ...appliedFilters, serving: '1-2' })}
            className="text-xs"
          >
            👤 1-2 orang
          </Button>
        </div>

        <div className="space-y-4">
          {showWizard ? (
            <SearchWizard onSearch={handleWizardSearch} />
          ) : (
            <>
              {/* Search Bar */}
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Cari resep, makanan, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTextSearch}
                  className="gradient-primary text-white"
                  disabled={isLoading}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowWizard(true)}
                className="w-full mb-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>

              {/* Applied Filters */}
              {(appliedFilters.serving || appliedFilters.budget || appliedFilters.preference) && (
                <Card className="p-4 mb-4">
                  <p className="text-sm font-medium mb-2">Filter aktif:</p>
                  <div className="flex flex-wrap gap-2">
                    {appliedFilters.serving && (
                      <Badge variant="secondary">👤 {appliedFilters.serving} orang</Badge>
                    )}
                    {appliedFilters.budget && (
                      <Badge variant="secondary">💰 Budget {appliedFilters.budget}</Badge>
                    )}
                    {appliedFilters.preference && (
                      <Badge variant="secondary">🍳 {appliedFilters.preference}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAppliedFilters({});
                        fetchAllVideos();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </Card>
              )}

              {/* Results */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Mencari...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {searchResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleContentClick(result)}
                    >
                      <div className="aspect-square relative">
                        {result.video_url ? (
                          // For videos, show thumbnail with play button
                          <>
                            {result.thumbnail_url ? (
                              <img
                                src={result.thumbnail_url}
                                alt={result.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to video frame if thumbnail fails
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const video = document.createElement('video');
                                  video.src = result.video_url;
                                  video.className = 'w-full h-full object-cover';
                                  video.muted = true;
                                  video.currentTime = 1; // Get frame from 1 second
                                  target.parentNode?.appendChild(video);
                                }}
                              />
                            ) : (
                              <video
                                src={result.video_url}
                                className="w-full h-full object-cover"
                                muted
                                onLoadedData={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.currentTime = 1; // Show frame from 1 second
                                }}
                              />
                            )}
                            {/* Play button indicator for videos */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-2">
                                <Play className="w-6 h-6 text-white" fill="white" />
                              </div>
                            </div>
                          </>
                        ) : (
                          // For photos, show image directly
                          <img
                            src={result.thumbnail_url || '/placeholder.svg'}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="absolute bottom-2 left-2 text-white">
                            <div className="flex items-center space-x-2 text-xs">
                              <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{formatNumber(result.like_count || 0)}</span>
                              </div>
                            </div>
                          </div>
                          {result.cooking_time && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {result.cooking_time}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{result.title}</h3>
                        <p 
                          className="text-xs text-muted-foreground mb-2 cursor-pointer hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(result.user_id);
                          }}
                        >
                          @{result.profiles?.display_name || 'Unknown'}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 text-xs">
                          {result.budget && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              💰 {result.budget.replace('Rp ', '')}
                            </Badge>
                          )}
                          {result.cooking_time && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              ⏱️ {result.cooking_time.replace(' menit', 'm')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          isOpen={showContentModal}
          onClose={() => setShowContentModal(false)}
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

export default SearchPage;
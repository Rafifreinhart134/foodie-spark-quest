import { useState, useEffect } from 'react';
import { Search, ArrowLeft, UserPlus, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContentDetailModal from './ContentDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';

interface RecommendedUser {
  user_id: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  videos: any[];
}

const SearchPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [sortOption, setSortOption] = useState<'newest' | 'most_liked' | 'most_commented'>('newest');

  // Trending searches
  const trendingSearches = [
    "Resep Nasi Goreng Sederhana",
    "Cara Masak Ayam Geprek",
    "Makanan Khas Bandung",
    "Tips Memasak Sehat",
    "Kuliner Hidden Gem Jakarta"
  ];

  useEffect(() => {
    fetchRecommendedUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchVideos(searchQuery);
    }
  }, [sortOption]);

  const fetchRecommendedUsers = async () => {
    try {
      // Fetch users with their profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, follower_count')
        .order('follower_count', { ascending: false })
        .limit(10);

      if (profilesError) throw profilesError;

      // Fetch videos for each user
      const usersWithVideos = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: videosData } = await supabase
            .from('videos')
            .select('id, thumbnail_url, title, like_count')
            .eq('user_id', profile.user_id)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(6);

          return {
            ...profile,
            videos: videosData || []
          };
        })
      );

      setRecommendedUsers(usersWithVideos.filter(u => u.videos.length > 0));
    } catch (error) {
      console.error('Error fetching recommended users:', error);
    }
  };

  const searchVideos = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setRecommendedUsers([]);
      return;
    }

    setIsLoading(true);
    setShowTrending(false);
    
    try {
      // Split query into keywords for fuzzy search
      const keywords = query.toLowerCase().trim().split(/\s+/);
      
      // Build fuzzy search patterns
      const fuzzyPatterns = keywords.flatMap(keyword => {
        // Create patterns for typo tolerance
        const chars = keyword.split('');
        return [
          `%${keyword}%`, // Exact partial match
          ...chars.map((_, i) => {
            // Skip one character for typo tolerance
            const pattern = chars.filter((_, idx) => idx !== i).join('');
            return `%${pattern}%`;
          }).slice(0, 2) // Limit fuzzy patterns
        ];
      });

      // Search for users with fuzzy matching
      let allProfilesData: any[] = [];
      
      // First try exact match
      const { data: exactProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, follower_count')
        .ilike('display_name', `%${query}%`)
        .order('follower_count', { ascending: false })
        .limit(5);
      
      allProfilesData = exactProfiles || [];
      
      // If no exact matches, try fuzzy search
      if (allProfilesData.length === 0) {
        for (const pattern of fuzzyPatterns.slice(0, 3)) {
          const { data: fuzzyProfiles } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url, follower_count')
            .ilike('display_name', pattern)
            .order('follower_count', { ascending: false })
            .limit(5);
          
          if (fuzzyProfiles && fuzzyProfiles.length > 0) {
            allProfilesData = fuzzyProfiles;
            break;
          }
        }
      }

      // Fetch videos for each user found
      const usersWithVideos = await Promise.all(
        allProfilesData.map(async (profile) => {
          const { data: videosData } = await supabase
            .from('videos')
            .select('id, thumbnail_url, title, like_count, video_url, description, category')
            .eq('user_id', profile.user_id)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(6);

          return {
            ...profile,
            videos: videosData || []
          };
        })
      );

      setRecommendedUsers(usersWithVideos.filter(u => u.videos.length > 0));

      // Search for videos with fuzzy matching
      let allVideosData: any[] = [];
      
      // Build OR conditions for multiple keywords
      const orConditions = keywords.map(keyword => 
        `title.ilike.%${keyword}%,description.ilike.%${keyword}%,tags.cs.{${keyword}}`
      ).join(',');
      
      // Determine sort column and order based on sortOption
      const getSortConfig = () => {
        switch (sortOption) {
          case 'most_liked':
            return { column: 'like_count', ascending: false };
          case 'most_commented':
            return { column: 'comment_count', ascending: false };
          case 'newest':
          default:
            return { column: 'created_at', ascending: false };
        }
      };
      
      const sortConfig = getSortConfig();
      
      // First try multi-keyword search
      const { data: exactVideos } = await supabase
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
          like_count,
          comment_count,
          is_public,
          created_at
        `)
        .eq('is_public', true)
        .or(orConditions)
        .order(sortConfig.column, { ascending: sortConfig.ascending })
        .limit(50);

      allVideosData = exactVideos || [];
      
      // If no results, try fuzzy patterns
      if (allVideosData.length === 0) {
        for (const pattern of fuzzyPatterns.slice(0, 3)) {
          const { data: fuzzyVideos } = await supabase
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
              like_count,
              comment_count,
              is_public,
              created_at
            `)
            .eq('is_public', true)
            .or(`title.ilike.${pattern},description.ilike.${pattern}`)
            .order(sortConfig.column, { ascending: sortConfig.ascending })
            .limit(50);
          
          if (fuzzyVideos && fuzzyVideos.length > 0) {
            allVideosData = fuzzyVideos;
            break;
          }
        }
      }

      // Fetch profiles for the videos
      let videosWithProfiles = allVideosData || [];
      if (allVideosData && allVideosData.length > 0) {
        const userIds = [...new Set(allVideosData.map((v: any) => v.user_id))];
        const { data: videoProfilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        const profilesMap = new Map(
          videoProfilesData?.map(p => [p.user_id, p]) || []
        );

        videosWithProfiles = allVideosData.map((video: any) => ({
          ...video,
          profiles: profilesMap.get(video.user_id) || null
        }));
      }

      setSearchResults(videosWithProfiles);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Error",
        description: "Failed to search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchVideos(searchQuery);
  };

  const handleVideoClick = (video: any) => {
    setSelectedContent(video);
    setShowContentModal(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Search */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos, users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowTrending(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery && setShowTrending(true)}
                className="pl-10 bg-muted border-none"
              />
            </div>
          </form>
        </div>
        
        {/* Trending Searches */}
        {showTrending && searchQuery && !isLoading && searchResults.length === 0 && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium mb-2">Trending Searches</p>
            {trendingSearches.map((trend, index) => (
              <div
                key={index}
                className="py-2 px-3 hover:bg-muted/50 cursor-pointer rounded-md transition-colors"
                onClick={() => {
                  setSearchQuery(trend);
                  searchVideos(trend);
                  setShowTrending(false);
                }}
              >
                <p className="text-sm text-red-500 font-medium">{trend}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Accounts Section - Show on initial load and search results */}
      {!searchQuery && recommendedUsers.length > 0 && (
        <div className="py-4">
          <h2 className="text-lg font-semibold px-4 mb-4">Recommended Accounts</h2>
          <div className="space-y-6">
            {recommendedUsers.map((recommendedUser) => (
              <UserRecommendationCard
                key={recommendedUser.user_id}
                user={recommendedUser}
                currentUserId={user?.id}
                onVideoClick={handleVideoClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults.length === 0 && recommendedUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found</p>
            </div>
          ) : (
            <>
              {/* Recommended Users Section - TikTok Style */}
              {recommendedUsers.length > 0 && (
                <div className="py-4">
                  <h2 className="text-lg font-semibold px-4 mb-4">Accounts</h2>
                  <div className="space-y-6">
                    {recommendedUsers.map((recommendedUser) => (
                      <UserRecommendationCard
                        key={recommendedUser.user_id}
                        user={recommendedUser}
                        currentUserId={user?.id}
                        onVideoClick={handleVideoClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Video Results Grid */}
              {searchResults.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Videos</h2>
                    <Select value={sortOption} onValueChange={(value: any) => setSortOption(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="most_liked">Most Liked</SelectItem>
                        <SelectItem value="most_commented">Most Commented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {searchResults.map((video) => (
                      <div
                        key={video.id}
                        className="cursor-pointer group"
                        onClick={() => handleVideoClick(video)}
                      >
                        <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                          {video.video_url ? (
                            <video
                              src={video.video_url}
                              className="w-full h-full object-cover"
                              loop
                              muted
                              playsInline
                              autoPlay
                            />
                          ) : (
                            <img
                              src={video.thumbnail_url || '/placeholder.svg'}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-sm font-medium px-2 text-center line-clamp-2">
                              {video.title}
                            </p>
                          </div>
                        </div>
                        
                        {/* Video info below thumbnail */}
                        <div className="flex gap-2 mt-2 px-1">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={video.profiles?.avatar_url} alt={video.profiles?.display_name} />
                            <AvatarFallback>{video.profiles?.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2 mb-1">{video.title}</p>
                            <p className="text-xs text-muted-foreground">❤️ {video.like_count || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Content Detail Modal */}
      {showContentModal && selectedContent && (
        <ContentDetailModal
          isOpen={showContentModal}
          content={selectedContent}
          onClose={() => {
            setShowContentModal(false);
            setSelectedContent(null);
          }}
        />
      )}
    </div>
  );
};

// User Recommendation Card Component - TikTok Style
const UserRecommendationCard = ({ 
  user, 
  currentUserId,
  onVideoClick 
}: { 
  user: RecommendedUser;
  currentUserId?: string;
  onVideoClick: (video: any) => void;
}) => {
  const navigate = useNavigate();
  const { isFollowing, isLoading, toggleFollow, canFollow } = useFollow(user.user_id);

  return (
    <div className="border-b border-border pb-4">
      {/* User Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/user/${user.user_id}`)}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback>{user.display_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user.display_name || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {user.follower_count || 0} followers
            </p>
          </div>
        </div>
        {canFollow && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={toggleFollow}
            disabled={isLoading}
            className="ml-2"
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Following
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

      {/* Horizontal Video Scroll - No Scrollbar */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 px-4 pb-2">
          {user.videos.map((video) => (
            <div
              key={video.id}
              className="relative inline-block w-32 h-48 flex-shrink-0 cursor-pointer group"
              onClick={() => onVideoClick(video)}
            >
              <img
                src={video.thumbnail_url || '/placeholder.svg'}
                alt={video.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                <p className="text-white text-xs font-medium line-clamp-2">
                  {video.title}
                </p>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                ❤️ {video.like_count || 0}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default SearchPage;

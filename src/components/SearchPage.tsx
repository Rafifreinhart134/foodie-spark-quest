import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Heart, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchWizard from './SearchWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  serving?: string;
  budget?: string;
  preference?: string;
}

const SearchPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false); // Show all content by default
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({});

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
                    <Card key={result.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
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
                        <p className="text-xs text-muted-foreground mb-2">@{result.profiles?.display_name || 'Unknown'}</p>
                        
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
    </div>
  );
};

export default SearchPage;
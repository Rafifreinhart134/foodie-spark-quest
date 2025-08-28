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
  const [showWizard, setShowWizard] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({});

  useEffect(() => {
    // Load initial content
    fetchAllVideos();
  }, []);

  const fetchAllVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles (display_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
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
          *,
          profiles (display_name)
        `)
        .eq('is_public', true);

      // Add text search
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`);
      }

      // Add budget filter
      if (filters.budget) {
        queryBuilder = queryBuilder.eq('budget', getBudgetText(filters.budget));
      }

      // Add cooking time filter
      if (filters.preference === 'cepat') {
        queryBuilder = queryBuilder.eq('cooking_time', 'Under 15 menit');
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
      
      if (data && data.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search criteria",
        });
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: "Search failed",
        description: "Failed to search videos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetText = (budgetId: string) => {
    switch (budgetId) {
      case 'hemat': return 'Under Rp 10k';
      case 'sedang': return 'Rp 25k - 50k';
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
      <div className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          Cari Resep & Tempat
        </h1>
        <p className="text-muted-foreground">Temukan inspirasi masakan terbaik!</p>
      </div>

      <div className="p-4">
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
              Wizard Pencarian
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
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((result) => (
                  <Card key={result.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={result.thumbnail_url || '/placeholder.svg'}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="absolute bottom-3 left-3 text-white">
                          <div className="flex items-center space-x-2 text-xs mb-1">
                            <div className="flex items-center space-x-1">
                              <Play className="w-3 h-3" />
                              <span>0</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{formatNumber(result.like_count || 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {result.cooking_time || '2:30'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{result.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">@{result.profiles?.display_name || 'Unknown'}</p>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        {result.budget && (
                          <div className="flex items-center text-muted-foreground">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {result.budget}
                          </div>
                        )}
                        {result.cooking_time && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {result.cooking_time}
                          </div>
                        )}
                        {result.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {result.location}
                          </div>
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
  );
};

export default SearchPage;
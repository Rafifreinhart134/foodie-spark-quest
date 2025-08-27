import { useState } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categories = [
    { id: 'resep', name: 'Resep', emoji: '👨‍🍳' },
    { id: 'hidden_gem', name: 'Hidden Gem', emoji: '💎' },
    { id: 'tips', name: 'Tips', emoji: '💡' },
    { id: 'dessert', name: 'Dessert', emoji: '🍰' },
    { id: 'street_food', name: 'Street Food', emoji: '🍜' },
    { id: 'healthy', name: 'Healthy', emoji: '🥗' },
  ];

  const budgetRanges = [
    { id: 'under_10k', name: 'Under 10k', range: '< Rp 10.000' },
    { id: '10k_25k', name: '10k - 25k', range: 'Rp 10.000 - 25.000' },
    { id: '25k_50k', name: '25k - 50k', range: 'Rp 25.000 - 50.000' },
    { id: 'above_50k', name: 'Above 50k', range: '> Rp 50.000' },
  ];

  const timeRanges = [
    { id: 'quick', name: 'Quick', range: '< 15 menit' },
    { id: 'medium', name: 'Medium', range: '15 - 30 menit' },
    { id: 'long', name: 'Long', range: '> 30 menit' },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const mockResults = [
    {
      id: '1',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
      title: 'Martabak Manis Jakarta',
      user: '@chef_maya',
      views: '24k',
      duration: '2:45'
    },
    {
      id: '2',
      type: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      username: 'foodie_rina',
      followers: '125k',
      videos: '89'
    },
    // ... more results
  ];

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Search Header */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari makanan, user, atau tempat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 h-12 bg-muted border-0 rounded-full"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-3">Kategori</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={activeFilters.includes(category.id) ? "default" : "outline"}
              className={`px-3 py-2 rounded-full cursor-pointer transition-all ${
                activeFilters.includes(category.id) 
                  ? 'gradient-primary text-white border-0' 
                  : 'hover:border-primary'
              }`}
              onClick={() => toggleFilter(category.id)}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Budget Filter */}
        <h3 className="font-semibold text-lg mb-3 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-primary" />
          Budget
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {budgetRanges.map((budget) => (
            <Badge
              key={budget.id}
              variant={activeFilters.includes(budget.id) ? "default" : "outline"}
              className={`px-3 py-2 rounded-full cursor-pointer transition-all ${
                activeFilters.includes(budget.id) 
                  ? 'bg-food-yellow text-food-brown border-0' 
                  : 'hover:border-food-yellow'
              }`}
              onClick={() => toggleFilter(budget.id)}
            >
              {budget.range}
            </Badge>
          ))}
        </div>

        {/* Time Filter */}
        <h3 className="font-semibold text-lg mb-3 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Waktu Masak
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {timeRanges.map((time) => (
            <Badge
              key={time.id}
              variant={activeFilters.includes(time.id) ? "default" : "outline"}
              className={`px-3 py-2 rounded-full cursor-pointer transition-all ${
                activeFilters.includes(time.id) 
                  ? 'bg-food-green text-white border-0' 
                  : 'hover:border-food-green'
              }`}
              onClick={() => toggleFilter(time.id)}
            >
              {time.range}
            </Badge>
          ))}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Filter Aktif:</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveFilters([])}
                className="text-primary"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filterId) => {
                const category = categories.find(c => c.id === filterId);
                const budget = budgetRanges.find(b => b.id === filterId);
                const time = timeRanges.find(t => t.id === filterId);
                
                const item = category || budget || time;
                return item ? (
                  <Badge
                    key={filterId}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleFilter(filterId)}
                  >
                    {category?.name || budget?.name || time?.name} ×
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4">Hasil Pencarian</h3>
        <div className="grid grid-cols-2 gap-4">
          {mockResults.map((result) => (
            <div key={result.id} className="bg-card rounded-xl overflow-hidden shadow-card">
              {result.type === 'video' ? (
                <>
                  <div className="aspect-video relative">
                    <img 
                      src={result.thumbnail} 
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {result.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1">{result.title}</h4>
                    <p className="text-xs text-muted-foreground">{result.user} • {result.views} views</p>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <img 
                    src={result.avatar} 
                    alt={result.username}
                    className="w-16 h-16 rounded-full mx-auto mb-3"
                  />
                  <h4 className="font-medium mb-1">@{result.username}</h4>
                  <p className="text-xs text-muted-foreground">{result.followers} followers • {result.videos} videos</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
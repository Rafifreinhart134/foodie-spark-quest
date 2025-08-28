import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchWizard from '@/components/SearchWizard';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (filters: any) => {
    console.log('Search with filters:', filters);
    setShowWizard(false);
    // TODO: Implement actual search logic with Supabase
    setSearchResults([]);
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20">
        <SearchWizard onSearch={handleSearch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Search Header */}
      <div className="p-4 bg-card border-b">
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
            onClick={() => setShowWizard(true)}
          >
            <Filter className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Hasil Pencarian</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowWizard(true)}
          >
            Filter Lagi
          </Button>
        </div>
        
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Belum ada hasil</h3>
            <p className="text-muted-foreground mb-4">Coba ubah filter pencarian kamu</p>
            <Button onClick={() => setShowWizard(true)}>
              Cari Lagi
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {searchResults.map((result: any) => (
              <div key={result.id} className="bg-card rounded-xl overflow-hidden shadow-card">
                {/* Search result items */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
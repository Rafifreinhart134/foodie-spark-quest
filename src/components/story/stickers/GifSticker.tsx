import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GifStickerProps {
  onAdd: (gifUrl: string) => void;
  onClose: () => void;
}

interface GiphyGif {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
}

export const GifSticker = ({ onAdd, onClose }: GifStickerProps) => {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);

  // Giphy API key - using public beta key for demo
  const GIPHY_API_KEY = 'sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh';

  useEffect(() => {
    // Load trending GIFs on mount
    fetchTrendingGifs();
  }, []);

  useEffect(() => {
    if (search.length > 2) {
      const debounce = setTimeout(() => {
        searchGifs();
      }, 500);
      return () => clearTimeout(debounce);
    } else if (search.length === 0) {
      fetchTrendingGifs();
    }
  }, [search]);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
    }
    setLoading(false);
  };

  const searchGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(search)}&limit=12&rating=g`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    }
    setLoading(false);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add GIF</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <Input
        placeholder="Search GIFs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => {
                onAdd(gif.images.fixed_height.url);
                onClose();
              }}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img 
                src={gif.images.fixed_height.url} 
                alt="GIF" 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Powered by GIPHY
      </p>
    </div>
  );
};

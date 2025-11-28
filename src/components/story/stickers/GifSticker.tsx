import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface GifStickerProps {
  onAdd: (gifUrl: string) => void;
  onClose: () => void;
}

export const GifSticker = ({ onAdd, onClose }: GifStickerProps) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Placeholder GIFs for demo
  const popularGifs = [
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
    'https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif',
    'https://media.giphy.com/media/l0HlQXlQ3nHyLMvte/giphy.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif'
  ];

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
          {popularGifs.map((gif, idx) => (
            <button
              key={idx}
              onClick={() => {
                onAdd(gif);
                onClose();
              }}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            >
              <img 
                src={gif} 
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

import { Hash } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HashtagStickerProps {
  onAdd: (hashtag: string) => void;
  onClose: () => void;
}

export const HashtagSticker = ({ onAdd, onClose }: HashtagStickerProps) => {
  const [hashtag, setHashtag] = useState('');

  const trendingHashtags = [
    '#foodie',
    '#kuliner',
    '#makananenak',
    '#resepmasakan',
    '#jajanan',
    '#hiddengemjakarta',
    '#coffeeshop',
    '#dessert'
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add Hashtag</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <div className="relative">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Enter hashtag..."
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          className="w-full pl-10"
        />
      </div>

      {hashtag && (
        <Button 
          className="w-full" 
          onClick={() => {
            onAdd(`#${hashtag}`);
            onClose();
          }}
        >
          Add #{hashtag}
        </Button>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Trending Hashtags</p>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                onAdd(tag);
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-accent hover:bg-accent/80 transition-colors text-sm font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

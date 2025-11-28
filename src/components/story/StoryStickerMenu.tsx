import { useState } from 'react';
import { X, Search, MapPin, AtSign, Hash, Music, BarChart, HelpCircle, Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StoryStickerMenuProps {
  onClose: () => void;
  onAdd: (sticker: any) => void;
}

export const StoryStickerMenu = ({ onClose, onAdd }: StoryStickerMenuProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stickerCategories = [
    { icon: MapPin, label: 'Location', color: 'bg-blue-500' },
    { icon: AtSign, label: 'Mention', color: 'bg-purple-500' },
    { icon: Hash, label: 'Hashtag', color: 'bg-pink-500' },
    { icon: Music, label: 'Music', color: 'bg-green-500' },
    { icon: BarChart, label: 'Poll', color: 'bg-orange-500' },
    { icon: HelpCircle, label: 'Question', color: 'bg-red-500' },
    { icon: Timer, label: 'Countdown', color: 'bg-yellow-500' },
    { icon: Clock, label: 'Time', color: 'bg-indigo-500' },
  ];

  const handleStickerClick = (sticker: any) => {
    onAdd({
      content: sticker.label,
      icon: sticker.icon,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rotation: 0,
      scale: 1
    });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-[100] bg-background rounded-t-3xl max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Stickers</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stickers..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Sticker Grid */}
      <ScrollArea className="h-[50vh] px-4">
        <div className="grid grid-cols-3 gap-3 pb-4">
          {stickerCategories.map((sticker) => (
            <button
              key={sticker.label}
              onClick={() => handleStickerClick(sticker)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card hover:bg-accent transition-colors"
            >
              <div className={`w-16 h-16 rounded-full ${sticker.color} flex items-center justify-center`}>
                <sticker.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-medium text-center">{sticker.label}</span>
            </button>
          ))}
        </div>

        {/* GIF Section */}
        <div className="mt-4 mb-6">
          <h4 className="font-semibold mb-3">Trending GIFs</h4>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm"
              >
                GIF {i}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
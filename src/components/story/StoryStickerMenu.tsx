import { useState } from 'react';
import { MapPin, AtSign, Hash, BarChart3, MessageCircle, Clock, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LocationSticker } from './stickers/LocationSticker';
import { MentionSticker } from './stickers/MentionSticker';
import { HashtagSticker } from './stickers/HashtagSticker';
import { PollSticker } from './stickers/PollSticker';
import { QuestionSticker } from './stickers/QuestionSticker';
import { TimeSticker } from './stickers/TimeSticker';
import { GifSticker } from './stickers/GifSticker';

interface StoryStickerMenuProps {
  onClose: () => void;
  onAdd: (sticker: any) => void;
}

type StickerType = 'none' | 'location' | 'mention' | 'hashtag' | 'poll' | 'question' | 'time' | 'gif';

export const StoryStickerMenu = ({ onClose, onAdd }: StoryStickerMenuProps) => {
  const [search, setSearch] = useState('');
  const [activeSticker, setActiveSticker] = useState<StickerType>('none');

  const stickerCategories = [
    { id: 'location' as StickerType, label: 'Location', icon: MapPin },
    { id: 'mention' as StickerType, label: 'Mention', icon: AtSign },
    { id: 'hashtag' as StickerType, label: 'Hashtag', icon: Hash },
    { id: 'poll' as StickerType, label: 'Poll', icon: BarChart3 },
    { id: 'question' as StickerType, label: 'Question', icon: MessageCircle },
    { id: 'time' as StickerType, label: 'Time', icon: Clock },
    { id: 'gif' as StickerType, label: 'GIF', icon: Image },
  ];

  const handleStickerAdd = (content: any, type: StickerType) => {
    onAdd({
      type,
      content,
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 3,
      rotation: 0,
      scale: 1
    });
  };

  if (activeSticker === 'location') {
    return (
      <LocationSticker
        onAdd={(location) => handleStickerAdd(location, 'location')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  if (activeSticker === 'mention') {
    return (
      <MentionSticker
        onAdd={(mention) => handleStickerAdd(mention, 'mention')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  if (activeSticker === 'hashtag') {
    return (
      <HashtagSticker
        onAdd={(hashtag) => handleStickerAdd(hashtag, 'hashtag')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  if (activeSticker === 'poll') {
    return (
      <PollSticker
        onAdd={(poll) => handleStickerAdd(poll, 'poll')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  if (activeSticker === 'question') {
    return (
      <QuestionSticker
        onAdd={(question) => handleStickerAdd(question, 'question')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  if (activeSticker === 'time') {
    return (
      <TimeSticker
        onAdd={(time) => handleStickerAdd(time, 'time')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  if (activeSticker === 'gif') {
    return (
      <GifSticker
        onAdd={(gif) => handleStickerAdd(gif, 'gif')}
        onClose={() => setActiveSticker('none')}
      />
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[100] bg-background rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stickers..."
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stickerCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveSticker(category.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-accent hover:bg-accent/80 transition-colors"
          >
            <category.icon className="w-8 h-8" />
            <span className="text-xs font-medium">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

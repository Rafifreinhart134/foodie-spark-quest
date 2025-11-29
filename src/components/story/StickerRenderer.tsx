import { MapPin, AtSign, Hash, BarChart3, MessageCircle, Clock } from 'lucide-react';

interface StickerRendererProps {
  sticker: {
    type: 'location' | 'mention' | 'hashtag' | 'poll' | 'question' | 'time' | 'gif';
    content: any;
  };
}

export const StickerRenderer = ({ sticker }: StickerRendererProps) => {
  switch (sticker.type) {
    case 'location':
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">{sticker.content}</span>
          </div>
        </div>
      );

    case 'mention':
      return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <AtSign className="w-5 h-5 text-white" />
            <span className="font-bold text-white">{sticker.content}</span>
          </div>
        </div>
      );

    case 'hashtag':
      return (
        <div className="bg-blue-500 rounded-full px-5 py-2 shadow-lg">
          <span className="font-bold text-white text-lg">{sticker.content}</span>
        </div>
      );

    case 'poll':
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-xl min-w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">{sticker.content.question}</span>
          </div>
          <div className="space-y-2">
            {sticker.content.options.map((option: string, idx: number) => (
              <div
                key={idx}
                className="bg-accent/50 rounded-full px-4 py-2 text-sm font-medium text-foreground"
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      );

    case 'question':
      return (
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-5 shadow-xl min-w-[280px]">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="font-semibold text-white text-sm">Question</span>
          </div>
          <p className="text-white text-lg font-medium">{sticker.content}</p>
        </div>
      );

    case 'time':
      return (
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white" />
            <div>
              <div className="text-white font-bold text-xl">
                {new Date().toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {sticker.content.format === 'full' && (
                <div className="text-white/80 text-xs">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'gif':
      return (
        <div className="rounded-2xl overflow-hidden shadow-xl max-w-[200px]">
          <img 
            src={sticker.content} 
            alt="GIF" 
            className="w-full h-auto"
          />
        </div>
      );

    default:
      return <div className="text-white">{JSON.stringify(sticker.content)}</div>;
  }
};

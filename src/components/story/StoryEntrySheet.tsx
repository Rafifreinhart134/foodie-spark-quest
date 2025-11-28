import { Camera, Video, Zap, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryEntrySheetProps {
  onClose: () => void;
  onSelectStory: () => void;
}

export const StoryEntrySheet = ({ onClose, onSelectStory }: StoryEntrySheetProps) => {
  const options = [
    { icon: Camera, label: 'Story', color: 'from-purple-500 to-pink-500', action: onSelectStory },
    { icon: Video, label: 'Post', color: 'from-blue-500 to-cyan-500', action: () => {} },
    { icon: Zap, label: 'Reel', color: 'from-orange-500 to-red-500', action: () => {} },
    { icon: Radio, label: 'Live', color: 'from-red-500 to-pink-600', action: () => {} },
  ];

  return (
    <div className="relative w-full h-full">
      {/* Background blur overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-up sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold">Buat</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 p-6">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={option.action}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card hover:bg-accent transition-all active:scale-95"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg`}>
                <option.icon className="w-8 h-8 text-white" />
              </div>
              <span className="font-semibold text-foreground">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Safe area padding */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
};
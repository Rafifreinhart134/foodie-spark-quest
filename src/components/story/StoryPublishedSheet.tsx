import { Eye, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface StoryPublishedSheetProps {
  onClose: () => void;
  onAddMore: () => void;
  onViewStory: () => void;
}

export const StoryPublishedSheet = ({ onClose, onAddMore, onViewStory }: StoryPublishedSheetProps) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="w-full bg-background rounded-t-3xl p-6 space-y-6"
      >
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-scale-in">
              <Eye className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Story Published!</h3>
          <p className="text-muted-foreground">
            Your story is now live and visible to your followers
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">24h</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full"
            onClick={onViewStory}
          >
            <Eye className="w-5 h-5 mr-2" />
            View Story
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 font-semibold rounded-full"
            onClick={onAddMore}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add More
          </Button>

          <button
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => {
              // Add to highlights logic
            }}
          >
            <Star className="w-4 h-4" />
            <span>Add to Highlights</span>
          </button>
        </div>

        {/* Close */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={onClose}
        >
          Close
        </Button>

        <div className="h-4" />
      </motion.div>
    </div>
  );
};
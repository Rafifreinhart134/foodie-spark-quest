import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStories } from '@/hooks/useStories';

interface StorySettingsSheetProps {
  onClose: () => void;
  onPost: (settings: any) => void;
  storyPreview: string;
}

export const StorySettingsSheet = ({ onClose, onPost, storyPreview }: StorySettingsSheetProps) => {
  const [postToStory, setPostToStory] = useState(true);
  const [postToCloseFriends, setPostToCloseFriends] = useState(false);
  const [allowResharing, setAllowResharing] = useState(true);
  const [saveToArchive, setSaveToArchive] = useState(true);
  const [hideFrom, setHideFrom] = useState<string[]>([]);

  const handleShare = () => {
    onPost({
      postToStory,
      postToCloseFriends,
      allowResharing,
      saveToArchive,
      hideFrom
    });
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          <h3 className="font-semibold text-lg">Share to</h3>
          <div className="w-10" />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-4">
          {/* Preview */}
          <div className="py-4">
            <div className="w-20 h-28 mx-auto rounded-xl overflow-hidden border-2 border-border">
              <img src={storyPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-1 mb-6">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">Your Story</p>
                <p className="text-sm text-muted-foreground">Share to your story</p>
              </div>
              <Switch
                checked={postToStory}
                onCheckedChange={setPostToStory}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold">Close Friends</p>
                <p className="text-sm text-muted-foreground">Share with close friends only</p>
              </div>
              <Switch
                checked={postToCloseFriends}
                onCheckedChange={setPostToCloseFriends}
              />
            </div>

            <button className="flex items-center justify-between w-full py-3">
              <div className="text-left">
                <p className="font-semibold">Hide story from...</p>
                <p className="text-sm text-muted-foreground">{hideFrom.length} people</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-1 mb-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between py-3">
              <p className="font-semibold">Save to Archive</p>
              <Switch
                checked={saveToArchive}
                onCheckedChange={setSaveToArchive}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <p className="font-semibold">Allow Resharing</p>
              <Switch
                checked={allowResharing}
                onCheckedChange={setAllowResharing}
              />
            </div>
          </div>
        </ScrollArea>

        {/* Share Button */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full"
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { StoryEntrySheet } from './StoryEntrySheet';
import { StoryCameraScreen } from './StoryCameraScreen';
import { StoryEditorScreen } from './StoryEditorScreen';
import { StoryPostingProgress } from './StoryPostingProgress';
import { StoryPublishedSheet } from './StoryPublishedSheet';

type StoryFlowStage = 
  | 'entry'
  | 'camera' 
  | 'editor'
  | 'settings'
  | 'posting'
  | 'published';

interface StoryCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryCreationFlow = ({ isOpen, onClose }: StoryCreationFlowProps) => {
  const [stage, setStage] = useState<StoryFlowStage>('entry');
  const [capturedMedia, setCapturedMedia] = useState<{
    url: string;
    type: 'photo' | 'video';
    file?: File;
  } | null>(null);
  const [editedStory, setEditedStory] = useState<any>(null);

  const handleReset = () => {
    setStage('entry');
    setCapturedMedia(null);
    setEditedStory(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 bg-black border-none">
        {/* 1️⃣ ENTRY POINT - Story Options Sheet */}
        {stage === 'entry' && (
          <StoryEntrySheet 
            onClose={handleClose}
            onSelectStory={() => setStage('camera')}
          />
        )}

        {/* 2️⃣ CAMERA SCREEN */}
        {stage === 'camera' && (
          <StoryCameraScreen
            onClose={handleClose}
            onCapture={(media) => {
              setCapturedMedia(media);
              setStage('editor');
            }}
          />
        )}

        {/* 3️⃣-8️⃣ EDITOR SCREEN (includes text, stickers, draw, filters, settings) */}
        {stage === 'editor' && capturedMedia && (
          <StoryEditorScreen
            media={capturedMedia}
            onClose={handleClose}
            onPost={(storyData) => {
              setEditedStory(storyData);
              setStage('posting');
            }}
            onBack={() => setStage('camera')}
          />
        )}

        {/* 9️⃣ POSTING STATE */}
        {stage === 'posting' && editedStory && (
          <StoryPostingProgress
            story={editedStory}
            onComplete={() => setStage('published')}
          />
        )}

        {/* 🔟 STORY PUBLISHED */}
        {stage === 'published' && (
          <StoryPublishedSheet
            onClose={handleClose}
            onAddMore={() => {
              handleReset();
              setStage('camera');
            }}
            onViewStory={() => {
              // Navigate to story viewer
              handleClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
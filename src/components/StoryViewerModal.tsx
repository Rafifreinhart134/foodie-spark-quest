import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Pause, Play, ChevronLeft, ChevronRight, Trash2, Archive, ArchiveX } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex: number;
  onMarkAsViewed: (storyId: string) => void;
  onDeleteStory?: (storyId: string) => void;
  onArchiveStory?: (storyId: string) => void;
  onUnarchiveStory?: (storyId: string) => void;
}

export const StoryViewerModal = ({ 
  isOpen, 
  onClose, 
  stories, 
  initialStoryIndex,
  onMarkAsViewed,
  onDeleteStory,
  onArchiveStory,
  onUnarchiveStory
}: StoryViewerModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const currentStory = stories[currentIndex];
  const isOwner = user?.id === currentStory?.user_id;

  useEffect(() => {
    if (!isOpen || !currentStory) return;

    // Mark as viewed
    if (!currentStory.has_viewed) {
      onMarkAsViewed(currentStory.id);
    }

    setProgress(0);

    if (currentStory.media_type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(err => console.error('Video play error:', err));
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isOpen, currentStory]);

  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    const duration = currentStory.media_type === 'video' 
      ? (videoRef.current?.duration || currentStory.duration) * 1000
      : currentStory.duration * 1000;

    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isPaused, isOpen, currentStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleDelete = () => {
    if (onDeleteStory && currentStory) {
      onDeleteStory(currentStory.id);
      if (stories.length > 1) {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else {
          handleNext();
        }
      } else {
        onClose();
      }
    }
  };

  const handleArchive = () => {
    if (onArchiveStory && currentStory) {
      onArchiveStory(currentStory.id);
    }
  };

  const handleUnarchive = () => {
    if (onUnarchiveStory && currentStory) {
      onUnarchiveStory(currentStory.id);
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-50 flex gap-1">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-40 px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={currentStory.profiles?.avatar_url} />
                <AvatarFallback>
                  {currentStory.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm">
                  {currentStory.profiles?.display_name || 'User'}
                </p>
                <p className="text-white/70 text-xs">
                  {new Date(currentStory.created_at).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={togglePause}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              {isOwner && (
                <>
                  {currentStory.is_archived ? (
                    onUnarchiveStory && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-blue-500/80"
                        onClick={handleUnarchive}
                      >
                        <ArchiveX className="w-5 h-5" />
                      </Button>
                    )
                  ) : (
                    onArchiveStory && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-green-500/80"
                        onClick={handleArchive}
                      >
                        <Archive className="w-5 h-5" />
                      </Button>
                    )
                  )}
                  {onDeleteStory && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-red-500/80"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Story content */}
        <div className="relative aspect-[9/16] bg-black">
          {currentStory.media_type === 'image' ? (
            <img 
              src={currentStory.media_url} 
              alt="Story"
              className="w-full h-full object-contain"
            />
          ) : (
            <video 
              ref={videoRef}
              src={currentStory.media_url}
              className="w-full h-full object-contain"
              playsInline
              onEnded={handleNext}
            />
          )}

          {/* Navigation areas */}
          <div className="absolute inset-0 flex">
            <div 
              className="flex-1 cursor-pointer"
              onClick={handlePrevious}
            >
              {currentIndex > 0 && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div 
              className="flex-1 cursor-pointer"
              onClick={handleNext}
            >
              {currentIndex < stories.length - 1 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        {isOwner && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-center gap-4 text-white text-sm">
              <span>👁️ {currentStory.view_count || 0} views</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
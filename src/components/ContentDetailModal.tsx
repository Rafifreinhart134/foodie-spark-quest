import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, X, ChevronLeft, ChevronRight, Bookmark, Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface FoodItem {
  name: string;
  amount: string;
  calories: number;
  protein: number;
}

interface NutritionalInfo {
  totalCalories: number;
  items: FoodItem[];
}

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    description?: string;
    video_url?: string;
    thumbnail_url?: string;
    like_count: number;
    comment_count: number;
    user_liked?: boolean;
    user_saved?: boolean;
    nutritional_info?: NutritionalInfo;
  };
  onLike?: () => void;
  onSave?: () => void;
  onComment?: (videoId: string, videoTitle: string) => void;
  onShare?: (videoId: string, videoTitle: string) => void;
  canNavigate?: boolean;
  onNavigate?: (direction: 'prev' | 'next') => void;
  currentIndex?: number;
  totalCount?: number;
}

const ContentDetailModal = ({ 
  isOpen, 
  onClose, 
  content, 
  onLike, 
  onSave, 
  onComment,
  onShare,
  canNavigate = false, 
  onNavigate, 
  currentIndex = 0, 
  totalCount = 1 
}: ContentDetailModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const isVideo = content.video_url && (
    content.video_url.includes('.mp4') || 
    content.video_url.includes('.mov') || 
    content.video_url.includes('.avi') ||
    content.video_url.includes('.webm') ||
    content.video_url.includes('video')
  );

  const handleVideoClick = () => {
    if (videoRef.current && isVideo) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.muted = false; // Enable sound
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen && videoRef.current && isVideo) {
      videoRef.current.muted = false; // Enable sound
      videoRef.current.play();
      setIsPlaying(true);
    }
    
    // Cleanup function to ensure video stops when modal closes
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, [isOpen, isVideo]);

  // Handle content changes - CRITICAL for fixing the video switching bug
  useEffect(() => {
    if (videoRef.current && content) {
      // Reset video state
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      
      // Force reload the video element with new content
      if (isVideo && content.video_url) {
        videoRef.current.load(); // This forces the video to reload
        
        // Auto-play the new video if modal is open
        if (isOpen) {
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              videoRef.current.play();
              setIsPlaying(true);
            }
          }, 100); // Small delay to ensure video is loaded
        }
      }
    }
  }, [content?.video_url, content?.id, isVideo, isOpen]); // React to content changes

  // Additional cleanup when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Keyboard navigation for content
  useEffect(() => {
    if (!isOpen || !canNavigate || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          onNavigate('prev');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < totalCount - 1) {
          onNavigate('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canNavigate, onNavigate, currentIndex, totalCount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[90vh] p-0 bg-black">
        <VisuallyHidden>
          <DialogTitle>{content?.title || 'Content Detail'}</DialogTitle>
          <DialogDescription>{content?.description || 'Content details'}</DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col h-full">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Navigation buttons */}
          {canNavigate && onNavigate && (
            <>
              {currentIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}
              {currentIndex < totalCount - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </>
          )}

          {/* Video Area - 70% of height - Click area limited to video only */}
          <div className="relative bg-black flex items-center justify-center" style={{ height: '70%' }}>
            {isVideo ? (
              <div className="relative w-4/5 h-4/5 pointer-events-auto" onClick={handleVideoClick}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black rounded-lg"
                  poster={content.thumbnail_url}
                  preload="metadata"
                  loop
                  playsInline
                  controls={false}
                >
                  <source src={content.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {/* Pause/Play Button - Always visible but fades when playing */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                  <div className="w-20 h-20 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-4/5 h-4/5 flex items-center justify-center bg-black rounded-lg">
                <img 
                  src={content.thumbnail_url || content.video_url}
                  alt={content.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Content Info - 30% of height - Fully interactive bottom area */}
          <div className="bg-background border-t-2 border-border relative z-20 pointer-events-auto overflow-y-auto" style={{ height: '30%' }}>
            {/* Title and Description Area */}
            <div className="p-4 pb-2">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{content.title}</h3>
              {content.description && (
                <div className="text-muted-foreground text-sm">
                  <p className={showFullDescription ? '' : 'line-clamp-1'}>
                    {content.description}
                  </p>
                  {content.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowFullDescription(!showFullDescription);
                      }}
                      className="text-primary text-xs mt-1 hover:underline pointer-events-auto"
                    >
                      {showFullDescription ? 'Show less' : 'More info'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Nutritional Info Table for Food Scans */}
            {content.nutritional_info && (
              <div className="px-4 pb-6">
                <h3 className="font-semibold mb-3">Ingredient Breakdown</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Ingredient</th>
                        <th className="text-center p-3 text-sm font-semibold">Amount</th>
                        <th className="text-center p-3 text-sm font-semibold">Calories</th>
                        <th className="text-center p-3 text-sm font-semibold">Protein</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.nutritional_info.items.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm capitalize">{item.name}</td>
                          <td className="p-3 text-sm text-center">{item.amount}</td>
                          <td className="p-3 text-sm text-center font-semibold">{item.calories}</td>
                          <td className="p-3 text-sm text-center">{item.protein}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Interactive Buttons Area - Dedicated clickable zone */}
            <div className="px-4 py-2 pointer-events-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLike && onLike();
                    }}
                    className={`flex flex-col items-center space-y-1 transition-all duration-200 p-3 rounded-lg hover:bg-accent/50 pointer-events-auto cursor-pointer ${
                      content.user_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${content.user_liked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{content.like_count}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onComment && onComment(content.id, content.title);
                    }}
                    className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-blue-500 transition-all duration-200 p-3 rounded-lg hover:bg-accent/50 pointer-events-auto cursor-pointer"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs font-medium">{content.comment_count}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onShare && onShare(content.id, content.title);
                    }}
                    className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-green-500 transition-all duration-200 p-3 rounded-lg hover:bg-accent/50 pointer-events-auto cursor-pointer"
                  >
                    <Share className="w-6 h-6" />
                    <span className="text-xs font-medium">Share</span>
                  </button>
                </div>
                
                {onSave && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSave && onSave();
                    }}
                    className={`flex flex-col items-center space-y-1 transition-all duration-200 p-3 rounded-lg hover:bg-accent/50 pointer-events-auto cursor-pointer ${
                      content.user_saved ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${content.user_saved ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{content.user_saved ? 'Saved' : 'Save'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDetailModal;
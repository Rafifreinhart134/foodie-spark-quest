import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, X, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
  }, [isOpen, isVideo]);

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

          {/* Video Area - 3/4 of height - Limited to video interaction only */}
          <div className="relative bg-black pointer-events-none" style={{ height: '75%' }}>
            {isVideo ? (
              <div className="w-full h-full pointer-events-auto" onClick={handleVideoClick}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black"
                  poster={content.thumbnail_url}
                  preload="metadata"
                  loop
                  playsInline
                  controls={false}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                >
                  <source src={content.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black p-4">
                <img 
                  src={content.thumbnail_url || content.video_url}
                  alt={content.title}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    aspectRatio: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </div>
            )}
          </div>

          {/* Content Info - 1/4 of height - Completely separated from video */}
          <div className="bg-background border-t-2 border-border p-4 relative z-20 pointer-events-auto" style={{ height: '25%' }}>
            {/* Title and Description */}
            <div className="mb-4 overflow-y-auto max-h-16">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{content.title}</h3>
              {content.description && (
                <div className="text-muted-foreground text-sm">
                  <p className={showFullDescription ? '' : 'line-clamp-2'}>
                    {content.description}
                  </p>
                  {content.description.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowFullDescription(!showFullDescription);
                      }}
                      className="text-primary text-xs mt-1 hover:underline"
                    >
                      {showFullDescription ? 'Show less' : 'More info'}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Interactive buttons - Ensure they're clickable */}
            <div className="flex items-center justify-between relative z-30">
              <div className="flex items-center space-x-8">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLike && onLike();
                  }}
                  className={`flex items-center space-x-2 transition-colors p-2 rounded-lg hover:bg-muted/50 ${
                    content.user_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${content.user_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{content.like_count}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onComment && onComment(content.id, content.title);
                  }}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-muted/50"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">{content.comment_count}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onShare && onShare(content.id, content.title);
                  }}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-muted/50"
                >
                  <Share className="w-6 h-6" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
              
              {onSave && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSave && onSave();
                  }}
                  className={`flex items-center space-x-2 transition-colors p-2 rounded-lg hover:bg-muted/50 ${
                    content.user_saved ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
                  }`}
                >
                  <Bookmark className={`w-6 h-6 ${content.user_saved ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{content.user_saved ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDetailModal;
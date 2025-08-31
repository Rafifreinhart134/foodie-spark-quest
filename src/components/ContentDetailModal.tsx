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
        <div className="relative w-full h-full">
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

          {/* Media Content */}
          {isVideo ? (
            <div className="w-full h-full" onClick={handleVideoClick}>
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

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-semibold text-lg mb-2">{content.title}</h3>
            {content.description && (
              <p className="text-white/80 text-sm mb-4">{content.description}</p>
            )}
            
            {/* Interactive buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={onLike}
                  className={`flex items-center space-x-2 text-white transition-colors ${
                    content.user_liked ? 'text-red-400' : 'hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${content.user_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{content.like_count}</span>
                </button>
                <button
                  onClick={() => onComment && onComment(content.id, content.title)}
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{content.comment_count}</span>
                </button>
                <button 
                  onClick={() => onShare && onShare(content.id, content.title)}
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                >
                  <Share className="w-5 h-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
              
              {onSave && (
                <button
                  onClick={onSave}
                  className={`text-white transition-colors ${
                    content.user_saved ? 'text-yellow-400' : 'hover:text-yellow-400'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${content.user_saved ? 'fill-current' : ''}`} />
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
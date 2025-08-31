import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, X } from 'lucide-react';
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
  };
}

const ContentDetailModal = ({ isOpen, onClose, content }: ContentDetailModalProps) => {
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
            
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-white">
                <Heart className="w-5 h-5" />
                <span className="text-sm">{content.like_count}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{content.comment_count}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Share className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDetailModal;
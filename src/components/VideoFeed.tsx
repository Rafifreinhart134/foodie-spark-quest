import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Utensils, Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useVideos, Video } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useFollow } from '@/hooks/useFollow';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onLike: (videoId: string) => void;
  onSave: (videoId: string) => void;
  onComment: (videoId: string, videoTitle: string) => void;
  onShare: (videoId: string, videoTitle: string) => void;
}

const VideoCard = ({ video, isActive, onLike, onSave, onComment, onShare }: VideoCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow(video.user_id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleLike = () => {
    onLike(video.id);
  };

  const handleSave = () => {
    onSave(video.id);
  };

  const handleComment = () => {
    onComment(video.id, video.title);
  };

  const handleShare = () => {
    onShare(video.id, video.title);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (video.user_id) {
      navigate(`/profile/${video.user_id}`);
    }
  };

  const isVideo = video.video_url && (
    video.video_url.includes('.mp4') || 
    video.video_url.includes('.mov') || 
    video.video_url.includes('.avi') ||
    video.video_url.includes('.webm') ||
    video.video_url.includes('video')
  );

  const isPhoto = !isVideo;

  const handleVideoClick = () => {
    console.log('Video clicked!', { isVideo, isPlaying, hasVideoRef: !!videoRef.current });
    
    if (videoRef.current && isVideo) {
      if (isPlaying) {
        console.log('Pausing video');
        videoRef.current.pause();
        setIsPlaying(false);
        // UI elements akan kembali aktif setelah pause
      } else {
        console.log('Playing video');
        videoRef.current.muted = false;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const timer = setTimeout(() => {
      setHideUI(true);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setHideUI(false);
  };

  useEffect(() => {
    if (videoRef.current && isActive && isVideo) {
      // Autoplay when video comes into view
      videoRef.current.muted = false;
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current && !isActive) {
      // Stop and unload when video goes out of view
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to beginning
      setIsPlaying(false);
    }
    
    // Cleanup function to ensure video stops when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, [isActive, isVideo]);

  return (
    <div className="video-container relative h-screen w-full">
      {/* Top Header */}
      {!hideUI && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/60 to-transparent pt-4 pb-8">
          <div className="flex items-center justify-between px-4">
            {/* Search Icon */}
            <Button variant="ghost" size="icon" className="text-white">
              <Search className="w-6 h-6" />
            </Button>

            {/* Center Tabs */}
            <div className="flex items-center gap-6">
              <button className="text-white font-semibold text-base font-poppins border-b-2 border-white pb-1">
                Inspirasi
              </button>
              <button className="text-white/70 font-semibold text-base font-poppins pb-1">
                Mengikuti
              </button>
            </div>

            {/* Notification Icon */}
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Media Content - Direct click handler without interference */}
      {isVideo ? (
        <div 
          className="absolute inset-0 z-10" 
          onClick={handleVideoClick}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            poster={video.thumbnail_url}
            preload="metadata"
            loop
            playsInline
            controls={false}
          >
            <source src={video.video_url} type="video/mp4" />
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
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black z-10"
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
        >
          <img 
            src={video.thumbnail_url || video.video_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'}
            alt={video.title}
            className="max-w-full max-h-full object-contain"
          />
          <div className="video-overlay" />
        </div>
      )}

      {/* Middle Area - Video Play/Pause Control */}
      <div 
        className="absolute inset-0 z-30 flex items-center justify-center"
        onClick={handleVideoClick}
        style={{ 
          left: '25%', 
          right: '25%', 
          pointerEvents: isVideo ? 'auto' : 'none'
        }}
      >
        {isVideo && !isPlaying && (
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        )}
      </div>

      {/* Bottom Information */}
      {!hideUI && (
        <div className="absolute bottom-20 left-0 right-0 px-4 pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30">
          <div className="flex items-end justify-between">
            {/* Left side - User info and caption */}
            <div className="flex-1 pr-4 space-y-3">
              {/* User Profile Section */}
              <div className="space-y-2">
                <div 
                  className="flex items-center space-x-2" 
                  onClick={handleUserClick}
                >
                  <div className="relative cursor-pointer">
                    <Avatar className="w-12 h-12 border-2 border-white">
                      <AvatarImage src={video.profiles?.avatar_url || ''} alt={video.profiles?.display_name || 'User'} />
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {(video.profiles?.display_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user?.id !== video.user_id && !isFollowing && (
                      <Button
                        size="icon"
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary hover:bg-primary/90 border-2 border-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollow();
                        }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold font-poppins">
                      {video.profiles?.display_name || 'Anonymous'}
                    </span>
                    <Badge className="bg-warning text-black px-2 py-0.5 text-xs font-semibold">
                      UMKM
                    </Badge>
                  </div>
                </div>

                {/* Caption */}
                {video.description && (
                  <div className="text-white/90 text-sm font-poppins">
                    {showFullDescription ? (
                      <p className="whitespace-pre-wrap">{video.description}</p>
                    ) : (
                      <p className="line-clamp-2">{video.description}</p>
                    )}
                    {video.description.length > 100 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullDescription(!showFullDescription);
                        }}
                        className="text-white/70 font-semibold text-sm mt-1"
                      >
                        {showFullDescription ? 'Show less' : 'More info'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-col items-center space-y-3">
              {/* Like Button */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  className="text-white hover:bg-transparent"
                >
                  <Heart className={`w-7 h-7 ${video.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <span className="text-xs text-white font-medium font-poppins">{video.like_count || 0}</span>
              </div>

              {/* Comment Button */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleComment}
                  className="text-white hover:bg-transparent"
                >
                  <MessageCircle className="w-7 h-7" />
                </Button>
                <span className="text-xs text-white font-medium font-poppins">{video.comment_count || 0}</span>
              </div>

              {/* Recipe Button - Circular with Green Background */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-14 h-14 rounded-full bg-primary text-white hover:scale-110 hover:bg-primary/90 shadow-elevated transition-fast active:scale-95"
                >
                  <Utensils className="w-7 h-7" />
                </Button>
              </div>

              {/* Save Button */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  className="text-white hover:bg-transparent"
                >
                  <Bookmark className={`w-7 h-7 ${video.user_saved ? 'fill-warning text-warning' : ''}`} />
                </Button>
              </div>

              {/* Share Button */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="text-white hover:bg-transparent"
                >
                  <Share className="w-7 h-7" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoFeed = () => {
  const { videos, loading, toggleLike, toggleSave } = useVideos();
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsModal, setCommentsModal] = useState<{isOpen: boolean, videoId: string, videoTitle: string}>({
    isOpen: false,
    videoId: '',
    videoTitle: ''
  });
  const [shareModal, setShareModal] = useState<{isOpen: boolean, videoId: string, videoTitle: string}>({
    isOpen: false,
    videoId: '',
    videoTitle: ''
  });
  const [startY, setStartY] = useState<number | null>(null);

  // Keyboard and trackpad navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex(Math.max(0, currentIndex - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex(Math.min(videos.length - 1, currentIndex + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(Math.max(0, currentIndex - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(Math.min(videos.length - 1, currentIndex + 1));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        // Increased threshold and reduced sensitivity
        if (e.deltaY > 100) {
          setCurrentIndex(prev => Math.min(videos.length - 1, prev + 1));
        } else if (e.deltaY < -100) {
          setCurrentIndex(prev => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, videos.length]);

  if (loading) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const handleLike = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video && !video.user_liked && user && video.user_id !== user.id) {
      // Create notification for video owner
      await createNotification(
        video.user_id,
        'like',
        `${user.user_metadata?.display_name || 'Someone'} liked your video "${video.title}"`,
        videoId
      );
    }
    toggleLike(videoId);
  };

  const handleComment = (videoId: string, videoTitle: string) => {
    setCommentsModal({ isOpen: true, videoId, videoTitle });
  };

  const handleShare = (videoId: string, videoTitle: string) => {
    setShareModal({ isOpen: true, videoId, videoTitle });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY === null) return;
    
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    const threshold = 80; // Increased threshold for less sensitivity
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe up - next video (only move one at a time)
        setCurrentIndex(prev => Math.min(videos.length - 1, prev + 1));
      } else {
        // Swipe down - previous video (only move one at a time)
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    }
    
    setStartY(null);
  };

  if (!videos.length) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No videos available</h3>
          <p className="text-gray-300">Be the first to upload a video!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={`absolute inset-0 transition-transform duration-300 ${
            index === currentIndex ? 'translate-y-0' : 
            index < currentIndex ? '-translate-y-full' : 'translate-y-full'
          }`}
        >
          <VideoCard 
            video={video} 
            isActive={index === currentIndex} 
            onLike={handleLike}
            onSave={toggleSave}
            onComment={handleComment}
            onShare={handleShare}
          />
        </div>
      ))}

      {/* Modals */}
      <CommentsModal
        isOpen={commentsModal.isOpen}
        onClose={() => setCommentsModal({ isOpen: false, videoId: '', videoTitle: '' })}
        videoId={commentsModal.videoId}
        videoTitle={commentsModal.videoTitle}
      />

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, videoId: '', videoTitle: '' })}
        videoId={shareModal.videoId}
        videoTitle={shareModal.videoTitle}
      />
    </div>
  );
};

export default VideoFeed;
import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Share, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useVideos, Video } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
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
  }, [isActive, isVideo]);

  return (
    <div className="video-container relative h-screen w-full">
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
          pointerEvents: 'auto'
        }}
      >
        {!isPlaying && (
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className={`absolute inset-0 flex transition-opacity duration-300 ${hideUI ? 'opacity-0' : 'opacity-100'} z-20`}>
        {/* Left Side - Content Info */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-20 pointer-events-auto">
          {/* User Info - Clickable */}
          <div 
            className="flex items-center space-x-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleUserClick}
          >
            <img
              src={video.profiles?.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'}
              alt={video.profiles?.display_name || 'User'}
              className="w-12 h-12 rounded-full border-2 border-white object-cover"
            />
            <div>
              <h3 className="text-white font-semibold text-lg">@{video.profiles?.display_name || 'user'}</h3>
            </div>
          </div>

          {/* Description with More/Less functionality */}
          <div className="text-white text-sm mb-3 leading-relaxed max-w-xs">
            <p className={`${!showFullDescription ? 'line-clamp-2' : ''}`}>
              {video.description || video.title}
            </p>
            
            {/* Show hashtags only when expanded */}
            {showFullDescription && video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {video.tags.map((tag, index) => (
                  <span key={index} className="text-blue-400 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Show additional info only when expanded */}
            {showFullDescription && (
              <div className="flex flex-wrap gap-2 mt-2 text-white/80 text-xs">
                {video.budget && <span className="bg-white/20 px-2 py-1 rounded-full">💰 {video.budget}</span>}
                {video.cooking_time && <span className="bg-white/20 px-2 py-1 rounded-full">⏱️ {video.cooking_time}</span>}
                {video.location && <span className="bg-white/20 px-2 py-1 rounded-full">📍 {video.location}</span>}
              </div>
            )}
            
            {/* More/Less button */}
            {((video.description || video.title).length > 100 || 
              (video.tags && video.tags.length > 0) || 
              video.budget || video.cooking_time || video.location) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-white/80 text-xs mt-1 hover:text-white transition-colors"
              >
                {showFullDescription ? 'less' : 'more'}
              </button>
            )}
          </div>

        </div>

        {/* Right Side - Action Buttons */}
        <div className="w-20 flex flex-col justify-end pb-20 pr-4 space-y-6 pointer-events-auto">
          {/* Like Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`w-12 h-12 rounded-full border transition-all duration-300 active:scale-95 ${
                video.user_liked 
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:scale-110 hover:bg-white/20'
              }`}
            >
              <Heart className={`w-6 h-6 ${video.user_liked ? 'fill-current' : ''}`} />
            </Button>
            <span className="text-xs text-white font-medium">{video.like_count}</span>
          </div>

          {/* Comment Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleComment}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:scale-110 hover:bg-white/20 transition-all duration-300 active:scale-95"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-xs text-white font-medium">{video.comment_count}</span>
          </div>

          {/* More Button with Dropdown */}
          <div className="tiktok-action">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:scale-110 hover:bg-white/20 transition-all duration-300 active:scale-95"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleSave}>
                  <Bookmark className={`w-4 h-4 mr-2 ${video.user_saved ? 'fill-current text-yellow-500' : ''}`} />
                  {video.user_saved ? 'Unsave' : 'Save'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
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
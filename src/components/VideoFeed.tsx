import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Utensils, Search, Plus, Play, Pause, Tag, X, Volume2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useVideos, Video } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useFollow } from '@/hooks/useFollow';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { RecipeModal } from './RecipeModal';

import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onLike: (videoId: string) => void;
  onSave: (videoId: string) => void;
  onComment: (videoId: string, videoTitle: string) => void;
  onShare: (videoId: string, videoTitle: string) => void;
  onRecipe: (video: Video) => void;
  feedType: 'inspirasi' | 'mengikuti';
  onFeedTypeChange: (type: 'inspirasi' | 'mengikuti') => void;
}

const VideoCard = ({ video, isActive, onLike, onSave, onComment, onShare, onRecipe, feedType, onFeedTypeChange }: VideoCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow(video.user_id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showNutritionTable, setShowNutritionTable] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [volumeIndicatorTimer, setVolumeIndicatorTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  
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

  const handleVideoClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    // Don't trigger click if it was a long press
    if (hideUI) {
      return;
    }
    
    console.log('Video clicked!', { isVideo, isPlaying, hasVideoRef: !!videoRef.current });
    
    if (videoRef.current && isVideo) {
      if (isPlaying) {
        console.log('Pausing video');
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Playing video');
        videoRef.current.muted = false;
        videoRef.current.play().catch(err => console.error('Play error:', err));
        setIsPlaying(true);
      }
    }
  };

  let isLongPress = false;

  const handleTouchStart = (e: React.TouchEvent) => {
    isLongPress = false;
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartX(touch.clientX);
    
    const timer = setTimeout(() => {
      isLongPress = true;
      setHideUI(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isVideo || touchStartY === null || touchStartX === null) return;
    
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Check if swipe started on the right side of the screen (right 30%)
    if (touchStartX > screenWidth * 0.7) {
      e.preventDefault();
      
      const deltaY = touchStartY - touch.clientY;
      const swipeDistance = deltaY / (screenHeight * 0.5); // Normalize to 0-1 range
      
      // Update volume based on swipe
      let newVolume = volume + swipeDistance * 0.5;
      newVolume = Math.max(0, Math.min(1, newVolume));
      
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }
      
      // Show volume indicator
      setShowVolumeIndicator(true);
      
      // Clear existing timer
      if (volumeIndicatorTimer) {
        clearTimeout(volumeIndicatorTimer);
      }
      
      // Hide volume indicator after 1.5 seconds
      const timer = setTimeout(() => {
        setShowVolumeIndicator(false);
      }, 1500);
      setVolumeIndicatorTimer(timer);
      
      // Reset touch start position for continuous adjustment
      setTouchStartY(touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    setTouchStartY(null);
    setTouchStartX(null);
    
    if (isLongPress) {
      setHideUI(false);
      e.preventDefault();
      e.stopPropagation();
    } else if (touchStartX && touchStartX <= window.innerWidth * 0.7) {
      // Short tap on left/center area - toggle play/pause
      handleVideoClick(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isLongPress = false;
    const timer = setTimeout(() => {
      isLongPress = true;
      setHideUI(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (isLongPress) {
      setHideUI(false);
    }
  };

  useEffect(() => {
    if (videoRef.current && isActive && isVideo) {
      // Autoplay when video comes into view
      videoRef.current.muted = false;
      videoRef.current.volume = volume;
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
  }, [isActive, isVideo, volume]);

  return (
    <div className="video-container relative h-screen w-full">
      {/* Top overlay with Tabs - Hide for AI scan posts */}
      {!hideUI && !video.nutritional_info && (
        <div className="absolute top-0 left-0 right-0 z-40">
          {/* Feed Type Tabs */}
          <div className="bg-gradient-to-b from-black/60 to-transparent pt-3 pb-6">
            <div className="flex items-center justify-center px-4">
              <div className="flex items-center gap-6">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Inspirasi button clicked');
                    onFeedTypeChange('inspirasi');
                  }}
                  className={`font-semibold text-base font-poppins pb-1 cursor-pointer ${
                    feedType === 'inspirasi' 
                      ? 'text-white border-b-2 border-white' 
                      : 'text-white/70'
                  }`}
                >
                  Inspirasi
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mengikuti button clicked');
                    onFeedTypeChange('mengikuti');
                  }}
                  className={`font-semibold text-base font-poppins pb-1 cursor-pointer ${
                    feedType === 'mengikuti' 
                      ? 'text-white border-b-2 border-white' 
                      : 'text-white/70'
                  }`}
                >
                  Mengikuti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Content - Direct click handler without interference */}
      {isVideo ? (
        <div 
          className="absolute inset-0 z-10" 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              setLongPressTimer(null);
            }
            setHideUI(false);
          }}
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
          
          {/* Volume Indicator */}
          {showVolumeIndicator && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 animate-fade-in pointer-events-none z-50">
              <div className="bg-black/70 backdrop-blur-sm rounded-full p-3">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="h-48 w-12 bg-black/70 backdrop-blur-sm rounded-full p-2 flex flex-col justify-end">
                <div 
                  className="w-full bg-primary rounded-full transition-all duration-100"
                  style={{ height: `${volume * 100}%` }}
                />
              </div>
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="absolute inset-0 z-10"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              setLongPressTimer(null);
            }
            setHideUI(false);
          }}
        >
          {video.nutritional_info ? (
            // AI Scan Post Layout
            <div className="absolute inset-0 bg-[#F5F1E8] overflow-y-auto">
              <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Hasil Analisis</h2>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Close functionality can be added here
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Food Image with Overlays */}
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={video.thumbnail_url || video.video_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'}
                    alt={video.title}
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Total Calories Badge */}
                  <div className="absolute top-4 left-4 bg-[#0F4C3A] text-white px-4 py-2 rounded-xl shadow-lg">
                    <p className="text-xs font-medium">Total Kalori</p>
                    <p className="text-2xl font-bold">{video.nutritional_info.totalCalories} kal</p>
                  </div>
                  
                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNutritionTable(!showNutritionTable);
                    }}
                    className="absolute bottom-4 left-4 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2.5 rounded-full shadow-lg transition-all border-2 border-gray-300 flex items-center gap-2 font-medium"
                  >
                    <Tag className="w-5 h-5" />
                    <span className="text-sm">View Details</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Save photo functionality
                      const link = document.createElement('a');
                      link.href = video.thumbnail_url || video.video_url || '';
                      link.download = `${video.title}.jpg`;
                      link.click();
                    }}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-xl shadow-md transition-all border-2 border-gray-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    <span>Save Photo</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Post functionality - could trigger a modal or action
                    }}
                    className="flex-1 bg-[#0F4C3A] hover:bg-[#0D3F2F] text-white px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center font-medium"
                  >
                    Post
                  </button>
                </div>

                {/* Ingredient Breakdown */}
                <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ingredient Breakdown</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold text-gray-900">Ingredient</th>
                          <th className="text-center p-3 text-sm font-semibold text-gray-900">Amount</th>
                          <th className="text-center p-3 text-sm font-semibold text-gray-900">Calories</th>
                          <th className="text-center p-3 text-sm font-semibold text-gray-900">Protein</th>
                        </tr>
                      </thead>
                      <tbody>
                        {video.nutritional_info.items?.map((item: any, index: number) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="p-3 text-sm text-gray-900 capitalize">{item.name}</td>
                            <td className="p-3 text-sm text-gray-700 text-center">{item.amount}</td>
                            <td className="p-3 text-sm text-gray-900 text-center font-semibold">{item.calories}</td>
                            <td className="p-3 text-sm text-gray-700 text-center">{item.protein}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Regular Photo Post Layout
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <img 
                src={video.thumbnail_url || video.video_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'}
                alt={video.title}
                className="max-w-full max-h-full object-contain"
              />
              <div className="video-overlay" />
            </div>
          )}
        </div>
      )}

      {/* Middle Area - Removed duplicate play button, now handled in video overlay */}

      {/* Bottom Information - Hide for AI scan posts */}
      {!hideUI && !video.nutritional_info && (
        <div className="absolute bottom-20 left-0 right-0 px-4 pb-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-30">
          <div className="flex items-end justify-between">
            {/* Left side - User info and caption */}
            <div className="flex-1 pr-4 space-y-2">
              {/* Username and Badge */}
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleUserClick}
              >
                <span className="text-white font-semibold font-poppins">
                  {video.profiles?.display_name || 'Anonymous'}
                </span>
                <Badge className="bg-warning text-black px-2 py-0.5 text-xs font-semibold">
                  UMKM
                </Badge>
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

            {/* Right side - Profile and Action buttons */}
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Avatar */}
              <div 
                className="relative cursor-pointer"
                onClick={handleUserClick}
              >
                <Avatar className="w-12 h-12 border-2 border-white rounded-xl">
                  <AvatarImage src={video.profiles?.avatar_url || ''} alt={video.profiles?.display_name || 'User'} className="rounded-xl" />
                  <AvatarFallback className="bg-primary text-white font-bold rounded-xl">
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

              {/* Recipe Button - Square with Fillet and Green Background */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRecipe(video)}
                  className="w-14 h-14 rounded-xl bg-primary text-white hover:scale-110 hover:bg-primary/90 shadow-elevated transition-fast active:scale-95"
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
  const [feedType, setFeedType] = useState<'inspirasi' | 'mengikuti'>('inspirasi');
  const { videos, loading, toggleLike, toggleSave } = useVideos(feedType);
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset current index when feed type changes
  useEffect(() => {
    console.log('Feed type changed to:', feedType);
    setCurrentIndex(0);
  }, [feedType]);

  const handleFeedTypeChange = (newType: 'inspirasi' | 'mengikuti') => {
    console.log('Changing feed type from', feedType, 'to', newType);
    setFeedType(newType);
  };
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
  const [recipeModal, setRecipeModal] = useState<{isOpen: boolean, recipe: any}>({
    isOpen: false,
    recipe: null
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

  const handleRecipe = (video: Video) => {
    console.log('handleRecipe called', video);
    setRecipeModal({
      isOpen: true,
      recipe: {
        title: video.title,
        username: video.profiles?.display_name || "User",
        priceRange: video.budget || "0k - 20k",
        ingredients: [
          "2 butir telur",
          "100ml susu cair",
          "2 sdm gula pasir",
          "1 sdt vanilla extract",
          "50g mentega, lelehkan"
        ],
        instructions: [
          "Kocok telur dan gula hingga mengembang",
          "Tambahkan susu cair dan vanilla extract, aduk rata",
          "Masukkan mentega leleh, aduk hingga tercampur sempurna",
          "Panaskan wajan dengan api sedang",
          "Tuang adonan, masak hingga bagian bawah berwarna kecoklatan",
          "Balik dan masak sisi lainnya hingga matang"
        ]
      }
    });
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
          <h3 className="text-xl font-semibold mb-2">
            {feedType === 'mengikuti' ? 'Belum ada video dari teman yang kamu ikuti' : 'Tidak ada video tersedia'}
          </h3>
          <p className="text-gray-300">
            {feedType === 'mengikuti' ? 'Follow teman untuk melihat video mereka' : 'Be the first to upload a video!'}
          </p>
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
            onRecipe={handleRecipe}
            feedType={feedType}
            onFeedTypeChange={handleFeedTypeChange}
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

      <RecipeModal
        isOpen={recipeModal.isOpen}
        onClose={() => setRecipeModal({ isOpen: false, recipe: null })}
        recipe={recipeModal.recipe || {
          title: "",
          username: "",
          priceRange: "",
          ingredients: [],
          instructions: []
        }}
      />
    </div>
  );
};

export default VideoFeed;
import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoData {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  budget: string;
  cookingTime: string;
}

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
}

const VideoCard = ({ video, isActive }: VideoCardProps) => {
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isSaved, setIsSaved] = useState(video.isSaved);
  const [likes, setLikes] = useState(video.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="video-container">
      {/* Video Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
      >
        <div className="video-overlay" />
      </div>
      
      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="w-20 h-20 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/40"
        >
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </Button>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex">
        {/* Left Side - Content Info */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-20">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={video.user.avatar}
              alt={video.user.username}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <h3 className="text-white font-semibold text-lg">@{video.user.username}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-white text-sm mb-3 leading-relaxed max-w-xs">
            {video.description}
          </p>

          {/* Tags and Info */}
          <div className="flex flex-wrap gap-2 mb-2">
            {video.tags.map((tag, index) => (
              <span key={index} className="category-pill">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex space-x-4 text-white text-xs">
            <span className="category-pill">💰 {video.budget}</span>
            <span className="category-pill">⏱️ {video.cookingTime}</span>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="w-20 flex flex-col justify-end pb-20 pr-4 space-y-6">
          {/* Like Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`w-12 h-12 rounded-full border transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-500 border-red-500 text-white' 
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:scale-110'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <span className="text-xs text-white font-medium">{likes}</span>
          </div>

          {/* Comment Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:scale-110"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-xs text-white font-medium">{video.comments}</span>
          </div>

          {/* Save Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={`w-12 h-12 rounded-full border transition-all duration-300 ${
                isSaved 
                  ? 'bg-yellow-500 border-yellow-500 text-white' 
                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:scale-110'
              }`}
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Share Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:scale-110"
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>

          {/* More Button */}
          <div className="tiktok-action">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:scale-110"
            >
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoFeed = () => {
  // Mock data for demonstration
  const mockVideos: VideoData[] = [
    {
      id: '1',
      user: {
        username: 'chef_maya',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      },
      description: 'Nasi goreng kambing yang super enak! Recipe rahasia dari warung legendaris di Jakarta. Wajib coba guys! 🔥',
      videoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      likes: 24500,
      comments: 1240,
      isLiked: false,
      isSaved: false,
      tags: ['nasgor', 'kambing', 'jakarta', 'hidden_gem'],
      budget: 'Rp 25k',
      cookingTime: '15 menit'
    },
    {
      id: '2',
      user: {
        username: 'foodie_rina',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
      description: 'Martabak manis dengan topping coklat keju! Resep mudah yang bisa dicoba di rumah 😍',
      videoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      likes: 18300,
      comments: 892,
      isLiked: true,
      isSaved: false,
      tags: ['martabak', 'dessert', 'coklat', 'keju'],
      budget: 'Rp 15k',
      cookingTime: '20 menit'
    },
    {
      id: '3',
      user: {
        username: 'warung_pak_budi',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
      description: 'Sate ayam madura asli! Bumbu kacang secret recipe turun temurun. Lokasi di Malang guys!',
      videoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      likes: 32100,
      comments: 2150,
      isLiked: false,
      isSaved: true,
      tags: ['sate', 'ayam', 'madura', 'malang'],
      budget: 'Rp 20k',
      cookingTime: '30 menit'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative h-screen overflow-hidden">
      {mockVideos.map((video, index) => (
        <div
          key={video.id}
          className={`absolute inset-0 transition-transform duration-300 ${
            index === currentIndex ? 'translate-y-0' : 
            index < currentIndex ? '-translate-y-full' : 'translate-y-full'
          }`}
        >
          <VideoCard video={video} isActive={index === currentIndex} />
        </div>
      ))}
      
      {/* Swipe Handlers */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="h-1/2 pointer-events-auto"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
        />
        <div 
          className="h-1/2 pointer-events-auto"
          onClick={() => setCurrentIndex(Math.min(mockVideos.length - 1, currentIndex + 1))}
        />
      </div>
    </div>
  );
};

export default VideoFeed;
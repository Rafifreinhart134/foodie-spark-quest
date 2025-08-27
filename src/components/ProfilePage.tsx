import { useState } from 'react';
import { Settings, LogOut, Award, Gift, Heart, Play, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('videos');

  const userProfile = {
    username: 'chef_maya',
    displayName: 'Maya Chef',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
    bio: 'Sharing delicious Indonesian recipes 🇮🇩 Professional chef & food enthusiast',
    followers: 125000,
    following: 89,
    videosCount: 156,
    likesCount: 2400000,
    coinsBalance: 12500,
    level: 'Master Chef',
    badges: [
      { id: '1', name: 'Master Chef', icon: '👨‍🍳', description: 'Upload 50+ resep' },
      { id: '2', name: 'Viral Creator', icon: '🔥', description: '1M+ total views' },
      { id: '3', name: 'Hidden Gem Hunter', icon: '💎', description: 'Share 25+ hidden gems' },
    ]
  };

  const userVideos = [
    {
      id: '1',
      thumbnail: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300',
      title: 'Nasi Goreng Kambing Special',
      views: 245000,
      likes: 18500,
      duration: '2:34'
    },
    {
      id: '2',
      thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
      title: 'Martabak Manis Coklat Keju',
      views: 183000,
      likes: 12400,
      duration: '3:12'
    },
    {
      id: '3',
      thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
      title: 'Sate Ayam Madura Asli',
      views: 321000,
      likes: 24800,
      duration: '4:45'
    },
  ];

  const savedVideos = [
    {
      id: '4',
      thumbnail: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300',
      title: 'Bakso Solo Legendaris',
      creator: '@warung_solo',
      views: 156000
    },
    {
      id: '5',
      thumbnail: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300',
      title: 'Gudeg Jogja Authentic',
      creator: '@jogja_food',
      views: 89000
    },
  ];

  const availableVouchers = [
    {
      id: '1',
      title: 'Gojek Food Discount',
      discount: '25%',
      minOrder: 'Min. order Rp 50k',
      validUntil: '30 Dec 2024',
      coinCost: 5000,
      logo: '🍔'
    },
    {
      id: '2',
      title: 'Starbucks Voucher',
      discount: 'Rp 25k',
      minOrder: 'Min. order Rp 100k',
      validUntil: '31 Dec 2024',
      coinCost: 8000,
      logo: '☕'
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Profile Header */}
      <div className="bg-white">
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-32 gradient-primary"></div>
          
          {/* Profile info */}
          <div className="px-4 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold">{userProfile.displayName}</h1>
                    <p className="text-muted-foreground">@{userProfile.username}</p>
                  </div>
                  <Button variant="outline" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm mb-4">{userProfile.bio}</p>

            {/* Stats */}
            <div className="flex justify-around py-4 border-t border-b">
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(userProfile.followers)}</p>
                <p className="text-muted-foreground text-sm">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userProfile.following}</p>
                <p className="text-muted-foreground text-sm">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{userProfile.videosCount}</p>
                <p className="text-muted-foreground text-sm">Videos</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{formatNumber(userProfile.likesCount)}</p>
                <p className="text-muted-foreground text-sm">Likes</p>
              </div>
            </div>

            {/* Coins & Level */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <span className="text-yellow-500 mr-1">🪙</span>
                  <span className="font-semibold text-yellow-700">{userProfile.coinsBalance.toLocaleString()}</span>
                </div>
                <Badge className="gradient-golden text-food-brown">
                  {userProfile.level}
                </Badge>
              </div>
              <Button variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos" className="text-xs">
              <Video className="w-4 h-4 mr-1" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">
              <Heart className="w-4 h-4 mr-1" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">
              <Award className="w-4 h-4 mr-1" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="text-xs">
              <Gift className="w-4 h-4 mr-1" />
              Vouchers
            </TabsTrigger>
          </TabsList>

          {/* My Videos */}
          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {userVideos.map((video) => (
                <div key={video.id} className="aspect-video relative group">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/40 transition-all">
                    <div className="absolute bottom-2 left-2 text-white text-xs">
                      <div className="flex items-center space-x-1 mb-1">
                        <Play className="w-3 h-3" />
                        <span>{formatNumber(video.views)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{formatNumber(video.likes)}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Saved Videos */}
          <TabsContent value="saved" className="mt-4">
            <div className="space-y-3">
              {savedVideos.map((video) => (
                <Card key={video.id} className="p-3">
                  <div className="flex space-x-3">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{video.title}</h4>
                      <p className="text-sm text-muted-foreground">{video.creator}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(video.views)} views</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {userProfile.badges.map((badge) => (
                <Card key={badge.id} className="p-4 text-center">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vouchers */}
          <TabsContent value="vouchers" className="mt-4">
            <div className="space-y-4">
              {availableVouchers.map((voucher) => (
                <Card key={voucher.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                        {voucher.logo}
                      </div>
                      <div>
                        <h4 className="font-semibold">{voucher.title}</h4>
                        <p className="text-sm text-primary font-medium">{voucher.discount}</p>
                        <p className="text-xs text-muted-foreground">{voucher.minOrder}</p>
                        <p className="text-xs text-muted-foreground">Valid until {voucher.validUntil}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button 
                        size="sm" 
                        className="gradient-primary text-white"
                        disabled={userProfile.coinsBalance < voucher.coinCost}
                      >
                        <span className="text-yellow-300 mr-1">🪙</span>
                        {voucher.coinCost.toLocaleString()}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
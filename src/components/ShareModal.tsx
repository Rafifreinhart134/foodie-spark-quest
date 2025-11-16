import { useState } from 'react';
import { Download, Repeat2, EyeOff, Flag, Languages, Facebook, Twitter, Instagram, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

export const ShareModal = ({ isOpen, onClose, videoId, videoTitle }: ShareModalProps) => {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/video/${videoId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Video link has been copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedTitle = encodeURIComponent(videoTitle);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  // Dummy friends data
  const friends = [
    { id: '1', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: '2', name: 'John', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: '3', name: 'Emma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { id: '4', name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Bagikan ke</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Top Action Buttons */}
          <div className="grid grid-cols-5 gap-2">
            <Button variant="ghost" className="flex flex-col items-center h-auto py-3 px-2">
              <Download className="w-6 h-6 mb-1" />
              <span className="text-xs">Download</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-auto py-3 px-2">
              <Repeat2 className="w-6 h-6 mb-1" />
              <span className="text-xs">Posting ulang</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-auto py-3 px-2">
              <EyeOff className="w-6 h-6 mb-1" />
              <span className="text-xs">Tidak tertarik</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-auto py-3 px-2">
              <Flag className="w-6 h-6 mb-1" />
              <span className="text-xs">Laporkan</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-auto py-3 px-2">
              <Languages className="w-6 h-6 mb-1" />
              <span className="text-xs">Terjemahan</span>
            </Button>
          </div>

          <Separator />

          {/* Friends Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Kirim ke teman</h3>
            <div className="grid grid-cols-4 gap-3">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-center line-clamp-1">{friend.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Social Media Apps */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Bagikan ke aplikasi</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
                disabled
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <Instagram className="w-7 h-7 text-pink-600" />
                </div>
                <span className="text-xs text-center">Instagram</span>
              </button>
              
              <button
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={() => toast({ title: "TikTok", description: "Fitur akan segera hadir" })}
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <div className="w-7 h-7 bg-black rounded-full" />
                </div>
                <span className="text-xs text-center">TikTok</span>
              </button>

              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <MessageCircle className="w-7 h-7 text-green-600" />
                </div>
                <span className="text-xs text-center">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <Facebook className="w-7 h-7 text-blue-600" />
                </div>
                <span className="text-xs text-center">Facebook</span>
              </button>

              <button
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={() => toast({ title: "Telegram", description: "Fitur akan segera hadir" })}
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <Send className="w-7 h-7 text-blue-500" />
                </div>
                <span className="text-xs text-center">Telegram</span>
              </button>

              <button
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={() => toast({ title: "WeChat", description: "Fitur akan segera hadir" })}
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <MessageCircle className="w-7 h-7 text-green-500" />
                </div>
                <span className="text-xs text-center">WeChat</span>
              </button>
              
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center bg-background">
                  <Twitter className="w-7 h-7 text-blue-400" />
                </div>
                <span className="text-xs text-center">Twitter</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
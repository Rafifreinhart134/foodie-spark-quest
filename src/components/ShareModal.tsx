import { useState } from 'react';
import { Copy, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full justify-start"
          >
            <Copy className="w-5 h-5 mr-3" />
            Copy Link
          </Button>

          {/* Social Media Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => shareToSocial('whatsapp')}
              variant="outline"
              className="justify-start"
            >
              <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
              WhatsApp
            </Button>
            
            <Button
              onClick={() => shareToSocial('facebook')}
              variant="outline"
              className="justify-start"
            >
              <Facebook className="w-5 h-5 mr-2 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              onClick={() => shareToSocial('twitter')}
              variant="outline"
              className="justify-start"
            >
              <Twitter className="w-5 h-5 mr-2 text-blue-400" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              disabled
            >
              <Instagram className="w-5 h-5 mr-2 text-pink-600" />
              Instagram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
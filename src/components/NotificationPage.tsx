import { Heart, MessageCircle, UserPlus, Award, Gift, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ContentDetailModal from './ContentDetailModal';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'badge' | 'voucher';
  user?: {
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  isRead: boolean;
  thumbnail?: string;
  badge?: {
    name: string;
    icon: string;
  };
  voucher?: {
    title: string;
    discount: string;
  };
}

const NotificationPage = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'badge':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'voucher':
        return <Gift className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'like':
        return 'Like';
      case 'comment':
        return 'Comment';
      case 'follow':
        return 'Follow';
      case 'badge':
        return 'Badge';
      case 'voucher':
        return 'Voucher';
      default:
        return 'Update';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.related_video_id) {
      // Fetch video details and open modal
      try {
        const { data: video } = await supabase
          .from('videos')
          .select(`
            *,
            profiles (display_name, avatar_url)
          `)
          .eq('id', notification.related_video_id)
          .single();

        if (video) {
          setSelectedContent(video);
          setIsContentModalOpen(true);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Notifikasi
          </h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark All Read
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">Update terbaru untuk kamu</p>
        {unreadCount > 0 && (
          <p className="text-sm text-primary mt-1">{unreadCount} notifikasi belum dibaca</p>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum ada notifikasi</h3>
            <p className="text-muted-foreground text-sm">
              Notifikasi akan muncul ketika ada aktivitas di konten kamu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                  !notification.is_read 
                    ? 'bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    !notification.is_read ? 'bg-primary' : 'bg-muted'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <span className="text-xs text-muted-foreground">
                        {getNotificationTypeText(notification.type)}
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${
                      !notification.is_read 
                        ? 'font-medium text-foreground' 
                        : 'text-muted-foreground'
                    }`}>
                      {notification.content}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Content Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          isOpen={isContentModalOpen}
          onClose={() => {
            setIsContentModalOpen(false);
            setSelectedContent(null);
          }}
          content={selectedContent}
          onLike={() => {}}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default NotificationPage;
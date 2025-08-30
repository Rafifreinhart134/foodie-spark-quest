import { useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Award, Gift, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'badge':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'voucher':
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
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
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              Notifikasi
            </h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground">
                {unreadCount} notifikasi belum dibaca
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
            >
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.map((notification) => (
          <Card 
            key={notification.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-card ${
              !notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex space-x-3">
              {/* Icon or User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className={notification.is_read ? 'text-muted-foreground' : ''}>
                        {notification.content}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                  </div>
                </div>
              </div>

              {/* Unread indicator */}
              {!notification.is_read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state if no notifications */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada notifikasi</h3>
          <p className="text-muted-foreground text-center">
            Notifikasi akan muncul ketika ada yang menyukai atau berkomentar di video kamu
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
import { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Award, Gift, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'like',
      user: {
        username: 'chef_maya',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
      },
      message: 'menyukai video kamu "Nasi Goreng Kambing"',
      timestamp: '2 menit lalu',
      isRead: false,
      thumbnail: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=100'
    },
    {
      id: '2',
      type: 'comment',
      user: {
        username: 'foodie_rina',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      message: 'berkomentar: "Wah enak banget nih! Boleh share resepnya?"',
      timestamp: '15 menit lalu',
      isRead: false,
      thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100'
    },
    {
      id: '3',
      type: 'follow',
      user: {
        username: 'warung_pak_budi',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      message: 'mulai mengikuti kamu',
      timestamp: '1 jam lalu',
      isRead: false
    },
    {
      id: '4',
      type: 'badge',
      message: 'Selamat! Kamu mendapat badge "Master Chef" karena telah upload 50 resep',
      timestamp: '3 jam lalu',
      isRead: true,
      badge: {
        name: 'Master Chef',
        icon: '👨‍🍳'
      }
    },
    {
      id: '5',
      type: 'voucher',
      message: 'Kamu mendapat voucher diskon 25% untuk Gojek Food!',
      timestamp: '1 hari lalu',
      isRead: true,
      voucher: {
        title: 'Gojek Food Discount',
        discount: '25%'
      }
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex space-x-3">
              {/* Icon or User Avatar */}
              <div className="flex-shrink-0">
                {notification.user ? (
                  <div className="relative">
                    <img
                      src={notification.user.avatar}
                      alt={notification.user.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {notification.type === 'badge' && notification.badge ? (
                      <span className="text-2xl">{notification.badge.icon}</span>
                    ) : (
                      getNotificationIcon(notification.type)
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      {notification.user && (
                        <span className="font-semibold">@{notification.user.username} </span>
                      )}
                      <span className={notification.isRead ? 'text-muted-foreground' : ''}>
                        {notification.message}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp}
                    </p>

                    {/* Special content for badge/voucher */}
                    {notification.badge && (
                      <div className="mt-2">
                        <Badge className="gradient-golden text-food-brown">
                          {notification.badge.icon} {notification.badge.name}
                        </Badge>
                      </div>
                    )}

                    {notification.voucher && (
                      <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-5 h-5 text-purple-500" />
                          <span className="font-medium text-purple-700">
                            {notification.voucher.title}
                          </span>
                        </div>
                        <p className="text-sm text-purple-600 mt-1">
                          Diskon {notification.voucher.discount}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  {notification.thumbnail && (
                    <img
                      src={notification.thumbnail}
                      alt="Video thumbnail"
                      className="w-12 h-12 rounded-lg object-cover ml-3"
                    />
                  )}
                </div>
              </div>

              {/* Unread indicator */}
              {!notification.isRead && (
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
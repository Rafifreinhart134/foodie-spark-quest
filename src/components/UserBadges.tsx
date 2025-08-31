import { useState, useEffect } from 'react';
import { Award, Star, Trophy, Crown, Zap, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Badge {
  id: string;
  badge_type: string;
  awarded_at: string;
}

interface UserBadgesProps {
  userId: string;
}

const UserBadges = ({ userId }: UserBadgesProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBadges();
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'first_upload':
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 'first_like':
        return <Heart className="w-8 h-8 text-red-500" />;
      case 'trending':
        return <Zap className="w-8 h-8 text-blue-500" />;
      case 'top_chef':
        return <Crown className="w-8 h-8 text-purple-500" />;
      case 'content_creator':
        return <Trophy className="w-8 h-8 text-gold-500" />;
      default:
        return <Award className="w-8 h-8 text-primary" />;
    }
  };

  const getBadgeName = (badgeType: string) => {
    switch (badgeType) {
      case 'first_upload':
        return 'First Upload';
      case 'first_like':
        return 'First Like';
      case 'trending':
        return 'Trending';
      case 'top_chef':
        return 'Top Chef';
      case 'content_creator':
        return 'Content Creator';
      default:
        return 'Achievement';
    }
  };

  const getBadgeDescription = (badgeType: string) => {
    switch (badgeType) {
      case 'first_upload':
        return 'Uploaded first content';
      case 'first_like':
        return 'Received first like';
      case 'trending':
        return 'Content went trending';
      case 'top_chef':
        return 'Top cooking creator';
      case 'content_creator':
        return 'Active content creator';
      default:
        return 'Special achievement';
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading badges...</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="p-4 text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
        <p className="text-muted-foreground text-sm">
          Keep creating content to earn badges!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className="p-4 text-center hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center space-y-2">
              {getBadgeIcon(badge.badge_type)}
              <h3 className="font-semibold text-sm">{getBadgeName(badge.badge_type)}</h3>
              <p className="text-xs text-muted-foreground">{getBadgeDescription(badge.badge_type)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(badge.awarded_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserBadges;
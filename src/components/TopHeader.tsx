import { useState } from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

interface TopHeaderProps {
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
}

const TopHeader = ({ onSearchClick, onNotificationClick }: TopHeaderProps) => {
  const {
    signOut
  } = useAuth();
  const [notificationCount] = useState(3);
  return <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm text-zinc-50 font-bold">C</span>
          </div>
          <h1 className="font-dancing text-2xl font-bold gradient-primary bg-clip-text text-slate-800">Cofre</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={signOut} title="Sign out">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>;
};
export default TopHeader;
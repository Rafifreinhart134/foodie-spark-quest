import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TopHeader = () => {
  const [notificationCount] = useState(3);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <h1 className="font-dancing text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            FoodieApp
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs p-0"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
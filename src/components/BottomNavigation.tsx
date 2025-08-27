import { useState } from 'react';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'upload', icon: Plus, label: 'Upload', isSpecial: true },
    { id: 'notifications', icon: Bell, label: 'Notif' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''} ${
              item.isSpecial ? 'relative' : ''
            }`}
          >
            {item.isSpecial ? (
              <div className="w-12 h-12 rounded-full gradient-primary shadow-glow flex items-center justify-center">
                <item.icon className="w-6 h-6 text-white" />
              </div>
            ) : (
              <>
                <item.icon className={`nav-icon ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`nav-label ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
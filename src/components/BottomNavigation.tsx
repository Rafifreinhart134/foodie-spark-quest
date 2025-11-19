import { useState } from 'react';
import { Home, Bookmark, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'upload', icon: Plus, label: 'Upload', isSpecial: true },
    { id: 'saved', icon: Bookmark, label: 'Simpan' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
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
              <div className="w-12 h-12 rounded-full border-[2.5px] border-muted-foreground/40 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-muted-foreground" />
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
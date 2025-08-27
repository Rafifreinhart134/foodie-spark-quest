import { useState } from 'react';
import VideoFeed from '@/components/VideoFeed';
import SearchPage from '@/components/SearchPage';
import UploadPage from '@/components/UploadPage';
import NotificationPage from '@/components/NotificationPage';
import ProfilePage from '@/components/ProfilePage';
import BottomNavigation from '@/components/BottomNavigation';
import TopHeader from '@/components/TopHeader';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <VideoFeed />;
      case 'search':
        return <SearchPage />;
      case 'upload':
        return <UploadPage />;
      case 'notifications':
        return <NotificationPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <VideoFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Only show header for non-video pages */}
      {activeTab !== 'home' && <TopHeader />}
      
      {/* Main Content */}
      <main className="relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
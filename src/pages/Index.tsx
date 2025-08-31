import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import VideoFeed from '@/components/VideoFeed';
import SearchPage from '@/components/SearchPage';
import UploadPage from '@/components/UploadPage';
import NotificationPage from '@/components/NotificationPage';
import ProfilePage from '@/components/ProfilePage';
import UserProfilePage from '@/components/UserProfilePage';
import SettingsPage from '@/components/SettingsPage';
import BottomNavigation from '@/components/BottomNavigation';
import TopHeader from '@/components/TopHeader';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { userId } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Check if we're on a profile route
    if (location.pathname.startsWith('/profile/')) {
      setActiveTab('profile-view');
    } else {
      setActiveTab('home');
    }
  }, [location]);

  const renderContent = () => {
    // Handle profile routes
    if (location.pathname.startsWith('/profile/') && userId) {
      return <UserProfilePage />;
    }

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
        return <ProfilePage onNavigateToSettings={() => setActiveTab('settings')} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <VideoFeed />;
    }
  };

  const shouldShowHeader = activeTab !== 'home' && !location.pathname.startsWith('/profile/');
  const shouldShowBottomNav = !location.pathname.startsWith('/profile/');

  return (
    <div className="min-h-screen bg-background">
      {/* Only show header for non-video pages and non-profile pages */}
      {shouldShowHeader && <TopHeader />}
      
      {/* Main Content */}
      <main className="relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation - hide on profile pages */}
      {shouldShowBottomNav && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default Index;
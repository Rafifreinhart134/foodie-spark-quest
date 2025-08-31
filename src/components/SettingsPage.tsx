import { useState } from 'react';
import { LogOut, Moon, Sun, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time! 👋",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast({
      title: "Theme changed",
      description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode`,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <Settings className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola akun dan preferensi kamu</p>
        </div>

        {/* Account Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Akun
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            {isDarkMode ? (
              <Moon className="w-5 h-5 mr-2 text-primary" />
            ) : (
              <Sun className="w-5 h-5 mr-2 text-primary" />
            )}
            Tampilan
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mode Gelap</p>
              <p className="text-sm text-muted-foreground">
                Ubah tema aplikasi
              </p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>
        </Card>


        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>FoodTok v1.0.0</p>
          <p>Made with ❤️ for food lovers</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
import { useState, useEffect } from 'react';
import { Camera, Check, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface OnboardingPageProps {
  onComplete: () => void;
}

const OnboardingPage = ({ onComplete }: OnboardingPageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('display_name', username)
          .single();

        if (error && error.code === 'PGRST116') {
          // No rows found - username is available
          setIsUsernameAvailable(true);
        } else if (data) {
          // Username already exists
          setIsUsernameAvailable(false);
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (!user || !isUsernameAvailable) return;

    setIsUploading(true);

    try {
      let avatarUrl = null;

      // Upload avatar if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Update profile with username and avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: username,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Profil berhasil dibuat!",
        description: "Selamat datang di FoodTok! 🎉",
      });

      onComplete();

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Gagal menyelesaikan pendaftaran",
        description: error.message || "Terjadi kesalahan saat menyimpan profil",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-card">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Selamat Datang!</h1>
              <p className="text-muted-foreground">Ayo lengkapi profil kamu</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <Input
                  placeholder="Masukkan username unik..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCheckingUsername && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  )}
                  {!isCheckingUsername && isUsernameAvailable === true && (
                    <Check className="w-4 h-4 text-success" />
                  )}
                  {!isCheckingUsername && isUsernameAvailable === false && (
                    <X className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>
              {username.length > 0 && username.length < 3 && (
                <p className="text-xs text-muted-foreground mt-1">Username minimal 3 karakter</p>
              )}
              {isUsernameAvailable === false && (
                <p className="text-xs text-destructive mt-1">Username sudah digunakan</p>
              )}
              {isUsernameAvailable === true && (
                <p className="text-xs text-success mt-1">Username tersedia!</p>
              )}
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!isUsernameAvailable || isCheckingUsername}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Lanjutkan
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-card">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Foto Profil</h1>
            <p className="text-muted-foreground">Pilih foto profil (opsional)</p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarImage src={avatarPreview || undefined} />
            <AvatarFallback className="bg-accent text-accent-foreground text-xl">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
          />
          
          <Button
            variant="outline"
            asChild
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <label htmlFor="avatar-upload" className="cursor-pointer flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>{selectedFile ? 'Ganti Foto' : 'Pilih Foto'}</span>
            </label>
          </Button>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleComplete}
            disabled={isUploading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isUploading ? 'Menyimpan...' : 'Selesaikan Pendaftaran'}
          </Button>
          
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            className="w-full"
            disabled={isUploading}
          >
            Kembali
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingPage;
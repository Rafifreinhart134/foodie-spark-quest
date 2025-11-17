import { useState, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { profileUpdateSchema } from '@/lib/validations';
import { z } from 'zod';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: (updatedProfile: any) => void;
}

const ProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdate }: ProfileEditModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    // Check username availability with debounce
    const timeoutId = setTimeout(async () => {
      if (displayName && displayName !== profile?.display_name) {
        await checkUsernameAvailability(displayName);
      } else if (displayName === profile?.display_name) {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [displayName, profile?.display_name]);

  const checkUsernameAvailability = async (username: string) => {
    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('display_name', username)
        .neq('user_id', user?.id);

      if (error) throw error;

      setUsernameAvailable(data.length === 0);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;

    if (displayName !== profile?.display_name && usernameAvailable === false) {
      toast({
        title: "Username not available",
        description: "Please choose a different username",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          ...(avatarUrl && { avatar_url: avatarUrl })
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      onClose();

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully",
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid input",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        console.error('Error updating profile:', error);
        toast({
          title: "Update failed",
          description: error.message || "Failed to update profile",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameStatus = () => {
    if (isCheckingUsername) {
      return { icon: null, text: "Checking...", color: "text-muted-foreground" };
    }
    if (displayName === profile?.display_name) {
      return { icon: null, text: "", color: "" };
    }
    if (usernameAvailable === true) {
      return { icon: <Check className="w-4 h-4" />, text: "Available", color: "text-green-600" };
    }
    if (usernameAvailable === false) {
      return { icon: <X className="w-4 h-4" />, text: "Not available", color: "text-red-600" };
    }
    return { icon: null, text: "", color: "" };
  };

  const status = getUsernameStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={previewUrl || profile?.avatar_url || '/placeholder.svg'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 rounded-full"
                asChild
              >
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                </label>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Click to change avatar</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <div className="relative">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter username"
                className={`pr-20 ${
                  usernameAvailable === false ? 'border-red-500' : 
                  usernameAvailable === true ? 'border-green-500' : ''
                }`}
              />
              {status.text && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 ${status.color}`}>
                  {status.icon}
                  <span className="text-xs">{status.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/150
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isCheckingUsername || usernameAvailable === false}
              className="flex-1 gradient-primary text-white"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
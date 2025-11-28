import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Play } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { useToast } from '@/hooks/use-toast';

interface StoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryCreateModal = ({ isOpen, onClose }: StoryCreateModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 50MB',
        variant: 'destructive'
      });
      return;
    }

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const duration = mediaType === 'video' ? 15 : 5; // 15s for video, 5s for image
      await createStory(selectedFile, mediaType, duration);
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 flex flex-col gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-2 border-dashed border-primary/30"
                variant="outline"
              >
                <Upload className="w-8 h-8" />
                <span className="font-semibold">Pilih Foto atau Video</span>
                <span className="text-xs opacity-70">Maksimal 50MB</span>
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Story akan hilang setelah 24 jam</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                {mediaType === 'image' ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    src={previewUrl} 
                    className="w-full h-full object-contain"
                    controls
                  />
                )}
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  disabled={uploading}
                >
                  Ganti
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Post Story'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
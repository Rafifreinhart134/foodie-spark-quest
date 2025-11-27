import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, Image as ImageIcon, Tag, Download } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CalorieScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FoodItem {
  name: string;
  amount: string;
  calories: number;
  protein: number;
}

interface ScanResult {
  totalCalories: number;
  items: FoodItem[];
  imageUrl: string;
}

export const CalorieScanModal = ({ isOpen, onClose }: CalorieScanModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleImageSelect = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Call edge function to analyze image
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { image: base64 }
      });

      if (error) throw error;

      setScanResult(data);
      toast.success('Makanan berhasil dianalisis!');
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast.error('Gagal menganalisis makanan. Silakan coba lagi.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleReset = () => {
    setScanResult(null);
    setImagePreview(null);
    setShowLabels(true);
    setShowTable(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSavePhoto = async () => {
    if (!imagePreview || !scanResult || !user) {
      toast.error('Tidak ada foto untuk disimpan');
      return;
    }

    try {
      setIsSaving(true);

      // Upload image to storage
      const fileName = `calorie-scan-${Date.now()}.jpg`;
      const blob = await fetch(imagePreview).then(r => r.blob());
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);

      // Save scan to database
      const { error: insertError } = await supabase
        .from('calorie_scans')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          total_calories: scanResult.totalCalories,
          items: scanResult.items as any,
          is_posted: false
        });

      if (insertError) throw insertError;

      toast.success('Foto berhasil disimpan!');
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('Gagal menyimpan foto');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePost = async () => {
    if (!imagePreview || !scanResult || !user) {
      toast.error('Tidak ada data untuk diposting');
      console.error('Missing data:', { imagePreview: !!imagePreview, scanResult: !!scanResult, user: !!user });
      return;
    }

    try {
      setIsPosting(true);
      console.log('Starting post process...');

      // Upload image to storage
      const fileName = `calorie-scan-${Date.now()}.jpg`;
      const blob = await fetch(imagePreview).then(r => r.blob());
      console.log('Blob created:', blob.size, 'bytes');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      console.log('Upload success:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName);
      
      console.log('Public URL:', publicUrl);

      // Create post as video with tips category
      const videoData = {
        user_id: user.id,
        title: `Scan Kalori - ${scanResult.totalCalories} kal`,
        description: `Total kalori: ${scanResult.totalCalories} kal\n\nBreakdown:\n${scanResult.items.map(item => `• ${item.name}: ${item.calories} kal (${item.amount})`).join('\n')}`,
        thumbnail_url: publicUrl,
        category: 'tips' as const,
        tags: ['kalori', 'nutrisi', 'scan'],
        is_public: true
      };
      
      console.log('Inserting video:', videoData);
      
      const { data: videoResult, error: videoError } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

      if (videoError) {
        console.error('Video insert error:', videoError);
        toast.error(`Gagal membuat post: ${videoError.message}`);
        throw videoError;
      }
      
      console.log('Video created:', videoResult);

      // Save scan to database with posted flag
      const scanData = {
        user_id: user.id,
        image_url: publicUrl,
        total_calories: scanResult.totalCalories,
        items: scanResult.items as any,
        is_posted: true
      };
      
      console.log('Inserting scan:', scanData);

      const { error: scanError } = await supabase
        .from('calorie_scans')
        .insert(scanData);

      if (scanError) {
        console.error('Scan insert error:', scanError);
        // Don't throw - video already created
        console.warn('Scan save failed but post was created');
      }

      toast.success('Berhasil diposting ke feed!');
      handleReset();
      onClose();
    } catch (error: any) {
      console.error('Error posting:', error);
      const errorMsg = error?.message || 'Terjadi kesalahan';
      toast.error(`Gagal memposting: ${errorMsg}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Scan Kalori Makanan</DialogTitle>
        </VisuallyHidden>

        {!scanResult ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Scan Makanan</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {imagePreview && (
              <div className="mb-4">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
              </div>
            )}

            {isScanning ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Menganalisis makanan...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full h-14"
                  variant="default"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Ambil Foto
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-14"
                  variant="outline"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Pilih dari Galeri
                </Button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Hasil Analisis</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Food Image with Labels */}
            <div className="px-4 pt-4 pb-4">
              <div 
                className="relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setShowLabels(!showLabels)}
              >
                <img 
                  src={imagePreview || scanResult.imageUrl} 
                  alt="Food" 
                  className="w-full object-cover"
                />
                
                {/* Total Calories Badge */}
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-xs font-medium">Total Kalori</p>
                  <p className="text-2xl font-bold">{scanResult.totalCalories} kal</p>
                </div>

                {/* Calorie labels overlaid on image */}
                {showLabels && scanResult.items.map((item, index) => (
                  <div
                    key={index}
                    className="absolute bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      top: `${20 + index * 25}%`,
                      left: index % 2 === 0 ? '10%' : '60%'
                    }}
                  >
                    {item.calories} kal<br />{item.name}
                  </div>
                ))}

                {/* Tag button like Instagram */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTable(!showTable);
                  }}
                  className="absolute bottom-4 left-4 bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all z-50 border-2 border-gray-300 flex items-center gap-2 font-medium"
                >
                  <Tag className="w-5 h-5" />
                  <span className="text-sm">View Details</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSavePhoto}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Save Photo
              </Button>
              <Button 
                variant="default" 
                className="w-full"
                onClick={handlePost}
                disabled={isPosting}
              >
                {isPosting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Post
              </Button>
            </div>

            {/* Ingredients Table */}
            {showTable && (
              <div className="px-4 pb-6">
                <h3 className="font-semibold mb-3">Ingredient Breakdown</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Ingredient</th>
                        <th className="text-center p-3 text-sm font-semibold">Amount</th>
                        <th className="text-center p-3 text-sm font-semibold">Calories</th>
                        <th className="text-center p-3 text-sm font-semibold">Protein</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanResult.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm capitalize">{item.name}</td>
                          <td className="p-3 text-sm text-center">{item.amount}</td>
                          <td className="p-3 text-sm text-center font-semibold">{item.calories}</td>
                          <td className="p-3 text-sm text-center">{item.protein}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 pb-6 space-y-2">
              <Button onClick={handleReset} variant="outline" className="w-full">
                Scan Lagi
              </Button>
              <Button onClick={onClose} className="w-full">
                Selesai
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

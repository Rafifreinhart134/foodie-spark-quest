import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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

            {/* Total Calories */}
            <div className="px-4 pt-4 pb-2">
              <div className="bg-primary/10 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">Total Kalori</p>
                <p className="text-3xl font-bold text-primary">{scanResult.totalCalories} kal</p>
              </div>
            </div>

            {/* Food Image with Labels */}
            <div className="px-4 pb-4">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={imagePreview || scanResult.imageUrl} 
                  alt="Food" 
                  className="w-full object-cover"
                />
                {/* Calorie labels overlaid on image */}
                {scanResult.items.map((item, index) => (
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
              </div>
            </div>

            {/* Save Photo Button */}
            <div className="px-4 pb-4">
              <Button variant="outline" className="w-full">
                <ImageIcon className="w-4 h-4 mr-2" />
                Save Photo
              </Button>
            </div>

            {/* Ingredients Table */}
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

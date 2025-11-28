import { useState, useRef } from 'react';
import { X, Zap, RefreshCw, Settings, Image, Circle, Video, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface StoryCameraScreenProps {
  onClose: () => void;
  onCapture: (media: { url: string; type: 'photo' | 'video'; file: File }) => void;
}

export const StoryCameraScreen = ({ onClose, onCapture }: StoryCameraScreenProps) => {
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('video/') ? 'video' : 'photo';
    const url = URL.createObjectURL(file);
    
    onCapture({ url, type, file });
  };

  const captureTypes = [
    { id: 'photo', label: 'STORY', icon: Camera },
    { id: 'video', label: 'VIDEO', icon: Video },
    { id: 'boomerang', label: 'BOOMERANG', icon: RefreshCw },
    { id: 'dual', label: 'DUAL', icon: Circle },
  ];

  return (
    <div className="relative w-full h-full bg-black">
      {/* Camera Preview Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <p className="text-white/50 text-sm">Tekan galeri untuk memilih media</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between">
          {/* Left: Close */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => {
                const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
                const currentIndex = modes.indexOf(flashMode);
                setFlashMode(modes[(currentIndex + 1) % modes.length]);
              }}
            >
              <Zap className={`w-5 h-5 ${flashMode === 'on' ? 'fill-white' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* LEFT SIDEBAR - Tools */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6">
        {['Create', 'Normal', 'Boomerang', 'Layout', 'Hands-free', 'Multi', 'Photobooth', 'Dual'].map((tool) => (
          <button
            key={tool}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold">
              {tool[0]}
            </div>
            <span className="text-[10px] font-medium">{tool}</span>
          </button>
        ))}
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pb-8 pt-4">
        {/* Capture Types Carousel */}
        <div className="flex justify-center gap-4 mb-6 px-4 overflow-x-auto">
          {captureTypes.map((type) => (
            <button
              key={type.id}
              className={`flex flex-col items-center gap-1 transition-all ${
                cameraMode === type.id ? 'text-white scale-110' : 'text-white/50'
              }`}
              onClick={() => setCameraMode(type.id as any)}
            >
              <type.icon className="w-5 h-5" />
              <span className="text-xs font-semibold whitespace-nowrap">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-8 px-8">
          {/* Gallery Thumbnail */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-xl border-2 border-white/50 overflow-hidden hover:border-white transition-colors flex items-center justify-center bg-white/10"
          >
            <Image className="w-6 h-6 text-white" />
          </button>

          {/* Shutter Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            onMouseDown={() => cameraMode === 'video' && setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            className={`relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-95 ${
              isRecording ? 'bg-red-500' : 'bg-transparent'
            }`}
          >
            <div className={`rounded-full transition-all ${
              isRecording ? 'w-6 h-6 bg-white' : 'w-16 h-16 bg-white'
            }`} />
          </button>

          {/* Spacer for symmetry */}
          <div className="w-12 h-12" />
        </div>

        {/* Instruction Text */}
        <div className="text-center mt-4">
          <p className="text-white/70 text-sm font-medium">
            {cameraMode === 'video' ? 'Tahan untuk merekam' : 'Ketuk untuk foto'}
          </p>
        </div>
      </div>
    </div>
  );
};
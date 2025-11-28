import { useState } from 'react';
import { X, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface StoryDrawToolProps {
  onClose: () => void;
  onSave: (drawing: any) => void;
}

export const StoryDrawTool = ({ onClose, onSave }: StoryDrawToolProps) => {
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [brushType, setBrushType] = useState<'marker' | 'brush' | 'neon' | 'eraser'>('marker');

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFFFFF', '#000000'
  ];

  const brushTypes = [
    { id: 'marker', label: 'Marker' },
    { id: 'brush', label: 'Brush' },
    { id: 'neon', label: 'Neon' },
    { id: 'eraser', label: 'Eraser' },
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-black/50">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
        <Button
          size="icon"
          variant="ghost"
          className="text-white"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white"
          >
            <Undo className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white"
          >
            <Redo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className="text-white font-semibold"
            onClick={() => onSave({ brushType, brushSize, brushColor })}
          >
            Done
          </Button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="absolute inset-0 top-16 bottom-32">
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-white/50">Draw here with your finger</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent space-y-4">
        {/* Brush Types */}
        <div className="flex gap-2 justify-center">
          {brushTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setBrushType(type.id as any)}
              className={`px-4 py-2 rounded-full transition-all ${
                brushType === type.id
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Brush Size Slider */}
        <div className="px-4">
          <Slider
            value={[brushSize]}
            onValueChange={(v) => setBrushSize(v[0])}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <p className="text-white text-center text-sm mt-2">Size: {brushSize}px</p>
        </div>

        {/* Color Palette */}
        <div className="flex gap-3 justify-center">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setBrushColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                brushColor === color ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
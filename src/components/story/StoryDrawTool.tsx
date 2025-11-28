import { useState, useRef, useEffect } from 'react';
import { X, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface StoryDrawToolProps {
  onClose: () => void;
  onSave: (drawing: any) => void;
}

export const StoryDrawTool = ({ onClose, onSave }: StoryDrawToolProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [brushType, setBrushType] = useState<'marker' | 'brush' | 'neon' | 'eraser'>('marker');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Set brush properties
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = brushType === 'eraser' ? 'destination-out' : 'source-over';
    
    if (brushType === 'neon') {
      ctx.strokeStyle = brushColor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = brushColor;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.shadowBlur = 0;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      setHistoryStep(historyStep - 1);
      ctx.putImageData(history[historyStep - 1], 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      setHistoryStep(historyStep + 1);
      ctx.putImageData(history[historyStep + 1], 0, 0);
    }
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    onSave({ 
      dataURL, 
      brushType, 
      brushSize, 
      brushColor 
    });
  };

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
            onClick={handleUndo}
            disabled={historyStep <= 0}
          >
            <Undo className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white"
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
          >
            <Redo className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className="text-white font-semibold"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="absolute inset-0 top-16 bottom-32">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
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
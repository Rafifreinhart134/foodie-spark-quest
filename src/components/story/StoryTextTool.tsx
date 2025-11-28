import { useState } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StoryTextToolProps {
  onClose: () => void;
  onAdd: (text: any) => void;
}

export const StoryTextTool = ({ onClose, onAdd }: StoryTextToolProps) => {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('classic');
  const [color, setColor] = useState('#FFFFFF');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [hasBackground, setHasBackground] = useState(false);

  const styles = [
    { id: 'classic', label: 'Classic', font: 'font-sans' },
    { id: 'typewriter', label: 'Typewriter', font: 'font-mono' },
    { id: 'neon', label: 'Neon', font: 'font-bold' },
    { id: 'strong', label: 'Strong', font: 'font-black' },
    { id: 'serif', label: 'Serif', font: 'font-serif' },
  ];

  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const handleDone = () => {
    if (!text.trim()) return;
    
    onAdd({
      content: text,
      style: {
        fontFamily: styles.find(s => s.id === style)?.font || 'font-sans',
        color,
        textAlign: alignment,
        backgroundColor: hasBackground ? `${color}20` : 'transparent',
        padding: hasBackground ? '8px 16px' : '0',
        borderRadius: hasBackground ? '8px' : '0',
      },
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
      rotation: 0,
      scale: 1
    });
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <Button
          size="icon"
          variant="ghost"
          className="text-white"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          className="text-white font-semibold"
          onClick={handleDone}
        >
          Done
        </Button>
      </div>

      {/* Text Input Area */}
      <div className="absolute top-1/3 left-0 right-0 px-8">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik sesuatu..."
          className={`bg-transparent border-none text-center text-3xl font-bold ${
            styles.find(s => s.id === style)?.font
          }`}
          style={{
            color,
            backgroundColor: hasBackground ? `${color}20` : 'transparent',
            padding: hasBackground ? '16px' : '0',
          }}
          autoFocus
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 bg-gradient-to-t from-black to-transparent">
        {/* Style Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                style === s.id 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white'
              }`}
            >
              <span className={s.font}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="flex gap-3 justify-center">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Alignment & Background */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            className={`text-white ${alignment === 'left' ? 'bg-white/20' : ''}`}
            onClick={() => setAlignment('left')}
          >
            <AlignLeft className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`text-white ${alignment === 'center' ? 'bg-white/20' : ''}`}
            onClick={() => setAlignment('center')}
          >
            <AlignCenter className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`text-white ${alignment === 'right' ? 'bg-white/20' : ''}`}
            onClick={() => setAlignment('right')}
          >
            <AlignRight className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className={`text-white ${hasBackground ? 'bg-white/20' : ''}`}
            onClick={() => setHasBackground(!hasBackground)}
          >
            Background
          </Button>
        </div>
      </div>
    </div>
  );
};
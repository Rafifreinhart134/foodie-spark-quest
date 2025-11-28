import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TimeStickerProps {
  onAdd: (time: { format: string; timezone: string }) => void;
  onClose: () => void;
}

export const TimeSticker = ({ onAdd, onClose }: TimeStickerProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormats = [
    { id: 'digital', label: 'Digital', format: (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
    { id: 'analog', label: 'Analog', format: (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
    { id: 'full', label: 'Full Date', format: (date: Date) => date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add Time</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <div className="space-y-3">
        {timeFormats.map((format) => (
          <button
            key={format.id}
            onClick={() => {
              onAdd({ format: format.id, timezone: 'Asia/Jakarta' });
              onClose();
            }}
            className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">{format.label}</p>
                <p className="text-sm text-muted-foreground">{format.format(currentTime)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

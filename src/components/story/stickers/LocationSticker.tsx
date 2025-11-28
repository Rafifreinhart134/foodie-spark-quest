import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationStickerProps {
  onAdd: (location: string) => void;
  onClose: () => void;
}

export const LocationSticker = ({ onAdd, onClose }: LocationStickerProps) => {
  const [location, setLocation] = useState('');

  const popularLocations = [
    'Jakarta, Indonesia',
    'Bali, Indonesia',
    'Bandung, Indonesia',
    'Surabaya, Indonesia',
    'Yogyakarta, Indonesia'
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add Location</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <Input
        placeholder="Search location..."
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full"
      />

      {location && (
        <Button 
          className="w-full" 
          onClick={() => {
            onAdd(location);
            onClose();
          }}
        >
          Add "{location}"
        </Button>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Popular Locations</p>
        {popularLocations.map((loc) => (
          <button
            key={loc}
            onClick={() => {
              onAdd(loc);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span>{loc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

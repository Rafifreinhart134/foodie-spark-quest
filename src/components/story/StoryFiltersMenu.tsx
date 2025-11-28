import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StoryFiltersMenuProps {
  onClose: () => void;
  onSelect: (filter: string) => void;
}

export const StoryFiltersMenu = ({ onClose, onSelect }: StoryFiltersMenuProps) => {
  const filters = [
    { id: 'none', label: 'Normal', effect: 'none' },
    { id: 'grayscale', label: 'B&W', effect: 'grayscale(100%)' },
    { id: 'sepia', label: 'Sepia', effect: 'sepia(100%)' },
    { id: 'vintage', label: 'Vintage', effect: 'sepia(50%) contrast(1.2)' },
    { id: 'bright', label: 'Bright', effect: 'brightness(1.3)' },
    { id: 'contrast', label: 'Contrast', effect: 'contrast(1.5)' },
    { id: 'saturate', label: 'Saturate', effect: 'saturate(2)' },
    { id: 'cool', label: 'Cool', effect: 'hue-rotate(180deg)' },
  ];

  return (
    <div className="absolute inset-x-0 bottom-0 z-[100] bg-background/95 backdrop-blur-lg rounded-t-3xl max-h-[40vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Filters Carousel */}
      <ScrollArea className="px-4 py-6">
        <div className="flex gap-3 pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onSelect(filter.effect)}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div 
                className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-secondary overflow-hidden"
                style={{ filter: filter.effect }}
              >
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100')] bg-cover" />
              </div>
              <span className="text-xs font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
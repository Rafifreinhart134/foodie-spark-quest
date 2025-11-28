import { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableStoryElementProps {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialRotation?: number;
  initialScale?: number;
  onUpdate?: (data: { x: number; y: number; rotation: number; scale: number }) => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
}

export const DraggableStoryElement = ({
  children,
  initialX = 0,
  initialY = 0,
  initialRotation = 0,
  initialScale = 1,
  onUpdate,
  onDelete,
  style
}: DraggableStoryElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState(initialRotation);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const touchStart = useRef({ distance: 0, angle: 0 });

  useEffect(() => {
    onUpdate?.({ x: position.x, y: position.y, rotation, scale });
  }, [position, rotation, scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.delete-btn')) return;
    e.preventDefault();
    setIsDragging(true);
    setIsSelected(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: position.x,
      elementY: position.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.delete-btn')) return;
    setIsSelected(true);
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        elementX: position.x,
        elementY: position.y
      };
    } else if (e.touches.length === 2) {
      // Pinch to scale and rotate
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) * (180 / Math.PI);
      
      touchStart.current = { distance, angle };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setPosition({
      x: dragStart.current.elementX + deltaX,
      y: dragStart.current.elementY + deltaY
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.current.x;
      const deltaY = touch.clientY - dragStart.current.y;
      setPosition({
        x: dragStart.current.elementX + deltaX,
        y: dragStart.current.elementY + deltaY
      });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) * (180 / Math.PI);

      // Scale
      const scaleChange = distance / touchStart.current.distance;
      setScale(prev => Math.max(0.5, Math.min(3, prev * scaleChange)));

      // Rotate
      const rotationChange = angle - touchStart.current.angle;
      setRotation(prev => prev + rotationChange);

      touchStart.current = { distance, angle };
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-white/50' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={() => setIsSelected(true)}
    >
      {children}
      
      {isSelected && onDelete && (
        <Button
          size="icon"
          variant="destructive"
          className="delete-btn absolute -top-8 -right-8 w-6 h-6 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

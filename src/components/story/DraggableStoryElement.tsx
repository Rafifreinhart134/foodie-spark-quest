import { useRef, useState, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableStoryElementProps {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialRotation?: number;
  initialScale?: number;
  onUpdate?: (data: { x: number; y: number; rotation: number; scale: number }) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  style?: React.CSSProperties;
  editable?: boolean;
}

export const DraggableStoryElement = ({
  children,
  initialX = 0,
  initialY = 0,
  initialRotation = 0,
  initialScale = 1,
  onUpdate,
  onDelete,
  onEdit,
  style,
  editable = false
}: DraggableStoryElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [rotation, setRotation] = useState(initialRotation);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStart = useRef({ distance: 0, initialScale: 1 });
  const touchStart = useRef({ distance: 0, angle: 0 });
  const lastTap = useRef(0);

  useEffect(() => {
    onUpdate?.({ x: position.x, y: position.y, rotation, scale });
  }, [position, rotation, scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.delete-btn, .resize-handle')) return;
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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setIsSelected(true);
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      resizeStart.current = { distance, initialScale: scale };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.delete-btn, .resize-handle')) return;
    setIsSelected(true);
    
    // Double tap detection for edit
    if (editable && onEdit && e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        onEdit();
        return;
      }
      lastTap.current = now;
    }
    
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
    if (isDragging) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      setPosition({
        x: dragStart.current.elementX + deltaX,
        y: dragStart.current.elementY + deltaY
      });
    } else if (isResizing) {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const scaleChange = distance / resizeStart.current.distance;
        const newScale = resizeStart.current.initialScale * scaleChange;
        setScale(Math.max(0.3, Math.min(3, newScale)));
      }
    }
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
      setScale(prev => Math.max(0.3, Math.min(3, prev * scaleChange)));

      // Rotate
      const rotationChange = angle - touchStart.current.angle;
      setRotation(prev => prev + rotationChange);

      touchStart.current = { distance, angle };
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isSelected) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.3, Math.min(3, prev + delta)));
  };

  const handleEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected]);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none transition-all ${
        isSelected ? 'ring-2 ring-white/70 rounded-lg' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center',
        padding: isSelected ? '8px' : '0',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
      onClick={() => setIsSelected(true)}
    >
      {children}
      
      {/* Control Buttons */}
      {isSelected && (
        <>
          {/* Delete Button */}
          {onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="delete-btn absolute -top-10 -right-2 w-7 h-7 rounded-full shadow-lg z-10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Resize Handles - Four Corners */}
          <div
            className="resize-handle absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg cursor-nwse-resize flex items-center justify-center border-2 border-primary z-10 hover:scale-110 transition-transform"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 className="w-4 h-4 text-primary" />
          </div>
          
          <div
            className="resize-handle absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg cursor-nesw-resize flex items-center justify-center border-2 border-primary z-10 hover:scale-110 transition-transform"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 className="w-4 h-4 text-primary" />
          </div>

          {/* Scale Indicator */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
            {Math.round(scale * 100)}%
          </div>
        </>
      )}
    </div>
  );
};

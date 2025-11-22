import { useState, useRef, useEffect } from 'react';
import { Bot, Camera, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalorieScanModal } from './CalorieScanModal';

export const AIFloatingButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleButtonClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      <div
        ref={buttonRef}
        className="fixed z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Main Button */}
        <div
          className={`relative transition-all duration-300 ${isExpanded ? 'scale-110' : ''}`}
          onClick={handleButtonClick}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center cursor-pointer border-2 border-white/20 backdrop-blur-sm">
            {isExpanded ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        {/* Expanded Options */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Scan Button */}
            <button
              onClick={() => {
                setIsScanOpen(true);
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm pr-2">Scan Makanan</span>
            </button>

            {/* Tanya Button */}
            <button
              onClick={() => {
                // TODO: Implement chat feature
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm pr-2">Tanya AI</span>
            </button>
          </div>
        )}
      </div>

      <CalorieScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
    </>
  );
};

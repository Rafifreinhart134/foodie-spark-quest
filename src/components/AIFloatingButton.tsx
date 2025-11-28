import { useState, useRef, useEffect } from 'react';
import { Camera, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalorieScanModal } from './CalorieScanModal';

export const AIFloatingButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 150 });
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
        className="fixed z-[9999]"
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
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer border-4 border-white backdrop-blur-sm hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all">
            {isExpanded ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="8" width="10" height="10" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="10" cy="12" r="1" fill="white"/>
                <circle cx="14" cy="12" r="1" fill="white"/>
                <line x1="9" y1="15" x2="15" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Expanded Options */}
        {isExpanded && (
          <div className="absolute bottom-20 left-0 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Scan Button */}
            <button
              onClick={() => {
                setIsScanOpen(true);
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] px-5 py-3 hover:bg-gray-50 transition-all hover:shadow-[0_6px_25px_rgba(0,0,0,0.3)] border-2 border-gray-100"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-base pr-2 text-gray-900">Scan Makanan</span>
            </button>

            {/* Tanya Button */}
            <button
              onClick={() => {
                // TODO: Implement chat feature
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] px-5 py-3 hover:bg-gray-50 transition-all hover:shadow-[0_6px_25px_rgba(0,0,0,0.3)] border-2 border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-base pr-2 text-gray-900">Tanya AI</span>
            </button>
          </div>
        )}
      </div>

      <CalorieScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
    </>
  );
};

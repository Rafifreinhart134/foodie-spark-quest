import { useState } from 'react';
import { X, Download, Type, Smile, Edit, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoryTextTool } from './StoryTextTool';
import { StoryStickerMenu } from './StoryStickerMenu';
import { StoryDrawTool } from './StoryDrawTool';
import { StoryFiltersMenu } from './StoryFiltersMenu';
import { StorySettingsSheet } from './StorySettingsSheet';
import { DraggableStoryElement } from './DraggableStoryElement';

interface StoryEditorScreenProps {
  media: { url: string; type: 'photo' | 'video'; file?: File };
  onClose: () => void;
  onPost: (storyData: any) => void;
  onBack: () => void;
}

type EditorTool = 'none' | 'text' | 'stickers' | 'draw' | 'effects' | 'settings';

export const StoryEditorScreen = ({ media, onClose, onPost, onBack }: StoryEditorScreenProps) => {
  const [activeTool, setActiveTool] = useState<EditorTool>('none');
  const [textElements, setTextElements] = useState<any[]>([]);
  const [stickerElements, setStickerElements] = useState<any[]>([]);
  const [drawingElements, setDrawingElements] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);

  const handleSave = () => {
    // Logic to save to device
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `story-${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
    link.click();
  };

  const handlePost = (settings: any) => {
    onPost({
      media,
      textElements,
      stickerElements,
      drawingElements,
      filter: selectedFilter,
      settings
    });
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Story Canvas */}
      <div className="absolute inset-0">
        {media.type === 'photo' ? (
          <img 
            src={media.url} 
            alt="Story"
            className="w-full h-full object-contain"
            style={{ filter: selectedFilter || 'none' }}
          />
        ) : (
          <video
            src={media.url}
            className="w-full h-full object-contain"
            style={{ filter: selectedFilter || 'none' }}
            controls={false}
            playsInline
          />
        )}

        {/* Text Elements Layer */}
        {textElements.map((text, idx) => (
          <DraggableStoryElement
            key={idx}
            initialX={text.x}
            initialY={text.y}
            initialRotation={text.rotation}
            initialScale={text.scale}
            style={text.style}
            editable={true}
            onUpdate={(data) => {
              const updated = [...textElements];
              updated[idx] = { ...text, ...data };
              setTextElements(updated);
            }}
            onEdit={() => {
              setEditingTextIndex(idx);
              setActiveTool('text');
            }}
            onDelete={() => {
              setTextElements(textElements.filter((_, i) => i !== idx));
            }}
          >
            <div className="px-4 py-2 text-2xl font-bold">
              {text.content}
            </div>
          </DraggableStoryElement>
        ))}

        {/* Sticker Elements Layer */}
        {stickerElements.map((sticker, idx) => (
          <DraggableStoryElement
            key={idx}
            initialX={sticker.x}
            initialY={sticker.y}
            initialRotation={sticker.rotation}
            initialScale={sticker.scale}
            onUpdate={(data) => {
              const updated = [...stickerElements];
              updated[idx] = { ...sticker, ...data };
              setStickerElements(updated);
            }}
            onDelete={() => {
              setStickerElements(stickerElements.filter((_, i) => i !== idx));
            }}
          >
            <div className="text-4xl">
              {sticker.content}
            </div>
          </DraggableStoryElement>
        ))}

        {/* Drawing Elements Layer */}
        {drawingElements.map((drawing, idx) => (
          <DraggableStoryElement
            key={idx}
            initialX={drawing.x || 0}
            initialY={drawing.y || 0}
            initialRotation={drawing.rotation || 0}
            initialScale={drawing.scale || 1}
            onUpdate={(data) => {
              const updated = [...drawingElements];
              updated[idx] = { ...drawing, ...data };
              setDrawingElements(updated);
            }}
            onDelete={() => {
              setDrawingElements(drawingElements.filter((_, i) => i !== idx));
            }}
          >
            <img 
              src={drawing.dataURL} 
              alt="drawing" 
              className="pointer-events-none max-w-full"
            />
          </DraggableStoryElement>
        ))}
      </div>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          {/* Left */}
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Right Tools */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={handleSave}
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`text-white hover:bg-white/20 rounded-full ${activeTool === 'stickers' ? 'bg-white/20' : ''}`}
              onClick={() => setActiveTool(activeTool === 'stickers' ? 'none' : 'stickers')}
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`text-white hover:bg-white/20 rounded-full ${activeTool === 'draw' ? 'bg-white/20' : ''}`}
              onClick={() => setActiveTool(activeTool === 'draw' ? 'none' : 'draw')}
            >
              <Edit className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`text-white hover:bg-white/20 rounded-full ${activeTool === 'text' ? 'bg-white/20' : ''}`}
              onClick={() => setActiveTool(activeTool === 'text' ? 'none' : 'text')}
            >
              <Type className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`text-white hover:bg-white/20 rounded-full ${activeTool === 'effects' ? 'bg-white/20' : ''}`}
              onClick={() => setActiveTool(activeTool === 'effects' ? 'none' : 'effects')}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR - Send To (Hidden when tools are active) */}
      {activeTool === 'none' && (
        <div className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full"
                onClick={() => setActiveTool('settings')}
              >
                <span>Your Story</span>
              </Button>
              <Button
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full"
                onClick={() => setActiveTool('settings')}
              >
                <span>Close Friends</span>
              </Button>
            </div>

            {/* Main Send To Button */}
            <Button
              className="w-full bg-white hover:bg-white/90 text-black font-semibold rounded-full h-12 text-base"
              onClick={() => setActiveTool('settings')}
            >
              <span>Send To</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* TOOL PANELS */}
      {activeTool === 'text' && (
        <StoryTextTool
          onClose={() => {
            setActiveTool('none');
            setEditingTextIndex(null);
          }}
          onAdd={(text) => {
            if (editingTextIndex !== null) {
              const updated = [...textElements];
              updated[editingTextIndex] = { ...updated[editingTextIndex], ...text };
              setTextElements(updated);
              setEditingTextIndex(null);
            } else {
              setTextElements([...textElements, text]);
            }
            setActiveTool('none');
          }}
          initialText={editingTextIndex !== null ? textElements[editingTextIndex] : undefined}
          isEditing={editingTextIndex !== null}
        />
      )}

      {activeTool === 'stickers' && (
        <StoryStickerMenu
          onClose={() => setActiveTool('none')}
          onAdd={(sticker) => {
            setStickerElements([...stickerElements, sticker]);
            setActiveTool('none');
          }}
        />
      )}

      {activeTool === 'draw' && (
        <StoryDrawTool
          onClose={() => setActiveTool('none')}
          onSave={(drawing) => {
            setDrawingElements([...drawingElements, { 
              ...drawing, 
              x: 50, 
              y: 100,
              rotation: 0,
              scale: 1
            }]);
            setActiveTool('none');
          }}
        />
      )}

      {activeTool === 'effects' && (
        <StoryFiltersMenu
          onClose={() => setActiveTool('none')}
          onSelect={(filter) => {
            setSelectedFilter(filter);
            setActiveTool('none');
          }}
        />
      )}

      {activeTool === 'settings' && (
        <StorySettingsSheet
          onClose={() => setActiveTool('none')}
          onPost={handlePost}
          storyPreview={media.url}
        />
      )}
    </div>
  );
};
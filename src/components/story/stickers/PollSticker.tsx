import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface PollStickerProps {
  onAdd: (poll: { question: string; options: string[] }) => void;
  onClose: () => void;
}

export const PollSticker = ({ onAdd, onClose }: PollStickerProps) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAdd = () => {
    if (question && options.every(opt => opt.trim())) {
      onAdd({ question, options });
      onClose();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create Poll</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <Input
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full font-medium"
      />

      <div className="space-y-2">
        {options.map((option, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              placeholder={`Option ${idx + 1}`}
              value={option}
              onChange={(e) => updateOption(idx, e.target.value)}
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeOption(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {options.length < 4 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={addOption}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      )}

      <Button 
        className="w-full" 
        onClick={handleAdd}
        disabled={!question || !options.every(opt => opt.trim())}
      >
        Add Poll
      </Button>
    </div>
  );
};

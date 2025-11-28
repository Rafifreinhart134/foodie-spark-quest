import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface QuestionStickerProps {
  onAdd: (question: string) => void;
  onClose: () => void;
}

export const QuestionSticker = ({ onAdd, onClose }: QuestionStickerProps) => {
  const [question, setQuestion] = useState('Ask me anything...');

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Question Sticker</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Question</span>
        </div>
        <p className="text-lg">{question}</p>
      </div>

      <Input
        placeholder="Customize your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full"
      />

      <Button 
        className="w-full" 
        onClick={() => {
          onAdd(question);
          onClose();
        }}
      >
        Add Question
      </Button>
    </div>
  );
};

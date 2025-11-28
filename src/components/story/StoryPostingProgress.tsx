import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useStories } from '@/hooks/useStories';

interface StoryPostingProgressProps {
  story: any;
  onComplete: () => void;
}

export const StoryPostingProgress = ({ story, onComplete }: StoryPostingProgressProps) => {
  const [progress, setProgress] = useState(0);
  const { createStory } = useStories();

  useEffect(() => {
    const upload = async () => {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Upload story
        if (story.media.file) {
          await createStory(
            story.media.file, 
            story.media.type,
            story.media.type === 'video' ? 15 : 5
          );
        }

        // Wait for animation
        setTimeout(() => {
          onComplete();
        }, 1000);
      } catch (error) {
        console.error('Upload error:', error);
      }
    };

    upload();
  }, []);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-white/20"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          
          {progress === 100 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-2xl font-bold">{progress}%</p>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="text-white">
          <p className="text-lg font-semibold">
            {progress === 100 ? 'Story Posted!' : 'Uploading Story...'}
          </p>
          <p className="text-sm text-white/60 mt-1">
            {progress === 100 ? 'Your story is now live' : 'Please wait'}
          </p>
        </div>

        {/* Mini Preview */}
        <div className="w-16 h-24 mx-auto rounded-lg overflow-hidden border-2 border-white/20">
          <img 
            src={story.media.url} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
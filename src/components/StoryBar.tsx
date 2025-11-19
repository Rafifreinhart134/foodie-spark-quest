import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Story {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  hasNewStory: boolean;
  isOwn?: boolean;
}

interface StoryBarProps {
  onStoryClick?: (story: Story) => void;
  onAddStory?: () => void;
}

const StoryBar = ({ onStoryClick, onAddStory }: StoryBarProps) => {
  // Mock data - will be replaced with real data later
  const stories: Story[] = [
    {
      id: '1',
      userId: 'own',
      username: 'Your Story',
      avatarUrl: '',
      hasNewStory: false,
      isOwn: true,
    },
    {
      id: '2',
      userId: '2',
      username: 'chef_rina',
      avatarUrl: '',
      hasNewStory: true,
    },
    {
      id: '3',
      userId: '3',
      username: 'kuliner_jkt',
      avatarUrl: '',
      hasNewStory: true,
    },
    {
      id: '4',
      userId: '4',
      username: 'food_lover',
      avatarUrl: '',
      hasNewStory: true,
    },
    {
      id: '5',
      userId: '5',
      username: 'resep_mama',
      avatarUrl: '',
      hasNewStory: false,
    },
    {
      id: '6',
      userId: '6',
      username: 'bakery_fresh',
      avatarUrl: '',
      hasNewStory: true,
    },
  ];

  return (
    <div className="w-full bg-background py-3 px-4 border-b border-border">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-1">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => story.isOwn ? onAddStory?.() : onStoryClick?.(story)}
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <div className={`relative ${
                story.hasNewStory && !story.isOwn
                  ? 'p-[2px] bg-gradient-to-tr from-primary via-primary/80 to-primary/60'
                  : ''
              }`}>
                <div className={`${story.hasNewStory && !story.isOwn ? 'p-[2px] bg-background' : ''}`}>
                  <Avatar className="w-14 h-14 border-2 border-background rounded-none">
                    <AvatarImage src={story.avatarUrl} alt={story.username} />
                    <AvatarFallback className="bg-muted text-foreground font-semibold rounded-none">
                      {story.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {story.isOwn && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary border-2 border-background flex items-center justify-center">
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-foreground font-medium max-w-[60px] truncate">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StoryBar;

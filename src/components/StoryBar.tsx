import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Story } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';

interface StoryBarProps {
  stories: Story[];
  onStoryClick?: (storyIndex: number, userId: string) => void;
  onAddStory?: () => void;
}

const StoryBar = ({ stories, onStoryClick, onAddStory }: StoryBarProps) => {
  const { user } = useAuth();

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Get first story of each user for display
  const userStories = Object.entries(groupedStories).map(([userId, userStoriesList]) => {
    const firstStory = userStoriesList[0];
    const hasViewed = userStoriesList.every(s => s.has_viewed);
    return {
      userId,
      story: firstStory,
      hasViewed,
      storyCount: userStoriesList.length
    };
  });

  // Check if current user has stories
  const userHasStories = user && userStories.some(us => us.userId === user.id);
  const userStoryGroup = userStories.find(us => us.userId === user?.id);

  return (
    <div className="w-full bg-background py-3 px-4 border-b border-border">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-1">
          {/* Your Story - Always show first */}
          <div
            onClick={() => {
              if (userHasStories && onStoryClick) {
                const storyIndex = stories.findIndex(s => s.user_id === user?.id);
                onStoryClick(storyIndex, user!.id);
              } else {
                onAddStory?.();
              }
            }}
            className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            <div className={`relative ${
              userHasStories && !userStoryGroup?.hasViewed
                ? 'p-[3px] rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30'
                : ''
            }`}>
              <div className={`${userHasStories && !userStoryGroup?.hasViewed ? 'p-[3px] bg-background rounded-full' : ''}`}>
                <Avatar className="w-16 h-16 border-2 border-background rounded-full">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="Your Story" />
                  <AvatarFallback className="bg-muted text-foreground font-semibold rounded-full">
                    {user?.user_metadata?.display_name?.[0]?.toUpperCase() || 'Y'}
                  </AvatarFallback>
                </Avatar>
              </div>
              {!userHasStories && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-md">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-foreground font-medium max-w-[60px] truncate">
              {userHasStories ? 'Your Story' : 'Add Story'}
            </span>
          </div>

          {/* Other users' stories */}
          {userStories
            .filter(us => us.userId !== user?.id)
            .map((userStory, index) => (
              <div
                key={userStory.userId}
                onClick={() => {
                  const storyIndex = stories.findIndex(s => s.user_id === userStory.userId);
                  onStoryClick?.(storyIndex, userStory.userId);
                }}
                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                <div className={`relative ${
                  !userStory.hasViewed
                    ? 'p-[3px] rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30'
                    : ''
                }`}>
                  <div className={`${!userStory.hasViewed ? 'p-[3px] bg-background rounded-full' : ''}`}>
                    <Avatar className="w-16 h-16 border-2 border-background rounded-full">
                      <AvatarImage 
                        src={userStory.story.profiles?.avatar_url} 
                        alt={userStory.story.profiles?.display_name || 'User'} 
                      />
                      <AvatarFallback className="bg-muted text-foreground font-semibold rounded-full">
                        {userStory.story.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-[10px] text-foreground font-medium max-w-[60px] truncate">
                  {userStory.story.profiles?.display_name || 'User'}
                </span>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StoryBar;

import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import { useStories } from '@/hooks/useStories';
import { useState } from 'react';
import StoryBar from './StoryBar';
import { StoryCreateModal } from './StoryCreateModal';
import { StoryViewerModal } from './StoryViewerModal';

const SavedPage = () => {
  const navigate = useNavigate();
  const { savedVideos, loading } = useSavedVideos();
  const { stories, loading: storiesLoading, markStoryAsViewed, deleteStory } = useStories();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-20 px-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Filter stories for selected user
  const userStories = selectedUserId 
    ? stories.filter(s => s.user_id === selectedUserId)
    : stories;

  return (
    <div className="min-h-screen pt-16 pb-20">
      {/* Story Bar */}
      <StoryBar 
        stories={stories}
        onAddStory={() => setIsCreateModalOpen(true)}
        onStoryClick={(storyIndex, userId) => {
          setSelectedStoryIndex(storyIndex);
          setSelectedUserId(userId);
          setIsViewerModalOpen(true);
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 mt-4">Video Tersimpan</h1>
        
        {savedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Bookmark className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Video Tersimpan</h3>
            <p className="text-muted-foreground text-center">
              Video yang Anda simpan akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedVideos.map((video) => (
              <Card 
                key={video.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/')}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Bookmark className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <h3 className="text-white text-sm font-medium line-clamp-2">
                        {video.title}
                      </h3>
                      {video.profiles && (
                        <p className="text-white/80 text-xs mt-1">
                          @{video.profiles.display_name || 'User'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>❤️ {video.like_count || 0}</span>
                      <span>💬 {video.comment_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <StoryCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {userStories.length > 0 && (
        <StoryViewerModal
          isOpen={isViewerModalOpen}
          onClose={() => {
            setIsViewerModalOpen(false);
            setSelectedUserId('');
          }}
          stories={userStories}
          initialStoryIndex={0}
          onMarkAsViewed={markStoryAsViewed}
          onDeleteStory={deleteStory}
        />
      )}
    </div>
  );
};

export default SavedPage;

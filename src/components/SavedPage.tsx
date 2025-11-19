import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import StoryBar from './StoryBar';

const SavedPage = () => {
  const navigate = useNavigate();
  const { savedVideos, loading } = useSavedVideos();

  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-20 px-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (savedVideos.length === 0) {
    return (
      <div className="min-h-screen pt-16 pb-20 px-4 flex flex-col items-center justify-center">
        <Bookmark className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Belum Ada Video Tersimpan</h3>
        <p className="text-muted-foreground text-center">
          Video yang Anda simpan akan muncul di sini
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-20">
      {/* Story Bar */}
      <StoryBar 
        onAddStory={() => console.log('Add story clicked')}
        onStoryClick={(story) => console.log('Story clicked:', story)}
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 mt-4">Video Tersimpan</h1>
        
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
      </div>
    </div>
  );
};

export default SavedPage;

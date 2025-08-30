import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

export const CommentsModal = ({ isOpen, onClose, videoId, videoTitle }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments();
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('id, comment, created_at, user_id')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately to avoid relationship issues
      let commentsWithProfiles: Comment[] = [];
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        const profilesMap = new Map(
          profilesData?.map(p => [p.user_id, p]) || []
        );

        commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id) || null
        })) as Comment[];
      }

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          comment: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{comments.length} Comments</DialogTitle>
        </DialogHeader>
        
        {/* Comments List */}
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback>
                      {comment.profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.profiles?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        {user ? (
          <div className="flex space-x-2 pt-4 border-t">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <Button 
              onClick={submitComment} 
              size="icon" 
              disabled={!newComment.trim() || submitting}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="pt-4 border-t text-center text-muted-foreground">
            <p>Please sign in to comment</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
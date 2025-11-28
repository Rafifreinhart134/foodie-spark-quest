import { AtSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface MentionStickerProps {
  onAdd: (username: string) => void;
  onClose: () => void;
}

export const MentionSticker = ({ onAdd, onClose }: MentionStickerProps) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length > 0) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [search]);

  const searchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .ilike('display_name', `%${search}%`)
      .limit(10);
    
    setUsers(data || []);
    setLoading(false);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Mention Someone</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>

      <Input
        placeholder="Search username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
        {users.map((user) => (
          <button
            key={user.user_id}
            onClick={() => {
              onAdd(`@${user.display_name}`);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <AtSign className="w-5 h-5" />
              </div>
            )}
            <span>@{user.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

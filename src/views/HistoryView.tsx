import React, { useEffect, useState } from 'react';
import { Clock, Trash2, Play } from 'lucide-react';
import { HistoryItem, VideoItem } from '../types';
import { GlassCard } from '../components/GlassCard';
import { PillButton } from '../components/PillButton';
import { useAuth } from '../context/AuthContext';

interface HistoryViewProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectVideo }) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/user/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/user/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <GlassCard className="!p-6 sm:!p-10 text-center flex flex-col items-center gap-3 sm:gap-4 max-w-lg mx-auto mt-8 sm:mt-12 border border-zinc-500/20">
        <Clock className="w-10 h-10 sm:w-12 sm:h-12" />
        <h2 className="text-lg sm:text-xl font-extrabold">Private Watch History</h2>
        <p className="text-xs sm:text-sm font-medium opacity-80">
          Sign in to view and automatically track your watched videos on your private server.
        </p>
        <PillButton onClick={() => setIsAuthModalOpen(true)} activeGlow active size="lg" className="!px-6 !py-2 text-xs sm:text-sm">
          Sign In
        </PillButton>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <GlassCard className="!p-4 sm:!p-5 border border-zinc-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold">Watch History ({history.length})</h1>
            <p className="text-xs opacity-70 font-medium">Stored locally in your VPS database</p>
          </div>
        </div>

        {history.length > 0 && (
          <PillButton
            onClick={handleClearHistory}
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5 opacity-70" />}
            className="!px-3 !py-1 text-xs shrink-0"
          >
            Clear History
          </PillButton>
        )}
      </GlassCard>

      {loading ? (
        <div className="py-12 text-center text-xs sm:text-sm opacity-70 font-medium">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="py-12 sm:py-16 text-center glass-panel rounded-3xl p-6 sm:p-8 opacity-70 border border-zinc-500/20 text-xs sm:text-sm">
          Your watch history is empty. Start watching videos to build your private timeline!
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {history.map((item) => (
            <GlassCard
              key={item.id}
              onClick={() =>
                onSelectVideo({
                  id: item.videoId,
                  title: item.title,
                  thumbnail: item.thumbnail,
                  duration: item.duration || '10:00',
                  author: {
                    id: item.channelId,
                    name: item.channelName,
                    avatar:
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                  },
                })
              }
              className="!p-2.5 sm:!p-3 flex gap-3 sm:gap-4 cursor-pointer border border-zinc-500/20 hover:border-zinc-400 transition group items-center"
            >
              <div className="relative aspect-video w-28 sm:w-44 rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold group-hover:underline transition line-clamp-2">
                  {item.title}
                </h3>
                <span className="text-[11px] opacity-70 font-medium">{item.channelName}</span>
                <span className="text-[10px] opacity-50">Watched: {new Date(item.watchedAt).toLocaleString()}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Tv } from 'lucide-react';
import { Subscription, VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { GlassCard } from '../components/GlassCard';
import { PillButton } from '../components/PillButton';
import { useAuth } from '../context/AuthContext';

interface SubscriptionsViewProps {
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  savedVideoIds: string[];
  onToggleSave: (videoId: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  onSelectVideo,
  onSelectChannel,
  savedVideoIds,
  onToggleSave,
}) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const res = await fetch('/api/user/subscriptions');
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data.subscriptions || []);
        }

        // Load feed
        const fRes = await fetch('/api/feed?category=All');
        if (fRes.ok) {
          const fData = await fRes.json();
          setVideos(fData.videos || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (!user) {
    return (
      <GlassCard className="!p-6 sm:!p-10 text-center flex flex-col items-center gap-3 sm:gap-4 max-w-lg mx-auto mt-8 sm:mt-12 border border-zinc-500/20">
        <Tv className="w-10 h-10 sm:w-12 sm:h-12" />
        <h2 className="text-lg sm:text-xl font-extrabold">Private Subscriptions Feed</h2>
        <p className="text-xs sm:text-sm font-medium opacity-80">
          Sign in to your private VPS account to manage channel subscriptions without a Google Account.
        </p>
        <PillButton onClick={() => setIsAuthModalOpen(true)} activeGlow active size="lg" className="!px-6 !py-2 text-xs sm:text-sm">
          Sign In to VPS
        </PillButton>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <GlassCard className="!p-4 sm:!p-5 border border-zinc-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold">
            <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold">Your Subscribed Channels ({subscriptions.length})</h1>
            <p className="text-xs opacity-70 font-medium">Stored locally on your private VPS server</p>
          </div>
        </div>
      </GlassCard>

      {/* Subscribed Channels Horizon Scroll Pill List */}
      {subscriptions.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          {subscriptions.map((sub) => (
            <button
              key={sub.channelId}
              onClick={() => onSelectChannel(sub.channelId)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-panel-interactive border border-zinc-500/20 cursor-pointer shrink-0"
            >
              <img
                src={sub.avatar}
                alt={sub.channelName}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-zinc-500/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                }}
              />
              <span className="text-xs font-bold">{sub.channelName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Subscription Feed */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold opacity-60 uppercase tracking-wider">Latest Uploads</h2>
        {loading ? (
          <div className="py-12 text-center text-xs sm:text-sm opacity-70 font-medium">Loading subscription feed...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                onChannelClick={onSelectChannel}
                onToggleSave={onToggleSave}
                isSaved={savedVideoIds.includes(video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

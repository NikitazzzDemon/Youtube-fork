import React, { useEffect, useState } from 'react';
import { CheckCircle2, Bell, Video } from 'lucide-react';
import { ChannelDetails, VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { GlassCard } from '../components/GlassCard';
import { PillButton } from '../components/PillButton';
import { useAuth } from '../context/AuthContext';

interface ChannelViewProps {
  channelId: string;
  onSelectVideo: (video: VideoItem) => void;
  savedVideoIds: string[];
  onToggleSave: (videoId: string) => void;
}

export const ChannelView: React.FC<ChannelViewProps> = ({
  channelId,
  onSelectVideo,
  savedVideoIds,
  onToggleSave,
}) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [channel, setChannel] = useState<ChannelDetails | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setVisibleCount(12);

    async function fetchChannelData() {
      try {
        const res = await fetch(`/api/channel/${channelId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setChannel(data.channel);
            setVideos(data.videos || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchChannelData();
    return () => {
      isMounted = false;
    };
  }, [channelId]);

  const handleToggleSubscribe = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!channel) return;

    try {
      const endpoint = channel.isSubscribed ? '/api/user/unsubscribe' : '/api/user/subscribe';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.id,
          channelName: channel.name,
          avatar: channel.avatar,
        }),
      });

      if (res.ok) {
        setChannel({ ...channel, isSubscribed: !channel.isSubscribed });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !channel) {
    return <div className="py-20 text-center text-xs sm:text-sm font-bold opacity-70">Loading channel details...</div>;
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Banner */}
      <div className="relative h-36 sm:h-56 w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-zinc-500/20">
        <img
          src={channel.banner}
          alt={channel.name}
          className="w-full h-full object-cover grayscale opacity-80"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      {/* Channel Avatar & Info Header */}
      <GlassCard className="!p-4 sm:!p-6 -mt-12 sm:-mt-16 relative z-10 mx-2 sm:mx-4 border border-zinc-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-current shadow-xl shrink-0"
            />
            <div className="flex flex-col">
              <h1 className="text-base sm:text-2xl font-extrabold flex items-center gap-2">
                <span>{channel.name}</span>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </h1>
              <span className="text-xs opacity-70 mt-0.5 font-medium">
                {channel.subscriberCount} • {channel.videoCount}
              </span>
              <p className="text-xs opacity-70 mt-1 line-clamp-2 max-w-xl font-medium">{channel.description}</p>
            </div>
          </div>

          <PillButton
            onClick={handleToggleSubscribe}
            active={channel.isSubscribed}
            activeGlow={!channel.isSubscribed}
            size="md"
            icon={<Bell className="w-4 h-4" />}
            className="!px-4 !py-1.5 text-xs sm:text-sm shrink-0"
          >
            {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </PillButton>
        </div>
      </GlassCard>

      {/* Videos Section */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            <span>Видео канала ({videos.length})</span>
          </h2>
          {videos.length > 0 && (
            <span className="text-xs font-semibold opacity-60">
              Показано {Math.min(visibleCount, videos.length)} из {videos.length}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {videos.slice(0, visibleCount).map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={onSelectVideo}
              onToggleSave={onToggleSave}
              isSaved={savedVideoIds.includes(video.id)}
            />
          ))}
        </div>

        {visibleCount < videos.length && (
          <div className="flex justify-center mt-6 mb-4">
            <PillButton
              onClick={() => setVisibleCount((prev) => prev + 12)}
              size="lg"
              className="!px-8 !py-3 text-sm font-bold shadow-lg cursor-pointer transition active:scale-95"
            >
              Загрузить ещё (+{Math.min(12, videos.length - visibleCount)})
            </PillButton>
          </div>
        )}
      </div>
    </div>
  );
};

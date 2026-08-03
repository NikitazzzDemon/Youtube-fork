import React from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { VideoItem, ChannelDetails } from '../types';
import { VideoCard } from '../components/VideoCard';
import { GlassCard } from '../components/GlassCard';
import { PillButton } from '../components/PillButton';

interface SearchViewProps {
  query: string;
  videos: VideoItem[];
  channels: ChannelDetails[];
  loading: boolean;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  savedVideoIds: string[];
  onToggleSave: (videoId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  videos,
  channels,
  loading,
  onSelectVideo,
  onSelectChannel,
  savedVideoIds,
  onToggleSave,
}) => {
  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="!p-4 sm:!p-5 border border-zinc-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold">Search Results for "{query}"</h1>
            <p className="text-xs opacity-70 font-medium">
              Found {videos.length} videos and {channels.length} channels
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Channels section if any found */}
      {channels.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold opacity-60 uppercase tracking-wider">Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {channels.map((ch) => (
              <GlassCard
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className="!p-3.5 cursor-pointer border border-zinc-500/20 hover:border-zinc-400 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-zinc-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
                      <span className="truncate">{ch.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    </h3>
                    <p className="text-[11px] opacity-70 font-medium">{ch.subscriberCount}</p>
                  </div>
                </div>
                <PillButton size="sm" active className="!px-3 !py-1 text-xs shrink-0">View Channel</PillButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold opacity-60 uppercase tracking-wider">Videos</h2>
        {loading ? (
          <div className="py-12 text-center text-xs sm:text-sm font-medium opacity-70">Searching YouTube via VPS Proxy...</div>
        ) : videos.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-3xl border border-zinc-500/20 text-xs sm:text-sm">No results found.</div>
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

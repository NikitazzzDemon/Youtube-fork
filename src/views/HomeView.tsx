import React from 'react';
import { Sparkles, Shield } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { GlassCard } from '../components/GlassCard';

interface HomeViewProps {
  videos: VideoItem[];
  loading: boolean;
  selectedCategory: string;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  savedVideoIds: string[];
  onToggleSave: (videoId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  videos,
  loading,
  selectedCategory,
  onSelectVideo,
  onSelectChannel,
  savedVideoIds,
  onToggleSave,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Featured Header Glass Banner */}
      <GlassCard className="relative overflow-hidden border border-zinc-500/20 shadow-xl !p-4 sm:!p-6">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5 sm:gap-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full neu-pill-active text-[10px] sm:text-xs font-black w-fit">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Glassmorphism YouTube VPS Proxy</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {selectedCategory === 'All' ? 'Recommended Proxy Feed' : `${selectedCategory} Videos`}
            </h1>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-medium">
              Bypass blocks with chunked media streaming through your private VPS server. Zero direct requests to Google tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl glass-panel border border-zinc-500/20 shrink-0 w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-extrabold">Private VPS Active</span>
              <span className="opacity-70 text-[10px] sm:text-xs">1080p Stream Proxy</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-3.5 flex flex-col gap-3 animate-pulse border border-zinc-500/20">
              <div className="aspect-video w-full bg-zinc-500/20 rounded-xl"></div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-500/20 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-zinc-500/20 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-500/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-12 text-center glass-panel rounded-3xl p-6 border border-zinc-500/20">
          <p className="text-base font-bold">No videos found for this category.</p>
          <p className="text-xs opacity-60 mt-1">Try searching for a specific topic in the search bar above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
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
  );
};

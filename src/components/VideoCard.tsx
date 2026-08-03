import React, { useState } from 'react';
import { Play, CheckCircle2, Bookmark, Share2, Radio } from 'lucide-react';
import { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  onChannelClick?: (channelId: string) => void;
  onToggleSave?: (videoId: string) => void;
  isSaved?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  onChannelClick,
  onToggleSave,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const proxyUrl = `${window.location.origin}/?watch=${video.id}`;
    navigator.clipboard.writeText(proxyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(video.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(video)}
      className="group relative flex flex-col glass-panel-interactive rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-zinc-500/20"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop';
          }}
        />

        {/* Hover Play Glow Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg border border-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 ml-0.5 fill-black" />
          </div>
        </div>

        {/* Duration / Live Badge */}
        <div className="absolute bottom-2.5 right-2.5">
          {video.isLive ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black tracking-wider shadow-lg border border-red-500">
              <Radio className="w-3 h-3 animate-pulse text-white" /> LIVE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-zinc-100 text-[11px] font-semibold border border-zinc-700">
              {video.duration || '10:00'}
            </span>
          )}
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3.5 sm:p-4 flex gap-3">
        {/* Channel Avatar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onChannelClick) onChannelClick(video.author.id);
          }}
          className="shrink-0 group/avatar"
        >
          <img
            src={video.author.avatar}
            alt={video.author.name}
            className="w-9 h-9 rounded-full object-cover border border-zinc-500/40 group-hover/avatar:border-current transition"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
            }}
          />
        </div>

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug transition-colors">
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onChannelClick) onChannelClick(video.author.id);
              }}
              className="hover:underline transition truncate font-medium"
            >
              {video.author.name}
            </span>
            {video.author.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-[11px] opacity-60">
            <span>{video.viewCount}</span>
            <span>•</span>
            <span>{video.publishedTime}</span>
          </div>
        </div>

        {/* Quick Action Menu */}
        <div className="shrink-0 flex flex-col gap-1 opacity-80 group-hover:opacity-100 transition">
          <button
            onClick={handleSave}
            title={isSaved ? 'Saved' : 'Save Video'}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isSaved
                ? 'neu-pill-active'
                : 'hover:bg-zinc-500/20'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            title={copied ? 'Copied!' : 'Share'}
            className="p-1.5 rounded-full hover:bg-zinc-500/20 transition relative cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {copied && (
              <span className="absolute -top-7 right-0 px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] font-bold whitespace-nowrap shadow-lg">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Share2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VideoItem, CommentItem } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { Comments } from '../components/Comments';
import { PillButton } from '../components/PillButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

interface WatchViewProps {
  videoId: string;
  onSelectVideo: (video: VideoItem) => void;
  onSelectChannel: (channelId: string) => void;
  savedVideoIds: string[];
  onToggleSave: (videoId: string) => void;
}

export const WatchView: React.FC<WatchViewProps> = ({
  videoId,
  onSelectVideo,
  onSelectChannel,
  savedVideoIds,
  onToggleSave,
}) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [related, setRelated] = useState<VideoItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadVideoData() {
      try {
        const [vRes, cRes] = await Promise.all([
          fetch(`/api/video/${videoId}`),
          fetch(`/api/comments/${videoId}`),
        ]);

        if (vRes.ok) {
          const vData = await vRes.json();
          if (isMounted) {
            setVideo(vData.video);
            setRelated(vData.related || []);
            setIsSubscribed(vData.isSubscribed || false);
          }
        }

        if (cRes.ok) {
          const cData = await cRes.json();
          if (isMounted) {
            setComments(cData.comments || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadVideoData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleToggleSubscribe = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!video) return;

    try {
      const endpoint = isSubscribed ? '/api/user/unsubscribe' : '/api/user/subscribe';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: video.author.id,
          channelName: video.author.name,
          avatar: video.author.avatar,
        }),
      });

      if (res.ok) {
        setIsSubscribed(!isSubscribed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    const proxyUrl = `${window.location.origin}/?watch=${videoId}`;
    navigator.clipboard.writeText(proxyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = (text: string) => {
    const newC: CommentItem = {
      id: `c_${Date.now()}`,
      author: user ? user.name : 'VPS User',
      avatar: '/api/proxy-image?url=' + encodeURIComponent('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
      text,
      publishedTime: 'Just now',
      likeCount: '1',
    };
    setComments([newC, ...comments]);
  };

  if (loading || !video) {
    return (
      <div className="flex flex-col gap-6 w-full mx-auto">
        <div className="aspect-video w-full rounded-2xl sm:rounded-3xl glass-panel animate-pulse flex items-center justify-center">
          <div className="text-xs sm:text-sm font-bold opacity-70">Connecting to VPS Stream Proxy...</div>
        </div>
      </div>
    );
  }

  const isSaved = savedVideoIds.includes(video.id);

  return (
    <div className={`w-full mx-auto flex flex-col ${isTheater ? 'lg:flex-col' : 'lg:flex-row'} gap-6`}>
      {/* Left Column: Player + Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-5">
        {/* Custom Glass Video Player */}
        <VideoPlayer
          video={video}
          isTheater={isTheater}
          onToggleTheater={() => setIsTheater(!isTheater)}
        />

        {/* Video Title & Actions */}
        <div className="flex flex-col gap-3">
          <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
            {video.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-zinc-500/20">
            {/* Author / Channel info */}
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2.5">
                <img
                  src={video.author.avatar}
                  alt={video.author.name}
                  onClick={() => onSelectChannel(video.author.id)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-zinc-500/40 cursor-pointer hover:border-current transition"
                />
                <div className="flex flex-col">
                  <div
                    onClick={() => onSelectChannel(video.author.id)}
                    className="flex items-center gap-1 cursor-pointer hover:underline transition"
                  >
                    <span className="font-extrabold text-xs sm:text-sm">{video.author.name}</span>
                    {video.author.verified && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] opacity-60 font-medium">{video.author.subscriberCount || '1.2M subscribers'}</span>
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="ml-auto sm:ml-2 shrink-0">
                <PillButton
                  onClick={handleToggleSubscribe}
                  active={isSubscribed}
                  activeGlow={!isSubscribed}
                  size="sm"
                  className="!px-3 !py-1 text-xs"
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </PillButton>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 justify-end shrink-0">
              <PillButton
                onClick={() => onToggleSave(video.id)}
                size="sm"
                active={isSaved}
                icon={<Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />}
                className="!px-3 !py-1 text-xs"
              >
                {isSaved ? 'Saved' : 'Save'}
              </PillButton>

              <PillButton onClick={handleShare} size="sm" icon={<Share2 className="w-3.5 h-3.5" />} className="!px-3 !py-1 text-xs">
                {copied ? 'Copied!' : 'Share'}
              </PillButton>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <GlassCard className="!p-3.5 sm:!p-4 border border-zinc-500/20 rounded-2xl relative">
          <div className="flex items-center gap-2.5 text-xs font-bold opacity-80 mb-2">
            <span>{video.viewCount}</span>
            <span>•</span>
            <span>{video.publishedTime}</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-zinc-500/20 text-[10px] font-extrabold">
              Proxied Clean Text
            </span>
          </div>

          <p
            className={`text-xs sm:text-sm whitespace-pre-line leading-relaxed font-medium opacity-90 ${
              !isDescriptionExpanded ? 'line-clamp-3' : ''
            }`}
          >
            {video.description}
          </p>

          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="mt-2 text-xs font-black hover:underline flex items-center gap-1 cursor-pointer"
          >
            {isDescriptionExpanded ? (
              <>
                Show Less <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </GlassCard>

        {/* Comments */}
        <Comments comments={comments} onAddComment={handleAddComment} />
      </div>

      {/* Right Column: Related Videos Sidebar */}
      <div className={`${isTheater ? 'w-full' : 'w-full lg:w-80 xl:w-96'} shrink-0 flex flex-col gap-3 mt-4 lg:mt-0`}>
        <h2 className="text-sm font-extrabold flex items-center gap-2 px-1">
          <span>Next Up (Proxied)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {related.map((rel) => (
            <div
              key={rel.id}
              onClick={() => onSelectVideo(rel)}
              className="group flex gap-3 p-2 rounded-2xl glass-panel-interactive border border-zinc-500/20 cursor-pointer transition"
            >
              <div className="relative aspect-video w-32 sm:w-36 rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                <img
                  src={rel.thumbnail}
                  alt={rel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] text-white font-bold">
                  {rel.duration}
                </span>
              </div>

              <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                <h3 className="text-xs font-bold line-clamp-2 leading-snug group-hover:underline transition">
                  {rel.title}
                </h3>
                <div className="flex flex-col mt-1">
                  <span className="text-[11px] opacity-70 truncate font-medium">{rel.author.name}</span>
                  <span className="text-[10px] opacity-50">{rel.viewCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

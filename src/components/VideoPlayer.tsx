import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  Sparkles,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { VideoItem } from '../types';

interface VideoPlayerProps {
  video: VideoItem;
  onEnded?: () => void;
  isTheater?: boolean;
  onToggleTheater?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onEnded,
  isTheater = false,
  onToggleTheater,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveredControls, setIsHoveredControls] = useState(true);
  const [useEmbed, setUseEmbed] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Stream URL via VPS Proxy
  const streamUrl = `/api/stream?id=${video.id}&quality=${quality}`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.8;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error('PiP Error:', e);
    }
  };

  const handleMouseMove = () => {
    setIsHoveredControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setIsHoveredControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      className={`relative w-full overflow-hidden bg-black rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-500/20 group ${
        isTheater ? 'aspect-[21/9]' : 'aspect-video'
      }`}
    >
      {/* HTML5 Video Element or YouTube Embed Player */}
      {useEmbed ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <video
          ref={videoRef}
          src={streamUrl}
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            if (onEnded) onEnded();
          }}
          onError={() => {
            console.warn('[Player] Proxy stream error, automatically switching to YouTube Embed player fallback...');
            setUseEmbed(true);
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />
      )}

      {/* Top Overlay Badge (VPS Proxy Indicator) */}
      <div
        className={`absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between transition-opacity duration-300 pointer-events-none z-20 ${
          isHoveredControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xl border border-zinc-700 text-[10px] sm:text-xs text-white shadow-lg pointer-events-auto max-w-[60%] sm:max-w-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-zinc-200 truncate">{video.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseEmbed(!useEmbed)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 hover:bg-black backdrop-blur-xl border border-zinc-700 text-[10px] sm:text-xs text-white shadow-lg pointer-events-auto cursor-pointer transition"
            title="Toggle Stream Engine"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{useEmbed ? 'YouTube Embed' : 'VPS Proxy'}</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-black backdrop-blur-xl border border-white text-[10px] sm:text-xs font-bold shadow-lg pointer-events-auto shrink-0">
            <Sparkles className="w-3 h-3 text-black" />
            <span>{quality}</span>
          </div>
        </div>
      </div>

      {/* Floating Glass Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-2 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-md transition-opacity duration-300 z-20 ${
          isHoveredControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Slider */}
        <div className="relative flex items-center mb-2 sm:mb-3 group/timeline cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-white hover:h-2.5 transition-all"
          />
        </div>

        {/* Control Buttons Bar */}
        <div className="flex items-center justify-between gap-1">
          {/* Left Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-full bg-white text-black hover:scale-105 transition cursor-pointer font-bold shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="p-1 text-zinc-300 hover:text-white transition">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white opacity-80 group-hover/vol:opacity-100 transition hidden sm:block"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[10px] sm:text-xs font-mono text-zinc-300">
              <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Speed / Quality Settings Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 sm:p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition cursor-pointer"
                title="Playback Settings"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Settings Popover */}
              {showSettings && (
                <div className="absolute right-0 bottom-10 sm:bottom-12 w-48 sm:w-56 rounded-2xl glass-panel p-3 border border-zinc-700 shadow-2xl flex flex-col gap-3 z-50 text-xs bg-black/95 text-white">
                  <div>
                    <span className="font-bold text-zinc-400 block mb-1">Stream Quality</span>
                    <div className="grid grid-cols-2 gap-1">
                      {['1080p', '720p', '480p', '360p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowSettings(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-center font-bold transition ${
                            quality === q
                              ? 'bg-white text-black shadow-md'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-2">
                    <span className="font-bold text-zinc-400 block mb-1">Speed Rate</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setPlaybackSpeed(s);
                            setShowSettings(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-center font-bold transition ${
                            playbackSpeed === s
                              ? 'bg-white text-black shadow-md'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-1.5 sm:p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Theater Mode */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className="p-1.5 sm:p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition hidden sm:block"
                title="Theater Mode"
              >
                <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState } from 'react';
import { VideoItem } from '../types';

interface PlayerContextType {
  activeVideo: VideoItem | null;
  playVideo: (video: VideoItem) => void;
  closeMiniPlayer: () => void;
  isMiniPlayer: boolean;
  setIsMiniPlayer: (mini: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedQuality: string;
  setSelectedQuality: (q: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');

  const playVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setIsPlaying(true);
    setIsMiniPlayer(false);
  };

  const closeMiniPlayer = () => {
    setActiveVideo(null);
    setIsPlaying(false);
    setIsMiniPlayer(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        activeVideo,
        playVideo,
        closeMiniPlayer,
        isMiniPlayer,
        setIsMiniPlayer,
        isPlaying,
        setIsPlaying,
        selectedQuality,
        setSelectedQuality,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

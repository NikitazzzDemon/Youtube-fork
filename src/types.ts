export interface VideoAuthor {
  id: string;
  name: string;
  avatar: string;
  subscriberCount?: string;
  verified?: boolean;
}

export interface VideoFormat {
  itag?: number;
  quality: string;
  qualityLabel?: string;
  container?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  mimeType?: string;
  bitrate?: number;
  fps?: number;
  url?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration?: string;
  durationSec?: number;
  viewCount?: string;
  publishedTime?: string;
  author: VideoAuthor;
  isLive?: boolean;
  proxyStreamUrl?: string;
  formats?: VideoFormat[];
}

export interface ChannelDetails {
  id: string;
  name: string;
  avatar: string;
  banner?: string;
  subscriberCount?: string;
  description?: string;
  videoCount?: string;
  isSubscribed?: boolean;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  publishedTime: string;
  likeCount?: string;
  replyCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Subscription {
  channelId: string;
  channelName: string;
  avatar: string;
  dateAdded: string;
}

export interface HistoryItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  duration?: string;
  watchedAt: string;
  progress?: number;
}

export interface VPSStats {
  status: 'online' | 'degraded' | 'offline';
  uptimeSeconds: number;
  memoryUsageMb: number;
  totalMemoryMb: number;
  activeStreamsCount: number;
  cachedThumbnailsCount: number;
  poTokenStatus: 'active' | 'refreshing' | 'bypassed';
  vpsIp: string;
  youtubeLatencyMs: number;
}

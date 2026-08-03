import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { VPSStatusModal } from './components/VPSStatusModal';
import { HomeView } from './views/HomeView';
import { WatchView } from './views/WatchView';
import { SearchView } from './views/SearchView';
import { ChannelView } from './views/ChannelView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { VideoItem, ChannelDetails } from './types';
import { X } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [activeVideoId, setActiveVideoId] = useState<string>('');

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchVideos, setSearchVideos] = useState<VideoItem[]>([]);
  const [searchChannels, setSearchChannels] = useState<ChannelDetails[]>([]);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVPSModalOpen, setIsVPSModalOpen] = useState<boolean>(false);

  const { activeVideo, playVideo, closeMiniPlayer } = usePlayer();

  // Load feed videos based on category
  const loadFeed = async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?category=${encodeURIComponent(cat)}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load saved video IDs
  const loadSavedIds = async () => {
    try {
      const res = await fetch('/api/user/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedVideoIds(data.savedIds || []);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadFeed(selectedCategory);
    loadSavedIds();

    // Check share URL parameters ?watch=...
    const urlParams = new URLSearchParams(window.location.search);
    const watchId = urlParams.get('watch');
    if (watchId) {
      setActiveVideoId(watchId);
      setCurrentView('watch');
    }
  }, []);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('home');
    loadFeed(category);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchVideos(data.videos || []);
        setSearchChannels(data.channels || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (video: VideoItem) => {
    setActiveVideoId(video.id);
    playVideo(video);
    setCurrentView('watch');
    // Update URL parameter cleanly without reloading
    window.history.pushState({}, '', `/?watch=${video.id}`);
  };

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentView('channel');
  };

  const handleToggleSave = async (videoId: string) => {
    try {
      const res = await fetch('/api/user/saved/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      if (res.ok) {
        if (savedVideoIds.includes(videoId)) {
          setSavedVideoIds(savedVideoIds.filter((id) => id !== videoId));
        } else {
          setSavedVideoIds([...savedVideoIds, videoId]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigate = (view: string) => {
    if (view.startsWith('channel:')) {
      const chId = view.split('channel:')[1];
      handleSelectChannel(chId);
      return;
    }
    setCurrentView(view);
    if (view === 'home') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navigation */}
      <Navbar
        onSearch={handleSearch}
        onSelectCategory={handleSelectCategory}
        selectedCategory={selectedCategory}
        onOpenVPSModal={() => setIsVPSModalOpen(true)}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main App Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex gap-6">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 min-w-0 lg:ml-60 transition-all duration-300">
          {currentView === 'home' && (
            <HomeView
              videos={videos}
              loading={loading}
              selectedCategory={selectedCategory}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentView === 'watch' && (
            <WatchView
              videoId={activeVideoId}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentView === 'search' && (
            <SearchView
              query={searchQuery}
              videos={searchVideos}
              channels={searchChannels}
              loading={loading}
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentView === 'channel' && (
            <ChannelView
              channelId={activeChannelId}
              onSelectVideo={handleSelectVideo}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentView === 'subscriptions' && (
            <SubscriptionsView
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
            />
          )}

          {currentView === 'saved' && (
            <HomeView
              videos={videos.filter((v) => savedVideoIds.includes(v.id))}
              loading={false}
              selectedCategory="Saved Videos"
              onSelectVideo={handleSelectVideo}
              onSelectChannel={handleSelectChannel}
              savedVideoIds={savedVideoIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentView === 'vps' && <SettingsView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Mini Player when navigating away from watch view */}
      {activeVideo && currentView !== 'watch' && (
        <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-72 sm:w-80 glass-panel rounded-2xl overflow-hidden shadow-2xl border border-zinc-500/20 p-2 animate-in slide-in-from-bottom-5">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
            <video
              src={`/api/stream?id=${activeVideo.id}`}
              autoPlay
              playsInline
              controls
              className="w-full h-full object-contain"
            />
            <button
              onClick={closeMiniPlayer}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/80 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2 flex items-center justify-between gap-2">
            <span
              onClick={() => {
                setCurrentView('watch');
                setActiveVideoId(activeVideo.id);
              }}
              className="text-xs font-bold line-clamp-1 cursor-pointer hover:underline"
            >
              {activeVideo.title}
            </span>
            <span className="text-[10px] opacity-70 shrink-0 font-mono font-bold">Proxied</span>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal />

      {/* VPS Status Modal */}
      <VPSStatusModal isOpen={isVPSModalOpen} onClose={() => setIsVPSModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

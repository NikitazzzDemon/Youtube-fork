import React from 'react';
import { Home, Clock, Bookmark, Server, Settings, ShieldAlert, Tv, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home Feed', icon: <Home className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Tv className="w-4 h-4" /> },
    { id: 'history', label: 'Watch History', icon: <Clock className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Videos', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'vps', label: 'VPS Status', icon: <Server className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 sm:top-20 left-2 sm:left-4 bottom-4 z-50 lg:z-30 w-64 glass-panel rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-80 lg:translate-x-0'
        } shadow-2xl border border-zinc-500/20 max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar`}
      >
        <div className="flex flex-col gap-5">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-zinc-500/20">
            <span className="text-xs font-black uppercase tracking-wider opacity-70">Menu</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-500/20 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Navigation Capsule Pill Group */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-wider opacity-60 uppercase px-3">
              Navigation
            </span>
            <div className="flex flex-col gap-1.5 mt-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'neu-pill-active'
                        : 'opacity-80 hover:opacity-100 hover:bg-zinc-500/10 border border-transparent'
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Subscriptions List preview */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-wider opacity-60 uppercase px-3 flex items-center justify-between">
              <span>Quick Channels</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <div className="flex flex-col gap-1 mt-1">
              <button
                onClick={() => handleSelect('channel:UC_x5XG1OV2P6uZZ5FSM9Ttw')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs opacity-80 hover:opacity-100 hover:bg-zinc-500/15 transition font-medium cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-black border border-zinc-500/30">
                  G
                </div>
                <span className="truncate">Google Developers</span>
              </button>
              <button
                onClick={() => handleSelect('channel:UCWv7vMbMWH4-V0ZXgpyX54A')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs opacity-80 hover:opacity-100 hover:bg-zinc-500/15 transition font-medium cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black border border-zinc-500/30">
                  V
                </div>
                <span className="truncate">Veritasium</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Private VPS Shield Badge */}
        <div className="rounded-2xl p-3 glass-panel-interactive flex flex-col gap-1.5 mt-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span>Zero-Google Direct</span>
          </div>
          <p className="text-[10px] opacity-70 leading-relaxed font-medium">
            All video chunks, thumbnails & scripts proxied through your private VPS.
          </p>
        </div>
      </aside>
    </>
  );
};

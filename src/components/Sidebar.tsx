import React from 'react';
import { Home, Clock, Bookmark, Settings, ShieldAlert, Tv, X } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose }) => {
  const navItems = [
    { id: 'home', label: 'Home Feed', icon: <Home className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Tv className="w-4 h-4" /> },
    { id: 'history', label: 'Watch History', icon: <Clock className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Videos', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile/Tablet backdrop overlay with smooth dimming */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 xl:hidden transition-opacity duration-300"
        />
      )}

      {/* Responsive Sidebar */}
      <aside
        className={`
          /* Mobile & Tablet Drawer (< xl): Fixed overlay on top (z-50) without shifting main layout */
          fixed inset-y-0 left-0 top-0 pt-20 pb-6 px-4 z-50 w-64 glass-panel transition-all duration-300 transform shadow-2xl
          ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'}
          /* Desktop sticky column (≥ xl): In-flow column when open */
          ${
            isOpen
              ? 'xl:static xl:z-10 xl:w-64 xl:shrink-0 xl:opacity-100 xl:transform-none xl:h-[calc(100vh-8.5rem)] xl:sticky xl:top-28 xl:pointer-events-auto'
              : 'xl:hidden xl:w-0 xl:shrink-0 xl:p-0 xl:m-0 xl:border-0'
          }
          rounded-3xl p-4 flex flex-col justify-between border border-zinc-500/20 overflow-y-auto no-scrollbar
        `}
      >
        <div className="flex flex-col gap-5">
          {/* Header with Close Button for Drawer Mode */}
          <div className="flex items-center justify-between xl:hidden pb-2 border-b border-zinc-500/20">
            <span className="text-xs font-black uppercase tracking-wider opacity-70">Navigation Menu</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-500/20 transition cursor-pointer">
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
                <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-black border border-zinc-500/30 shrink-0">
                  G
                </div>
                <span className="truncate">Google Developers</span>
              </button>
              <button
                onClick={() => handleSelect('channel:UCWv7vMbMWH4-V0ZXgpyX54A')}
                className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs opacity-80 hover:opacity-100 hover:bg-zinc-500/15 transition font-medium cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black border border-zinc-500/30 shrink-0">
                  V
                </div>
                <span className="truncate">Veritasium</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Private VPS Shield Badge */}
        <div className="rounded-2xl p-3 glass-panel-interactive flex flex-col gap-1.5 mt-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0" />
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

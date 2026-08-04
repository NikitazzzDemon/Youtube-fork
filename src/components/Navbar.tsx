import React, { useState } from 'react';
import { Search, Server, ShieldCheck, LogOut, Sparkles, SlidersHorizontal, Menu, X, Sun, Moon } from 'lucide-react';
import { PillButton } from './PillButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  onOpenVPSModal: () => void;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  onSelectCategory,
  selectedCategory,
  onOpenVPSModal,
  toggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const categories = ['All', 'Trending', 'Music', 'Tech', 'Science', 'Gaming', 'Live', 'Lofi', 'Design'];

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-4 py-2.5 sm:py-3 glass-panel border-b border-zinc-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('All');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-zinc-900 to-zinc-700 text-white dark:from-white dark:to-zinc-200 dark:text-black flex items-center justify-center shadow-md border border-zinc-400/30 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base sm:text-lg tracking-tight">
                  GlassTube
                </span>
                <span className="px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold tracking-wider opacity-80 bg-zinc-800 dark:bg-zinc-200 dark:text-black text-white rounded-full uppercase">
                  VPS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Desktop / Tablet Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-2">
          <div className="relative flex items-center w-full">
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Search YouTube videos, channels (Proxied)..."
              className="w-full pl-10 pr-20 py-2 rounded-full glass-input text-xs sm:text-sm placeholder-zinc-400 focus:outline-none transition-all duration-300"
            />
            
            <div className="absolute right-1.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full hover:bg-zinc-500/20 text-zinc-400 hover:text-white transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <PillButton
                type="submit"
                size="sm"
                activeGlow
                active
                icon={<Search className="w-3.5 h-3.5" />}
                className="!px-2.5 !py-1 text-xs"
              >
                Find
              </PillButton>
            </div>
          </div>
        </form>

        {/* Right Controls: Theme Toggle + VPS Health + Auth Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle Icon */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-full glass-panel hover:bg-zinc-500/20 transition"
            aria-label="Toggle search input"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-300" />
            )}
          </button>

          {/* VPS Status Health Indicator */}
          <button
            onClick={onOpenVPSModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-panel text-xs font-semibold hover:scale-105 transition cursor-pointer"
            title="VPS Status"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">VPS Proxy</span>
          </button>

          {/* User Account Capsule Pill */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-panel">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] sm:text-xs font-black shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold hidden sm:inline max-w-[80px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-full glass-panel hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <PillButton
              onClick={() => setIsAuthModalOpen(true)}
              activeGlow
              active
              size="sm"
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
              className="!px-2.5 !py-1 text-xs"
            >
              <span className="hidden sm:inline">Private Login</span>
              <span className="sm:hidden">Login</span>
            </PillButton>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Dropdown Row */}
      {mobileSearchOpen && (
        <form onSubmit={(e) => { handleSearchSubmit(e); setMobileSearchOpen(false); }} className="md:hidden mt-2.5 pt-2 border-t border-zinc-500/20 flex items-center">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos (Proxied)..."
              autoFocus
              className="w-full pl-9 pr-16 py-2 rounded-full glass-input text-xs focus:outline-none"
            />
            <div className="absolute right-1 flex items-center gap-1">
              <PillButton type="submit" size="sm" active activeGlow className="!px-2.5 !py-0.5 text-xs">
                Search
              </PillButton>
            </div>
          </div>
        </form>
      )}

      {/* Category Horizontal Glass Pill Selector Bar */}
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-zinc-500/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1">
        <SlidersHorizontal className="w-3.5 h-3.5 opacity-50 shrink-0 ml-1 hidden sm:block" />
        {categories.map((cat) => (
          <PillButton
            key={cat}
            size="sm"
            active={selectedCategory === cat}
            activeGlow={selectedCategory === cat}
            onClick={() => onSelectCategory(cat)}
            className="whitespace-nowrap shrink-0 text-xs !px-3 !py-1"
          >
            {cat}
          </PillButton>
        ))}
      </div>
    </header>
  );
};

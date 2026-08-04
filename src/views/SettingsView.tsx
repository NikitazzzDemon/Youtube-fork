import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Sun,
  Moon,
  Palette,
  Zap,
  Server,
  Globe,
  Lock,
  User,
  LogOut,
  Sliders,
  PlayCircle,
  Eye,
  Save,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PillButton } from '../components/PillButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'vps'>('account');

  // Account Preferences state
  const [preferredQuality, setPreferredQuality] = useState<string>('1080p');
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [saveHistory, setSaveHistory] = useState<boolean>(true);
  const [displayName, setDisplayName] = useState<string>(user?.name || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Copy states
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [copiedUninstall, setCopiedUninstall] = useState(false);

  const oneLinerCommand = `curl -fsSL -o /tmp/install.sh ${window.location.origin}/install.sh && sudo bash /tmp/install.sh`;
  const uninstallCommand = `curl -fsSL -o /tmp/uninstall.sh ${window.location.origin}/uninstall.sh && sudo bash /tmp/uninstall.sh`;

  const handleCopyOneLiner = () => {
    navigator.clipboard.writeText(oneLinerCommand);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
  };

  const handleCopyUninstall = () => {
    navigator.clipboard.writeText(uninstallCommand);
    setCopiedUninstall(true);
    setTimeout(() => setCopiedUninstall(false), 2000);
  };

  const dockerSnippet = `version: '3.8'
services:
  glasstube:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_custom_secret_key_here
    volumes:
      - ./data:/app/data
    restart: always`;

  const handleCopyDocker = () => {
    navigator.clipboard.writeText(dockerSnippet);
    setCopiedDocker(true);
    setTimeout(() => setCopiedDocker(false), 2000);
  };

  const handleSaveAccountSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto">
      {/* Settings Header */}
      <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Settings & Configuration</h1>
            <p className="text-xs opacity-70 font-medium">
              Manage account profile, appearance themes, and VPS proxy deployment
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-full glass-panel border border-zinc-500/20 shrink-0">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'neu-pill-active'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'neu-pill-active'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('vps')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vps'
                ? 'neu-pill-active'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            VPS Server
          </button>
        </div>
      </GlassCard>

      {/* ACCOUNT SETTINGS TAB */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* User Profile Card */}
          <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-500/20 pb-3">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <User className="w-4 h-4 text-emerald-500" />
                <span>Account Profile</span>
              </div>
              {user && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  Active VPS Session
                </span>
              )}
            </div>

            {user ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-zinc-500/20">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-lg font-extrabold shadow-md border border-zinc-400/30 shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold">{user.name}</span>
                    <span className="text-xs opacity-70 font-medium">{user.email}</span>
                    <span className="text-[10px] opacity-50 mt-0.5 font-mono">ID: {user.id}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-panel text-center gap-3">
                <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-80" />
                <div className="max-w-md">
                  <h3 className="text-sm font-bold">Guest Mode (Unauthenticated)</h3>
                  <p className="text-xs opacity-70 mt-1 font-medium">
                    Sign in to your private VPS account to save playlists, retain watch history, and sync channel subscriptions across devices.
                  </p>
                </div>
                <PillButton
                  onClick={() => setIsAuthModalOpen(true)}
                  active
                  activeGlow
                  size="md"
                  icon={<User className="w-4 h-4" />}
                  className="!px-5 !py-2 text-xs font-bold"
                >
                  Sign In / Register
                </PillButton>
              </div>
            )}
          </GlassCard>

          {/* Account & Playback Preferences */}
          <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-extrabold border-b border-zinc-500/20 pb-3">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Playback & Streaming Preferences</span>
            </div>

            <form onSubmit={handleSaveAccountSettings} className="flex flex-col gap-4">
              {/* Preferred Resolution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl glass-panel border border-zinc-500/15">
                <div>
                  <label className="text-xs font-bold flex items-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Default Video Streaming Quality</span>
                  </label>
                  <p className="text-[11px] opacity-70 font-medium">
                    Requested resolution for proxied chunk streams
                  </p>
                </div>
                <select
                  value={preferredQuality}
                  onChange={(e) => setPreferredQuality(e.target.value)}
                  className="px-3 py-1.5 rounded-full glass-input text-xs font-bold cursor-pointer focus:outline-none"
                >
                  <option value="1080p">1080p HD (High Definition)</option>
                  <option value="720p">720p HD (Balanced)</option>
                  <option value="480p">480p (Low Data Mode)</option>
                  <option value="360p">360p (Data Saver)</option>
                </select>
              </div>

              {/* Autoplay Next Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-zinc-500/15">
                <div>
                  <span className="text-xs font-bold">Autoplay Recommended Videos</span>
                  <p className="text-[11px] opacity-70 font-medium">
                    Automatically play related video when stream finishes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoplayNext(!autoplayNext)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoplayNext ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      autoplayNext ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Save Watch History Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-zinc-500/15">
                <div>
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Record VPS Watch History</span>
                  </span>
                  <p className="text-[11px] opacity-70 font-medium">
                    Store viewed videos locally in private database
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveHistory(!saveHistory)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    saveHistory ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      saveHistory ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Display Name Edit if Logged in */}
              {user && (
                <div className="flex flex-col gap-1.5 p-3 rounded-2xl glass-panel border border-zinc-500/15">
                  <label className="text-xs font-bold">Display Profile Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="px-3 py-2 rounded-xl glass-input text-xs font-medium focus:outline-none"
                  />
                </div>
              )}

              {/* Save Preferences Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Preferences Saved!
                  </span>
                )}
                <PillButton
                  type="submit"
                  active
                  activeGlow
                  size="sm"
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="!px-4 !py-1.5 text-xs font-bold"
                >
                  Save Account Settings
                </PillButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* APPEARANCE TAB */}
      {activeTab === 'appearance' && (
        <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-extrabold border-b border-zinc-500/20 pb-3">
            <Palette className="w-4 h-4 text-emerald-500" />
            <span>Appearance & Glass Theme</span>
          </div>

          <p className="text-xs opacity-80 leading-relaxed font-medium">
            GlassTube supports both frosted light mode and sleek dark mode with genuine glass reflections and background blurs.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
              className={`p-4 rounded-2xl flex items-center justify-between border transition cursor-pointer ${
                theme === 'dark' ? 'neu-pill-active' : 'glass-panel hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold">Dark Glass</span>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
              className={`p-4 rounded-2xl flex items-center justify-between border transition cursor-pointer ${
                theme === 'light' ? 'neu-pill-active' : 'glass-panel hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold">Light Glass</span>
              </div>
              {theme === 'light' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </GlassCard>
      )}

      {/* VPS INSTALLER TAB */}
      {(activeTab === 'vps' || activeTab === 'appearance') && (
        <>
          {/* 1-Step Interactive VPS Installer */}
          <GlassCard className="!p-4 sm:!p-6 border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-500 dark:text-emerald-400">
                <Zap className="w-4 h-4 fill-emerald-500" />
                <span>Interactive 1-Step VPS Installer (Automatic Port & Domain Setup)</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                Caddy Auto-SSL + Port Check + Docker
              </span>
            </div>

            <p className="text-xs opacity-90 leading-relaxed font-medium">
              Run this single command on your Ubuntu server as <code className="px-1.5 py-0.5 rounded font-mono glass-panel">root</code>. The installer will interactively prompt you for your custom ports (verifying availability and clearing port conflicts) and domain, then automatically install Docker & Caddy, configure SSL, and launch GlassTube!
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
                Run Command on VPS Terminal:
              </span>
              <PillButton
                onClick={handleCopyOneLiner}
                size="sm"
                active
                icon={copiedOneLiner ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                className="!px-3.5 !py-2 text-xs font-bold shrink-0"
              >
                {copiedOneLiner ? 'Copied Command' : 'Copy Installer Command'}
              </PillButton>
            </div>

            <pre className="p-3.5 sm:p-4 rounded-2xl bg-black/90 text-emerald-400 text-[11px] font-mono overflow-x-auto border border-emerald-500/30 shadow-inner">
              {oneLinerCommand}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-semibold opacity-90 pt-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl glass-panel">
                <Server className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Interactive Port Input & Conflict Cleanup</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl glass-panel">
                <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Domain Check & Automatic Let's Encrypt SSL</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl glass-panel">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Auto UFW Firewall + Caddy Reverse Proxy</span>
              </div>
            </div>
          </GlassCard>

          {/* Docker Compose Deploy Snippet */}
          <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>Host VPS Deployment (docker-compose.yml)</span>
              </div>
              <PillButton
                onClick={handleCopyDocker}
                size="sm"
                active
                icon={copiedDocker ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                className="!px-3 !py-1 text-xs"
              >
                {copiedDocker ? 'Copied' : 'Copy Code'}
              </PillButton>
            </div>

            <p className="text-xs opacity-80 leading-relaxed font-medium">
              Deploy on your own VPS with a single command: <code className="px-1.5 py-0.5 rounded font-mono glass-panel">docker compose up -d</code>.
            </p>

            <pre className="p-3 sm:p-4 rounded-2xl glass-panel border border-zinc-500/20 text-[11px] font-mono overflow-x-auto">
              {dockerSnippet}
            </pre>
          </GlassCard>

          {/* 1-Step Uninstaller */}
          <GlassCard className="!p-4 sm:!p-6 border border-rose-500/20 bg-rose-500/5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400">
                <Terminal className="w-4 h-4 text-rose-500" />
                <span>VPS Uninstaller (Clean Removal)</span>
              </div>
              <PillButton
                onClick={handleCopyUninstall}
                size="sm"
                active
                icon={copiedUninstall ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                className="!px-3 !py-1 text-xs font-bold shrink-0 text-rose-500 border-rose-500/30"
              >
                {copiedUninstall ? 'Copied Uninstaller' : 'Copy Uninstaller Command'}
              </PillButton>
            </div>

            <p className="text-xs opacity-80 leading-relaxed font-medium">
              Completely stops containers, removes <code className="px-1 py-0.5 rounded font-mono glass-panel">/opt/glasstube</code>, resets Caddy config, and cleans UFW firewall rules.
            </p>

            <pre className="p-3.5 sm:p-4 rounded-2xl bg-black/90 text-rose-400 text-[11px] font-mono overflow-x-auto border border-rose-500/20 shadow-inner">
              {uninstallCommand}
            </pre>
          </GlassCard>
        </>
      )}
    </div>
  );
};

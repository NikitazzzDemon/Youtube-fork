import React, { useState } from 'react';
import { Settings, ShieldCheck, Terminal, Copy, Check, Sun, Moon, Palette, Zap, Server, Globe, Lock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PillButton } from '../components/PillButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);

  const oneLinerCommand = `curl -fsSL -o /tmp/install.sh ${window.location.origin}/install.sh && sudo bash /tmp/install.sh`;

  const handleCopyOneLiner = () => {
    navigator.clipboard.writeText(oneLinerCommand);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
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

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto">
      <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex items-center gap-3.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold">VPS & Proxy Client Settings</h1>
          <p className="text-xs opacity-70 font-medium">Configure your private GlassTube instance & display preferences</p>
        </div>
      </GlassCard>

      {/* Theme Selection */}
      <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <Palette className="w-4 h-4 text-emerald-500" />
          <span>Appearance & Glass Theme</span>
        </div>

        <p className="text-xs opacity-80 leading-relaxed font-medium">
          GlassTube supports both frosted light mode and sleek dark mode with genuine glass reflections and background blurs.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-1">
          <button
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={`p-3 sm:p-4 rounded-full flex items-center justify-between border transition cursor-pointer ${
              theme === 'dark'
                ? 'neu-pill-active'
                : 'glass-panel hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold">Dark Glass</span>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            className={`p-3 sm:p-4 rounded-full flex items-center justify-between border transition cursor-pointer ${
              theme === 'light'
                ? 'neu-pill-active'
                : 'glass-panel hover:border-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold">Light Glass</span>
            </div>
            {theme === 'light' && <Check className="w-4 h-4" />}
          </button>
        </div>
      </GlassCard>

      {/* Account Info */}
      <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Private User Profile</span>
        </div>

        {user ? (
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl glass-panel border border-zinc-500/20">
            <div>
              <p className="text-xs sm:text-sm font-bold">{user.name}</p>
              <p className="text-[11px] opacity-70 font-medium">{user.email}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full neu-pill-active text-[10px] sm:text-xs font-black">
              Authenticated Owner
            </span>
          </div>
        ) : (
          <p className="text-xs opacity-70 font-medium">
            You are currently using the unauthenticated preview mode. Sign in to sync subscriptions & history across devices.
          </p>
        )}
      </GlassCard>

      {/* 1-Step Interactive VPS Installer */}
      <GlassCard className="!p-4 sm:!p-6 border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-500 dark:text-emerald-400">
            <Zap className="w-4 h-4 fill-emerald-500" />
            <span>Interactive 1-Step VPS Installer (Interactive Port & Domain Verification)</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
            Caddy Auto-SSL + Port Check + Docker
          </span>
        </div>

        <p className="text-xs opacity-90 leading-relaxed font-medium">
          Run this single command on your Ubuntu server as <code className="px-1.5 py-0.5 rounded font-mono glass-panel">root</code>. The installer will interactively prompt you for your custom ports (verifying availability and stopping conflicting Apache/Nginx services) and your domain (verifying DNS records), then automatically install Docker & Caddy, configure Let's Encrypt SSL, and launch GlassTube!
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400">Run Command on VPS Terminal:</span>
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
            <span>Interactive Port Input & Conflict Removal</span>
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
          <PillButton onClick={handleCopyDocker} size="sm" active icon={copiedDocker ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} className="!px-3 !py-1 text-xs">
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

      {/* VPS Proxy Features List */}
      <GlassCard className="!p-4 sm:!p-6 border border-zinc-500/20 flex flex-col gap-2.5">
        <h3 className="text-xs sm:text-sm font-bold">Server Proxy Protections</h3>
        <ul className="text-xs opacity-80 space-y-2 font-medium">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All media streams routed through chunked VPS proxy (<code className="opacity-90">/api/stream</code>)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>External thumbnails and avatars proxied via <code className="opacity-90">/api/proxy-image</code></span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Zero Google client-side tracking, cookies, or telemetry scripts</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Local file-backed database persistence in <code className="opacity-90">/data/glasstube_db.json</code></span>
          </li>
        </ul>
      </GlassCard>
    </div>
  );
};

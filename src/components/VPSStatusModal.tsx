import React, { useEffect, useState } from 'react';
import { X, Server, Activity, Cpu, ShieldCheck, RefreshCw, Radio } from 'lucide-react';
import { VPSStats } from '../types';
import { GlassCard } from './GlassCard';
import { PillButton } from './PillButton';

interface VPSStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VPSStatusModal: React.FC<VPSStatusModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<VPSStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vps/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-5 sm:p-6 border border-zinc-500/20 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-panel hover:bg-zinc-500/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black border border-zinc-500/30 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>VPS Proxy Node Health</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-xs opacity-70">Real-time media stream proxy & Google bypass status</p>
          </div>
        </div>

        {stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Status Card */}
            <GlassCard className="!p-3.5 border border-zinc-500/20">
              <div className="flex items-center gap-2 text-xs font-bold opacity-70 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Bypass Tunnel</span>
              </div>
              <p className="text-base sm:text-lg font-extrabold capitalize">{stats.status} (Protected)</p>
              <p className="text-[11px] opacity-60 mt-1">IP: {stats.vpsIp}</p>
            </GlassCard>

            {/* Active Streams Card */}
            <GlassCard className="!p-3.5 border border-zinc-500/20">
              <div className="flex items-center gap-2 text-xs font-bold opacity-70 mb-1">
                <Radio className="w-4 h-4 text-emerald-500" />
                <span>Active Media Streams</span>
              </div>
              <p className="text-base sm:text-lg font-extrabold">{stats.activeStreamsCount} Active Chunks</p>
              <p className="text-[11px] opacity-60 mt-1">Chunked Transfer Encoding</p>
            </GlassCard>

            {/* Memory Card */}
            <GlassCard className="!p-3.5 border border-zinc-500/20">
              <div className="flex items-center gap-2 text-xs font-bold opacity-70 mb-1">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>Node Memory</span>
              </div>
              <p className="text-base sm:text-lg font-extrabold">
                {stats.memoryUsageMb} MB / {stats.totalMemoryMb} MB
              </p>
              <div className="w-full h-1.5 bg-zinc-500/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(stats.memoryUsageMb / stats.totalMemoryMb) * 100}%` }}
                ></div>
              </div>
            </GlassCard>

            {/* Uptime Card */}
            <GlassCard className="!p-3.5 border border-zinc-500/20">
              <div className="flex items-center gap-2 text-xs font-bold opacity-70 mb-1">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Server Uptime</span>
              </div>
              <p className="text-base sm:text-lg font-extrabold">{formatUptime(stats.uptimeSeconds)}</p>
              <p className="text-[11px] opacity-60 mt-1">Latency: {stats.youtubeLatencyMs} ms</p>
            </GlassCard>
          </div>
        ) : (
          <div className="py-8 text-center text-xs opacity-70">Loading VPS stats...</div>
        )}

        <div className="mt-5 pt-3.5 border-t border-zinc-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs opacity-70 font-medium">PoToken Generator: Active (Local InnerTube)</span>
          <PillButton
            onClick={fetchStats}
            size="sm"
            active
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            className="!px-3 !py-1 text-xs"
          >
            Refresh
          </PillButton>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Activity, RefreshCw, Server, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useBackendHealth } from '../../hooks/useBackendHealth';

interface BackendStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export const BackendStatusBadge: React.FC<BackendStatusBadgeProps> = ({
  compact = false,
  className = '',
}) => {
  const { status, latencyMs, refresh } = useBackendHealth();
  const [isOpen, setIsOpen] = useState(false);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManualChecking(true);
    await refresh();
    setTimeout(() => setIsManualChecking(false), 500);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          dotColor: 'bg-emerald-400',
          pingColor: 'bg-emerald-400/75',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgColor: 'bg-emerald-500/10',
          label: latencyMs !== null ? `Online (${latencyMs}ms)` : 'Online',
          shortLabel: latencyMs !== null ? `${latencyMs}ms` : 'Online',
          icon: CheckCircle2,
          desc: 'Intelligence engine & neural voice service operational.',
        };
      case 'waking':
        return {
          dotColor: 'bg-amber-400',
          pingColor: 'bg-amber-400/75',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgColor: 'bg-amber-500/10',
          label: 'Waking Backend...',
          shortLabel: 'Waking...',
          icon: AlertTriangle,
          desc: 'Render free tier spins down on idle. Cold start takes ~20-30 seconds.',
        };
      case 'offline':
        return {
          dotColor: 'bg-rose-500',
          pingColor: 'bg-rose-500/75',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          bgColor: 'bg-rose-500/10',
          label: 'Offline (Click to retry)',
          shortLabel: 'Offline',
          icon: XCircle,
          desc: 'Could not connect to FastAPI server. Click retry to reconnect.',
        };
      default:
        return {
          dotColor: 'bg-sky-400',
          pingColor: 'bg-sky-400/75',
          textColor: 'text-sky-400',
          borderColor: 'border-sky-500/30',
          bgColor: 'bg-sky-500/10',
          label: 'Checking...',
          shortLabel: 'Checking',
          icon: Activity,
          desc: 'Testing backend connection latency...',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Interactive Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer select-none backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] ${config.bgColor} ${config.borderColor} shadow-sm`}
        title={`Backend status: ${status}. Click for diagnostic details.`}
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2">
          {status === 'online' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pingColor}`}
            />
          )}
          {status === 'waking' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pingColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>

        <span className={`text-[11px] font-mono font-medium tracking-tight ${config.textColor}`}>
          {compact ? config.shortLabel : config.label}
        </span>
      </button>

      {/* Sleek Glass Diagnostics Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl shadow-2xl z-[80] text-left text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white tracking-tight">Backend Diagnostics</span>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isManualChecking}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Ping backend now"
            >
              <RefreshCw className={`w-3 h-3 ${isManualChecking ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className={`inline-flex items-center gap-1 font-semibold ${config.textColor}`}>
                <IconComponent className="w-3 h-3" />
                {status.toUpperCase()}
              </span>
            </div>

            {latencyMs !== null && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Latency</span>
                <span className="text-emerald-400 font-semibold">{latencyMs} ms</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

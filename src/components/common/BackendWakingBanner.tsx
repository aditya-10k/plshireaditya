import React, { useState } from 'react';
import { Loader2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useBackendHealth } from '../../hooks/useBackendHealth';

export const BackendWakingBanner: React.FC = () => {
  const { status, refresh } = useBackendHealth();
  const [dismissed, setDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (dismissed || (status !== 'waking' && status !== 'offline')) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    await refresh();
    setTimeout(() => setIsRetrying(false), 500);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl backdrop-blur-xl border text-xs shadow-lg ${
          status === 'waking'
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {status === 'waking' ? (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}

          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-semibold tracking-tight">
              {status === 'waking' ? 'Waking AI Intelligence Backend' : 'Backend Connecting'}
            </span>
            <span className="text-[10px] opacity-80 truncate">
              {status === 'waking'
                ? 'Render free tier spins down when idle (~20-25s cold start). Audio & chat will activate shortly.'
                : 'Server is currently unreachable. Please check your internet or retry.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Retry connecting"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="Dismiss notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

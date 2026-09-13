import React from 'react';
import { Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full px-6 py-4 mt-auto border-t border-white/5 text-xs text-slate-400 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Powered by ideas (and free APIs)</span>
        </div>

        <div className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
          <span>Designed &amp; Built by Aditya</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 hover:scale-125 transition-transform" />
        </div>
      </div>
    </footer>
  );
};

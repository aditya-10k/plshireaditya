import React, { useState } from 'react';
import { Sun, Moon, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NavTab } from '../../types';
import { BackendStatusBadge } from '../common/BackendStatusBadge';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
}) => {
  const [caffeineCount, setCaffeineCount] = useState(3);
  const [showCaffeineTooltip, setShowCaffeineTooltip] = useState(false);

  const handleCaffeineClick = () => {
    setCaffeineCount((prev) => prev + 1);
    setShowCaffeineTooltip(true);
    setTimeout(() => setShowCaffeineTooltip(false), 2000);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.1, x: 0.9 },
      colors: ['#a855f7', '#38bdf8', '#fbbf24'],
    });
  };

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 backdrop-blur-md bg-[#080a0f]/80 border-b border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Live Status */}
        <div 
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <span className="font-semibold text-lg font-mono tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            pls hire aditya
          </span>
          <BackendStatusBadge compact={true} />
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3.5">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Built with caffeine Badge */}
          <div className="relative">
            <button
              onClick={handleCaffeineClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 text-xs text-slate-300 hover:text-white transition-all duration-200 shadow-sm group"
            >
              <span>Built with caffeine</span>
              <Coffee className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            {showCaffeineTooltip && (
              <div className="absolute top-full mt-2 right-0 px-3 py-1 bg-purple-900/90 border border-purple-400/30 rounded-lg text-[11px] text-purple-200 whitespace-nowrap shadow-lg animate-bounce">
                Cup #{caffeineCount} poured! ⚡
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

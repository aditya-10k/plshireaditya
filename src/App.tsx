import React, { useState, useEffect, useRef } from 'react';
import { ChatPage } from './pages/ChatPage';

export const App: React.FC = () => {
  const isDark = true;
  const [introPhase, setIntroPhase] = useState<'initial' | 'animateIn' | 'fadeOut' | 'done'>('initial');
  const audioPlayedRef = useRef<boolean>(false);

  // Sync dark class on html tag
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Intro animation & sound playback on site open
  useEffect(() => {
    const playAudio = () => {
      if (audioPlayedRef.current) return;
      audioPlayedRef.current = true;
      const audio = new Audio('/plshire.mp3');
      audio.play().catch(() => {
        // Autoplay policy fallback: trigger on first user gesture
        const onFirstClick = () => {
          audio.play().catch(() => {});
          window.removeEventListener('click', onFirstClick);
          window.removeEventListener('keydown', onFirstClick);
        };
        window.addEventListener('click', onFirstClick);
        window.addEventListener('keydown', onFirstClick);
      });
    };

    playAudio();

    // 1. Trigger text rising from down to center
    const timerIn = setTimeout(() => {
      setIntroPhase('animateIn');
    }, 60);

    // 2. Fade out text and black screen to reveal home page
    const timerFade = setTimeout(() => {
      setIntroPhase('fadeOut');
    }, 2200);

    // 3. Remove overlay from DOM
    const timerDone = setTimeout(() => {
      setIntroPhase('done');
    }, 3200);

    return () => {
      clearTimeout(timerIn);
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden text-slate-100"
      style={{ background: 'transparent' }}
    >
      {/* Animated Intro Screen: Black overlay, text comes from down to center, then fades out to reveal home page */}
      {introPhase !== 'done' && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ease-out pointer-events-none select-none ${
            introPhase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className={`transition-all duration-700 ease-out transform ${
              introPhase === 'initial'
                ? 'translate-y-24 opacity-0 scale-95'
                : 'translate-y-0 opacity-100 scale-100'
            }`}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-mono font-bold tracking-tight text-white flex items-center gap-3 drop-shadow-[0_0_24px_rgba(255,255,255,0.4)]">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-400 animate-ping" />
              pls hire aditya
            </h1>
          </div>
        </div>
      )}

      {/* Top-Right Header: pls hire aditya branding */}
      <header className="fixed top-5 right-6 z-50 flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border bg-slate-900/70 border-white/10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-tight text-slate-300 select-none">
            pls hire aditya
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <ChatPage isDark={isDark} />
      </main>
    </div>
  );
};

export default App;

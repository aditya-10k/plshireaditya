import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, GripHorizontal, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Message } from '../../types';
import { tts } from '../../agent/ttsAdapter';
import { useBackendHealth } from '../../hooks/useBackendHealth';

interface ChatHistoryProps {
  messages: Message[];
  isThinking?: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isThinking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(tts.isEnabled);
  const health = useBackendHealth();

  // Draggable position state (defaults to left side)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;

    const rect = cardRef.current?.getBoundingClientRect();
    const currentX = position ? position.x : (rect?.left ?? 32);
    const currentY = position ? position.y : (rect?.top ?? 120);

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentX,
      posY: currentY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const cardW = cardRef.current?.offsetWidth ?? 340;
      const cardH = cardRef.current?.offsetHeight ?? 300;

      const newX = Math.max(12, Math.min(window.innerWidth - cardW - 12, dragStartRef.current.posX + deltaX));
      const newY = Math.max(12, Math.min(window.innerHeight - cardH - 80, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition(null);
  };

  if (messages.length === 0 && !isThinking) {
    return null;
  }

  // If positioned via drag, use fixed coords. Otherwise default left dock.
  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 35,
      }
    : {};

  return (
    <div
      ref={cardRef}
      style={style}
      className={`w-full max-w-sm sm:max-w-[340px] rounded-3xl p-3.5 backdrop-blur-2xl transition-shadow duration-300 border bg-white/25 dark:bg-slate-950/25 border-white/40 dark:border-white/[0.12] shadow-[0_12px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] select-none ${
        isDragging ? 'shadow-2xl ring-2 ring-cyan-500/30' : ''
      }`}
    >
      {/* Draggable Liquid Glass Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05] dark:border-white/[0.06] px-1 cursor-grab active:cursor-grabbing group"
        title="Drag to reposition chat"
      >
        <div className="flex items-center gap-1.5">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              health.status === 'online'
                ? 'bg-emerald-400 animate-pulse'
                : health.status === 'waking'
                ? 'bg-amber-400 animate-ping'
                : health.status === 'offline'
                ? 'bg-rose-500'
                : 'bg-cyan-500 animate-pulse'
            }`}
            title={`Backend: ${health.status}${health.latencyMs !== null ? ` (${health.latencyMs}ms)` : ''}`}
          />
          <span className="text-[11px] font-medium tracking-tight text-slate-700 dark:text-slate-300">
            Aditya
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = tts.toggleSound();
              setIsSoundOn(next);
            }}
            className={`p-1 rounded-md transition-colors ${
              isSoundOn
                ? 'text-cyan-500 dark:text-cyan-400 hover:text-cyan-600'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={isSoundOn ? 'Voice audio enabled (click to mute)' : 'Voice audio muted (click to unmute)'}
          >
            {isSoundOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
          {position && (
            <button
              onClick={resetPosition}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Reset position to default"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <span
            className={`text-[10px] font-mono cursor-pointer transition-colors ${
              health.status === 'online'
                ? 'text-emerald-500/90 dark:text-emerald-400/90 hover:text-emerald-400'
                : health.status === 'waking'
                ? 'text-amber-400 hover:text-amber-300 animate-pulse'
                : health.status === 'offline'
                ? 'text-rose-400 hover:text-rose-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}
            title={`Backend is ${health.status}. Click to ping.`}
            onClick={(e) => {
              e.stopPropagation();
              health.refresh();
            }}
          >
            {health.status === 'online' && health.latencyMs !== null ? `${health.latencyMs}ms` : health.status}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="space-y-2.5 max-h-[46vh] overflow-y-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                isUser
                  ? 'bg-slate-900/60 dark:bg-white/[0.12] text-white border border-white/10 ml-auto max-w-[88%] shadow-sm'
                  : 'bg-white/40 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-black/[0.04] dark:border-white/[0.06] mr-auto max-w-[94%] shadow-sm'
              }`}
            >
              {/* Sender Tag */}
              <div className={`flex items-center gap-1 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {isUser ? 'You' : 'Aditya'}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-xs leading-relaxed whitespace-pre-line font-normal">
                {msg.text}
              </p>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-black/[0.04] dark:border-white/[0.06] mr-auto max-w-[94%] shadow-sm">
            <div className="flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400 animate-spin" />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Synthesizing...
              </span>
            </div>
            <div className="flex items-center gap-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

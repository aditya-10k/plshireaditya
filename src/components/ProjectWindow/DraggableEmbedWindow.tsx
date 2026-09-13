import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2, ExternalLink, RotateCw, Download, Mail, FileText } from 'lucide-react';

interface DraggableEmbedWindowProps {
  url?: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DraggableEmbedWindow: React.FC<DraggableEmbedWindowProps> = ({
  url = 'https://doyoularp.vercel.app/',
  title = 'Larp Detector — doyoularp.vercel.app',
  isOpen,
  onClose,
}) => {
  // Compact, smaller window size
  const [size, setSize] = useState<{ width: number; height: number }>(() => {
    const compactW = Math.min(580, Math.max(380, Math.floor(window.innerWidth * 0.44)));
    const compactH = Math.min(460, Math.max(340, Math.floor(window.innerHeight * 0.58)));
    return { width: compactW, height: compactH };
  });

  // Position: Centre-Right side
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const compactW = Math.min(580, Math.max(380, Math.floor(window.innerWidth * 0.44)));
    const compactH = Math.min(460, Math.max(340, Math.floor(window.innerHeight * 0.58)));
    const rightX = Math.max(20, window.innerWidth - compactW - 28);
    const centerY = Math.max(30, Math.floor((window.innerHeight - compactH) / 2.2));
    return { x: rightX, y: centerY };
  });

  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const prevSizeRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });
  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number }>({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
  });

  // Reset to centre-right with fresh animation whenever opened
  useEffect(() => {
    if (isOpen && !isMaximized) {
      const compactW = Math.min(580, Math.max(380, Math.floor(window.innerWidth * 0.44)));
      const compactH = Math.min(460, Math.max(340, Math.floor(window.innerHeight * 0.58)));
      const rightX = Math.max(20, window.innerWidth - compactW - 28);
      const centerY = Math.max(30, Math.floor((window.innerHeight - compactH) / 2.2));
      setSize({ width: compactW, height: compactH });
      setPosition({ x: rightX, y: centerY });
    }
  }, [isOpen]);

  // Dragging logic
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button, a')) return;

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  // Resizing logic
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaximized) return;

    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;

        const newX = Math.max(10, Math.min(window.innerWidth - size.width - 10, dragStartRef.current.posX + deltaX));
        const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));

        setPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.startX;
        const deltaY = e.clientY - resizeStartRef.current.startY;

        const newW = Math.max(360, Math.min(window.innerWidth - position.x - 16, resizeStartRef.current.startW + deltaX));
        const newH = Math.max(280, Math.min(window.innerHeight - position.y - 16, resizeStartRef.current.startH + deltaY));

        setSize({ width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position.x, position.y, size.width]);

  const toggleMaximize = () => {
    if (!isMaximized) {
      prevSizeRef.current = { x: position.x, y: position.y, width: size.width, height: size.height };
      setPosition({ x: 16, y: 16 });
      setSize({ width: window.innerWidth - 32, height: window.innerHeight - 32 });
      setIsMaximized(true);
    } else if (prevSizeRef.current) {
      setPosition({ x: prevSizeRef.current.x, y: prevSizeRef.current.y });
      setSize({ width: prevSizeRef.current.width, height: prevSizeRef.current.height });
      setIsMaximized(false);
    }
  };

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes windowPopEntrance {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .window-animate-in {
          animation: windowPopEntrance 0.36s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center right;
        }
      `}</style>

      <div
        className={`fixed z-40 flex flex-col rounded-3xl overflow-hidden backdrop-blur-3xl transition-shadow duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_1px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/20 dark:border-white/10 bg-slate-900/95 dark:bg-slate-950/95 ${
          !isDragging && !isResizing ? 'window-animate-in' : ''
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          userSelect: isDragging || isResizing ? 'none' : 'auto',
        }}
      >
        {/* Window Titlebar (Draggable Handle) */}
        <div
          onMouseDown={handleMouseDownHeader}
          className={`flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 dark:bg-slate-900/80 border-b border-white/10 select-none ${
            isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          {/* Left: Traffic Dots & Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-2.5 h-2.5 rounded-full bg-rose-500 hover:brightness-110 flex items-center justify-center transition-all group"
                title="Close window"
              >
                <X className="w-1.5 h-1.5 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={toggleMaximize}
                className="w-2.5 h-2.5 rounded-full bg-amber-500 hover:brightness-110 flex items-center justify-center transition-all group"
                title="Minimize/Restore"
              >
                <Minus className="w-1.5 h-1.5 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={toggleMaximize}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 hover:brightness-110 flex items-center justify-center transition-all group"
                title="Maximize"
              >
                {isMaximized ? (
                  <Minimize2 className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Maximize2 className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-200 tracking-tight">
                {title}
              </span>
            </div>
          </div>

          {/* Center: Minimalist URL Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/30 border border-white/5 text-[10px] font-mono text-slate-400">
            <span className="truncate max-w-[160px]">{url}</span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={reloadIframe}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Reload"
            >
              <RotateCw className="w-3 h-3" />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-0.5"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Window Body: Either rich preview for social links (GitHub/LinkedIn) or responsive iframe for apps */}
        <div className="relative flex-1 w-full h-full bg-[#0a0d14] overflow-auto">
          {/* Invisible overlay while dragging/resizing so iframe doesn't intercept pointer */}
          {(isDragging || isResizing) && (
            <div className="absolute inset-0 z-50 cursor-grabbing" />
          )}

          {url.includes('Resume') || url.endsWith('.pdf') ? (
            <div className="p-6 text-slate-200 flex flex-col justify-between h-full overflow-y-auto">
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-lg">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Aditya Kathe — Resume
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-normal">
                        Verified PDF
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Software Engineer & AI Systems Builder • DJSCE Honors</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-white">Full Resume Document</span>
                      <span className="font-mono text-slate-400 text-[11px]">242 KB • PDF</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Complete verified history covering LangGraph agentic systems at Triponovaa, SVKM EduConnect scale, projects (MatchResume, Larp Detector, BatchShare), education at DJSCE (CGPA: 8.67), and full technical taxonomy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href="/Aditya_Kathe_Resume.pdf"
                      download="Aditya_Kathe_Resume.pdf"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-cyan-500/25 group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      Download Resume PDF
                    </a>
                    <a
                      href="mailto:katheaditya10@gmail.com?subject=Inquiry%20from%20Portfolio&body=Hi%20Aditya,%0D%0A%0D%0AI%20checked%20out%20your%203D%20AI%20portfolio%20and%20would%20love%20to%20connect%20with%20you%20regarding..."
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all group"
                    >
                      <Mail className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      Email Aditya Directly
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct contact: katheaditya10@gmail.com</span>
                <span className="font-mono text-emerald-400">Available for Opportunities</span>
              </div>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src={
                url.includes('github.com')
                  ? 'http://localhost:8000/api/proxy/github'
                  : url.includes('linkedin.com')
                  ? 'http://localhost:8000/api/proxy/linkedin'
                  : url
              }
              title={title}
              className="w-full h-full border-0 block"
              style={{ width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="eager"
              scrolling="yes"
            />
          )}
        </div>

        {/* Resize Handle (Bottom-Right Corner) */}
        {!isMaximized && (
          <div
            onMouseDown={handleMouseDownResize}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-slate-400 hover:text-white z-50 group"
            title="Drag to resize"
          >
            <svg className="w-2.5 h-2.5 stroke-current opacity-60 group-hover:opacity-100" viewBox="0 0 16 16" fill="none">
              <path d="M14 14L7 14M14 14L14 7M14 9L9 14" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

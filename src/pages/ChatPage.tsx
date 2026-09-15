import React, { useState, useEffect, useRef } from 'react';
import { UnderwaterScene, FluidTone, FluidState } from '../components/fluid/UnderwaterScene';
import { ChatHistory } from '../components/chat/ChatHistory';
import { InputBar } from '../components/chat/InputBar';
import { QuickPrompts } from '../components/chat/QuickPrompts';
import { BackendWakingBanner } from '../components/common/BackendWakingBanner';
import { DraggableEmbedWindow } from '../components/ProjectWindow/DraggableEmbedWindow';
import { getProjectManifest } from '../projects/registry';
import { queryAgent } from '../agent/mockAgent';
import { tts } from '../agent/ttsAdapter';
import { Message } from '../types';

interface ChatPageProps {
  isDark: boolean;
}

export const ChatPage: React.FC<ChatPageProps> = ({ isDark }) => {
  // Ambient simulation states
  const [fluidState, setFluidState] = useState<FluidState>('idle');
  const [fluidTone, setFluidTone] = useState<FluidTone>('calm');

  // Pop-out embed window state (centre-right)
  const [isEmbedOpen, setIsEmbedOpen] = useState<boolean>(false);
  const [embedUrl, setEmbedUrl] = useState<string>('https://doyoularp.vercel.app/');
  const [embedTitle, setEmbedTitle] = useState<string>('Larp Detector — doyoularp.vercel.app');

  // Conversation stream
  const [messages, setMessages] = useState<Message[]>([]);

  // Idle timer to return to calm state after inactivity
  const idleTimerRef = useRef<any>(null);

  const resetIdle = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setFluidState('idle');
      setFluidTone('calm');
    }, 30000);
  };

  useEffect(() => {
    setFluidState('idle');
    setFluidTone('calm');
    resetIdle();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Map agent emotion -> ambient fluid tone
  const mapEmotionToTone = (emotion?: string): FluidTone => {
    switch (emotion) {
      case 'excited':
      case 'laughing':
      case 'surprised':
        return 'excited';
      case 'thinking':
      case 'confused':
      case 'serious':
        return 'thinking';
      case 'speaking':
        return 'speaking';
      case 'curious':
      case 'skeptical':
        return 'curious';
      case 'happy':
      case 'greeting':
      case 'agreeing':
        return 'calm';
      default:
        return 'neutral';
    }
  };

  const handleSendMessage = async (text: string) => {
    resetIdle();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setFluidState('thinking');
    setFluidTone('thinking');

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const response = await queryAgent(text, historyPayload);
      const resolvedTone = mapEmotionToTone(response.emotion);
      setFluidTone(resolvedTone);

      const aiMsgId = (Date.now() + 1).toString();
      const fullText = response.text;

      // Helper to execute sidebar actions
      const executeAction = (act: any) => {
        if (act.type === 'OPEN_PROJECT') {
          const manifest = getProjectManifest(act.projectId);
          const targetUrl = act.url || manifest?.links?.live;
          const targetTitle = act.title || (manifest ? `${manifest.name} — ${manifest.subtitle || 'Live App'}` : 'Live App');
          if (targetUrl) {
            setEmbedUrl(targetUrl);
            setEmbedTitle(targetTitle);
            setIsEmbedOpen(true);
          }
        } else if (act.type === 'OPEN_LINK') {
          const targetUrl = act.url;
          const targetTitle = act.title || (act.platform ? `Aditya Kathe — ${act.platform.toUpperCase()}` : 'Profile Link');
          if (targetUrl) {
            setEmbedUrl(targetUrl);
            setEmbedTitle(targetTitle);
            setIsEmbedOpen(true);
          }
        } else if (act.type === 'DOWNLOAD_RESUME') {
          const resumeUrl = act.url || '/resumes/AdityaKathe.pdf';
          if (act.autoDownload === true) {
            try {
              const a = document.createElement('a');
              a.href = resumeUrl;
              a.download = act.filename || 'AdityaKathe.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (_) {}
          }
          setEmbedUrl(resumeUrl);
          setEmbedTitle(act.title || 'Aditya Kathe — Resume');
          setIsEmbedOpen(true);
        } else if (act.type === 'CLOSE_PROJECT') {
          setIsEmbedOpen(false);
        }
      };

      // Calculate paragraph boundaries for presentation-style window switching
      const paragraphs = fullText.split(/\n\s*\n/);
      let cumulativeLen = 0;
      const paraBoundaries = paragraphs.map((p) => {
        const start = cumulativeLen;
        cumulativeLen += p.length + 2;
        return { start, length: p.length };
      });
      const triggeredParas = new Set<number>();

      // Execute initial actions (actions without targetParagraph, or targetParagraph === 0)
      if (response.actions) {
        for (const action of response.actions as any[]) {
          if (typeof action.targetParagraph !== 'number' || action.targetParagraph === 0) {
            executeAction(action);
            triggeredParas.add(0);
          }
        }
      }

      // Synchronized speech and progressive text reveal
      const isSoundActive = tts.isEnabled && response.speech?.enabled !== false;

      if (isSoundActive) {
        let hasStarted = false;
        let fallbackTimer: any = null;
        let smoothInterval: any = null;
        let fallbackInterval: any = null;
        let displayedChars = 0;
        let targetChars = 0;

        const startSmoothTicker = () => {
          if (smoothInterval) clearInterval(smoothInterval);
          smoothInterval = setInterval(() => {
            if (displayedChars < targetChars) {
              const diff = targetChars - displayedChars;
              // Smoothly step 1 to 2 characters per 20ms tick without choppy chunk jumps
              const step = Math.max(1, Math.min(diff, Math.ceil(diff / 2.5)));
              displayedChars = Math.min(fullText.length, displayedChars + step);
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText.slice(0, displayedChars) } : m))
              );
            }
          }, 20);
        };

        const runFallbackTextStream = () => {
          if (fallbackTimer) clearTimeout(fallbackTimer);
          if (smoothInterval) clearInterval(smoothInterval);
          if (fallbackInterval) clearInterval(fallbackInterval);

          setFluidState('speaking');
          setFluidTone(resolvedTone === 'neutral' ? 'speaking' : resolvedTone);

          // Ensure the message container is created if not already
          setMessages((prev) => {
            if (!prev.some((m) => m.id === aiMsgId)) {
              return [...prev, { id: aiMsgId, sender: 'ai', text: '', timestamp: 'Just now' }];
            }
            return prev;
          });

          displayedChars = 0;
          fallbackInterval = setInterval(() => {
            displayedChars = Math.min(fullText.length, displayedChars + 2);
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText.slice(0, displayedChars) } : m))
            );
            if (displayedChars >= fullText.length) {
              clearInterval(fallbackInterval);
              fallbackInterval = null;
              setFluidState('idle');
              resetIdle();
            }
          }, 20);
        };

        // Safety timeout: only if audio fails to start after 10 seconds of buffering
        fallbackTimer = setTimeout(() => {
          if (!hasStarted) {
            hasStarted = true;
            tts.stop(); // Abort pending audio so it never plays late and clashes
            runFallbackTextStream();
          }
        }, 10000);

        tts.speak(
          fullText,
          () => {
            // onStart: Audio is actively playing through speakers
            if (fallbackTimer) {
              clearTimeout(fallbackTimer);
              fallbackTimer = null;
            }
            if (fallbackInterval) {
              clearInterval(fallbackInterval);
              fallbackInterval = null;
            }
            hasStarted = true;
            setFluidState('speaking');
            setFluidTone(resolvedTone === 'neutral' ? 'speaking' : resolvedTone);

            // Add the AI message bubble now that speech has begun
            setMessages((prev) => {
              if (!prev.some((m) => m.id === aiMsgId)) {
                return [...prev, { id: aiMsgId, sender: 'ai', text: '', timestamp: 'Just now' }];
              }
              return prev.map((m) => (m.id === aiMsgId ? { ...m, text: '' } : m));
            });

            // Start strictly from 0 so words stream in perfect synchrony with voice
            displayedChars = 0;
            const firstSpace = fullText.indexOf(' ');
            targetChars = firstSpace > 0 ? firstSpace : Math.min(fullText.length, 6);
            startSmoothTicker();
          },
          () => {
            // onEnd: Audio playback complete
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if (fallbackInterval) clearInterval(fallbackInterval);
            if (smoothInterval) clearInterval(smoothInterval);
            displayedChars = fullText.length;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText } : m))
            );
            setFluidState('idle');
            resetIdle();
          },
          () => {
            // onError: Audio playback failed
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if (smoothInterval) clearInterval(smoothInterval);
            if (!hasStarted) {
              hasStarted = true;
              runFallbackTextStream();
            } else {
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText } : m))
              );
              setFluidState('idle');
            }
          },
          (charIndex, progress) => {
            // onBoundary: Real-time playback progression from audio
            const calculatedTarget = typeof progress === 'number'
              ? Math.floor(progress * fullText.length)
              : charIndex;

            targetChars = Math.max(targetChars, Math.min(fullText.length, calculatedTarget));

            // Presentation mode: dynamically switch active project as speech transitions to next paragraph
            if (response.actions) {
              for (let pIdx = 0; pIdx < paraBoundaries.length; pIdx++) {
                if (calculatedTarget >= paraBoundaries[pIdx].start && !triggeredParas.has(pIdx)) {
                  triggeredParas.add(pIdx);
                  const matchingAction = (response.actions as any[]).find((a) => a.targetParagraph === pIdx);
                  if (matchingAction) {
                    executeAction(matchingAction);
                  }
                }
              }
            }
          }
        );
      } else {
        // Sound is muted or disabled: stream text smoothly from 0 with no delay
        setFluidState('idle');
        resetIdle();
        let displayedChars = 0;
        const aiMsg: Message = {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, aiMsg]);

        const streamInterval = setInterval(() => {
          displayedChars = Math.min(fullText.length, displayedChars + 2);
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText.slice(0, displayedChars) } : m))
          );
          if (displayedChars >= fullText.length) {
            clearInterval(streamInterval);
          }
        }, 20);
      }
    } catch (err: any) {
      setFluidState('idle');
      setFluidTone('neutral');
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: err?.message || 'Error communicating with backend engine',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <>
      {/* Layer 0: Full-screen Animated Noise Gradient */}
      <UnderwaterScene
        isDark={isDark}
        state={fluidState}
        tone={fluidTone}
      />

      {/* Layer 15: Movable, Resizable, Draggable Pop-Out Window (Centre-Right) */}
      <DraggableEmbedWindow
        url={embedUrl}
        title={embedTitle}
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
      />

      {/* Layer 2: Main Interactive Stage */}
      <div
        className="relative flex flex-col min-h-screen px-4 sm:px-8 pt-20 pb-6 justify-between"
        style={{ zIndex: 2 }}
      >
        {/* Stage Content: Draggable Liquid Glass Chat on the LEFT */}
        <div className="flex-1 flex flex-col justify-end items-start w-full max-w-7xl mx-auto pb-4">
          <ChatHistory messages={messages} isThinking={fluidState === 'thinking'} />
        </div>

        {/* Center Dock: Chatbox in the MIDDLE (No manual test button) */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-2 pt-2">
          <BackendWakingBanner />
          <InputBar
            onSendMessage={handleSendMessage}
            isListening={fluidState === 'listening'}
            setIsListening={(listening) => {
              if (listening) {
                setFluidState('listening');
                setFluidTone('thinking');
              } else {
                setFluidState('idle');
              }
            }}
            disabled={fluidState === 'thinking'}
          />
          <QuickPrompts
            onSelectPrompt={handleSendMessage}
            disabled={fluidState === 'thinking'}
          />
        </div>
      </div>
    </>
  );
};

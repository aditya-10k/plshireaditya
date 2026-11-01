import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MeetGreenRoom } from '../components/meet/MeetGreenRoom';
import { MeetStage } from '../components/meet/MeetStage';
import { MeetBottomBar } from '../components/meet/MeetBottomBar';
import { MeetChatDrawer } from '../components/meet/MeetChatDrawer';
import { MeetPeopleDrawer } from '../components/meet/MeetPeopleDrawer';
import { MeetPresentPickerModal } from '../components/meet/MeetPresentPickerModal';
import { MeetEndCallView } from '../components/meet/MeetEndCallView';
import { MeetLockShield } from '../components/meet/MeetIcons';
import { meetAudio } from '../components/meet/meetAudio';
import { useMeetVoiceInput } from '../hooks/useMeetVoiceInput';
import { useMicVisualizer } from '../hooks/useMicVisualizer';
import { queryAgent } from '../agent/mockAgent';
import { tts } from '../agent/ttsAdapter';
import { Message } from '../types';
import { API_BASE } from '../config/api';

interface ChatPageProps {
  isDark?: boolean;
}

const PROJECT_CATALOG: Record<string, { url: string; title: string; isMobile: boolean }> = {
  matchresume: {
    url: 'https://matchresumenow.vercel.app/',
    title: 'MatchResume — AI Resume Matcher',
    isMobile: false,
  },
  jackdsql: {
    url: 'https://jackdsql.web.app/',
    title: 'JackDSQL — Sandboxed SQL Assessment Engine',
    isMobile: true,
  },
  svkm_educonnect: {
    url: 'https://educonnect.svkm.ac.in/',
    title: 'SVKM EduConnect — Live App',
    isMobile: false,
  },
  batchshare: {
    url: 'https://batchsharenow.web.app/',
    title: 'BatchShare — Real-Time File Sharing',
    isMobile: false,
  },
  cricmanage: {
    url: 'https://cricmanagernow.web.app',
    title: 'CricManage — IPL Strategy Engine',
    isMobile: false,
  },
  stockresearchassistant: {
    url: 'https://stockresearchassistant.web.app/',
    title: 'Stock Research Assistant — Terminal',
    isMobile: false,
  },
  resume: {
    url: '/Aditya_Kathe_Resume.pdf',
    title: 'Aditya Kathe — Resume PDF',
    isMobile: false,
  },
};

export const ChatPage: React.FC<ChatPageProps> = () => {
  // Navigation / Call State: 'green-room' | 'in-call' | 'call-ended'
  const [meetState, setMeetState] = useState<'green-room' | 'in-call' | 'call-ended'>('green-room');

  // Audio / Video Media States (Muted by default to avoid accidental hot-mic junk picking)
  const [isVisitorMicOn, setIsVisitorMicOn] = useState<boolean>(false);
  const [isVisitorCamOn, setIsVisitorCamOn] = useState<boolean>(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState<boolean>(true);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);

  // Side Drawers & Modals
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState<boolean>(false);
  const [isPresentModalOpen, setIsPresentModalOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Screen Share Presentation State
  const [presentedProject, setPresentedProject] = useState<{
    url: string;
    title: string;
    isMobile?: boolean;
  } | null>(null);
  const [isMobileOrientation, setIsMobileOrientation] = useState<boolean>(false);

  // In-Call Messages & Subtitles
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');

  // Proactive backend health probe (ensures user never enters call while free-tier backend is cold)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'waking' | 'ready' | 'error'>('checking');
  const [wakeSeconds, setWakeSeconds] = useState<number>(0);

  const pingBackend = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        setBackendStatus('ready');
        return true;
      } else {
        setBackendStatus('waking');
      }
    } catch (_) {
      setBackendStatus('waking');
    }
    return false;
  }, []);

  useEffect(() => {
    let active = true;
    let timer: any = null;
    let secondsTimer: any = null;

    secondsTimer = setInterval(() => {
      setWakeSeconds((s) => s + 1);
    }, 1000);

    const check = async () => {
      const ok = await pingBackend();
      if (ok && active) {
        if (secondsTimer) clearInterval(secondsTimer);
        return;
      }

      timer = setInterval(async () => {
        if (!active) return;
        const success = await pingBackend();
        if (success && active) {
          if (timer) clearInterval(timer);
          if (secondsTimer) clearInterval(secondsTimer);
        }
      }, 2500);
    };

    check();

    return () => {
      active = false;
      if (timer) clearInterval(timer);
      if (secondsTimer) clearInterval(secondsTimer);
    };
  }, [pingBackend]);

  // Live microphone audio visualizer
  const { audioLevel, isVoiceDetected, stream: micStream } = useMicVisualizer(isVisitorMicOn && meetState === 'in-call');

  // Active project transition tracker during speech playback
  const projectTransitionsRef = useRef<{ key: string; index: number; activated: boolean }[]>([]);

  // Clock in top-left matching Google Meet
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter only actual Whisper silence hallucinations without filtering natural greetings
  const isJunkTranscript = (text: string): boolean => {
    const t = text.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    if (t.length < 2) return true;
    const junkPhrases = [
      'thank you',
      'thank you very much',
      'thanks for watching',
      'subtitles by',
      'amara org',
      'silence',
      'you',
    ];
    if (junkPhrases.includes(t)) return true;
    return false;
  };

  // Voice Input Hook (records visitor speech when mic is unmuted, shares existing mic stream)
  const { startListening, stopListening } = useMeetVoiceInput({
    isEnabled: isVisitorMicOn && meetState === 'in-call',
    sharedStream: micStream,
    onTranscript: (text) => {
      if (!isJunkTranscript(text)) {
        handleSendMessage(text);
      }
    },
  });

  // Automatically manage microphone listening when in call and visitor mic is on (pause while Aditya speaks to avoid echo)
  useEffect(() => {
    if (meetState === 'in-call' && isVisitorMicOn && !isSpeaking && !isThinking) {
      startListening();
    } else {
      stopListening();
    }
  }, [meetState, isVisitorMicOn, isSpeaking, isThinking]);

  // Toggle visitor microphone
  const handleToggleMic = () => {
    const next = !isVisitorMicOn;
    setIsVisitorMicOn(next);
    if (!next) {
      stopListening();
    }
  };

  // Toggle visitor camera
  const handleToggleCam = () => {
    setIsVisitorCamOn(!isVisitorCamOn);
  };

  // Start call from green room (strictly guarded until backend is live)
  const handleJoinCall = (initialPresentation?: { url: string; title: string; isMobile?: boolean }) => {
    if (backendStatus !== 'ready') return;
    meetAudio.playJoinChime();
    setMeetState('in-call');

    if (initialPresentation) {
      setPresentedProject(initialPresentation);
      setIsMobileOrientation(initialPresentation.isMobile || false);
    }

    // Trigger initial greeting from Aditya Kathe
    setTimeout(() => {
      const greetingText =
        'Hey! Can you hear me alright? Welcome to the call. I am Aditya Kathe. Feel free to ask me anything about my distributed systems, JackDSQL, MatchResume, SVKM EduConnect, or ask me to share my screen';
      speakAndRenderMessage(greetingText, undefined, 'initial_greeting');
    }, 600);
  };

  // Leave call
  const handleEndCall = () => {
    meetAudio.playLeaveChime();
    tts.stop();
    setIsSpeaking(false);
    setActiveSubtitle('');
    setPresentedProject(null);
    setMeetState('call-ended');
  };

  // Rejoin call
  const handleRejoin = () => {
    handleJoinCall();
  };

  // Return to green room
  const handleReturnHome = () => {
    setMessages([]);
    setMeetState('green-room');
  };

  // Switch to a specific catalog project
  const switchToProject = (key: string) => {
    const proj = PROJECT_CATALOG[key];
    if (proj) {
      setPresentedProject({
        url: proj.url,
        title: proj.title,
        isMobile: proj.isMobile,
      });
      setIsMobileOrientation(proj.isMobile);
    }
  };

  // Detect project mentions in text and order them by occurrence index
  const detectProjectMentions = (text: string) => {
    const lower = text.toLowerCase();
    const mentions: { key: string; index: number; activated: boolean }[] = [];

    // 1. Projects with exact regex boundary checks
    const projectRegexes: [RegExp, string][] = [
      [/\bmatchresume\b/i, 'matchresume'],
      [/\b(jackdsql|jackedsql)\b/i, 'jackdsql'],
      [/\b(educonnect|svkm)\b/i, 'svkm_educonnect'],
      [/\bbatchshare\b/i, 'batchshare'],
      [/\bcricmanage\b/i, 'cricmanage'],
      [/\b(stock\s*research|stockresearchassistant)\b/i, 'stockresearchassistant'],
    ];

    for (const [re, key] of projectRegexes) {
      const match = re.exec(lower);
      if (match) {
        mentions.push({ key, index: match.index, activated: false });
      }
    }

    // 2. Only trigger resume PDF if user explicitly asked for Aditya's resume (NOT when discussing MatchResume or resume matching)
    const hasMatchResume = mentions.some((m) => m.key === 'matchresume');
    const isExplicitResumeRequest =
      /\b(my\s*resume|aditya('s)?\s*resume|download\s*resume|view\s*resume|see\s*resume|aditya\s*kathe\s*resume|verified\s*resume|cv\s*pdf)\b/i.test(
        lower
      ) ||
      (/\b(resume|cv)\b/i.test(lower) && !hasMatchResume && !lower.includes('matchresume'));

    if (isExplicitResumeRequest) {
      const match = /\b(resume|cv)\b/i.exec(lower);
      if (match && !mentions.some((m) => m.key === 'resume')) {
        mentions.push({ key: 'resume', index: match.index, activated: false });
      }
    }

    mentions.sort((a, b) => a.index - b.index);
    return mentions;
  };

  // Speak text via neural TTS with subtitle tracking, chat stream, and synchronized project screenshare switching
  const speakAndRenderMessage = (incomingText: string, _actions?: any[], userPrompt: string = '') => {
    let fullText = incomingText;

    const isInitialGreeting = userPrompt === 'initial_greeting';

    // Screenshare should ONLY start if the user specifically asked for projects, demos, or screensharing (never on initial greeting or casual banter)
    const isProjectOrScreenshareQuery =
      !isInitialGreeting &&
      (userPrompt.toLowerCase().includes('project') ||
        userPrompt.toLowerCase().includes('showcase') ||
        userPrompt.toLowerCase().includes('work') ||
        userPrompt.toLowerCase().includes('built') ||
        userPrompt.toLowerCase().includes('demo') ||
        userPrompt.toLowerCase().includes('screen share') ||
        userPrompt.toLowerCase().includes('screenshare') ||
        userPrompt.toLowerCase().includes('share your screen') ||
        userPrompt.toLowerCase().includes('show me') ||
        userPrompt.toLowerCase().includes('walk me through') ||
        userPrompt.toLowerCase().includes('tell me about') ||
        userPrompt.toLowerCase().includes('jackdsql') ||
        userPrompt.toLowerCase().includes('matchresume') ||
        userPrompt.toLowerCase().includes('batchshare') ||
        userPrompt.toLowerCase().includes('educonnect') ||
        userPrompt.toLowerCase().includes('cricmanage') ||
        (/\b(resume|cv)\b/i.test(userPrompt) && !userPrompt.toLowerCase().includes('matchresume')));

    const hasExplicitOpenAction = (_actions || []).some(
      (a: any) => a.type === 'OPEN_PROJECT' || a.type === 'DOWNLOAD_RESUME'
    );

    const shouldStartScreenshare =
      !isInitialGreeting && (isProjectOrScreenshareQuery || hasExplicitOpenAction);

    // Only occasionally announce screen sharing when first opening, randomly varied and never forced every time
    const isAlreadyPresenting = presentedProject !== null;
    if (shouldStartScreenshare && !isAlreadyPresenting) {
      const alreadyHasSharePhrase =
        fullText.toLowerCase().includes('share my screen') ||
        fullText.toLowerCase().includes('see my screen');

      if (!alreadyHasSharePhrase && Math.random() < 0.4) {
        const casualIntros = [
          'Let me share my screen real quick... can you see my screen?',
          'Pulling this up on screen now...',
          'Let me bring this up on screen...',
          'Sharing my screen so you can see this live...',
        ];
        const randomIntro =
          casualIntros[Math.floor(Math.random() * casualIntros.length)];
        fullText = `${randomIntro} ${fullText}`;
      }
    }

    const aiMsgId = (Date.now() + 1).toString();

    // Add empty message to feed
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, sender: 'ai', text: '', timestamp: 'Just now' },
    ]);

    if (!isChatOpen) {
      setUnreadCount((c) => c + 1);
    }

    // Play subtle message chime
    meetAudio.playMessageChime();

    // Only scan and activate screenshare if user requested project discussion or explicit open action
    if (shouldStartScreenshare) {
      const mentions = detectProjectMentions(`${userPrompt} ${fullText}`);
      projectTransitionsRef.current = mentions;

      if (mentions.length > 0) {
        switchToProject(mentions[0].key);
        mentions[0].activated = true;
      }
    } else {
      projectTransitionsRef.current = [];
    }

    // Speech synthesis & synchronized streaming
    tts.speak(
      fullText,
      () => {
        // onStart
        setIsSpeaking(true);
        setActiveSubtitle(fullText.slice(0, 80));
      },
      () => {
        // onEnd
        setIsSpeaking(false);
        setActiveSubtitle('');
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText } : m))
        );
      },
      () => {
        // onError
        setIsSpeaking(false);
        setActiveSubtitle('');
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: fullText } : m))
        );
      },
      (charIndex, progress) => {
        // onBoundary: check if we reached another project mention during speech to automatically switch tabs!
        const calculatedIndex =
          typeof progress === 'number'
            ? Math.floor(progress * fullText.length)
            : charIndex;

        // Check if we should switch presentation to the next discussed project
        if (shouldStartScreenshare) {
          for (const item of projectTransitionsRef.current) {
            if (!item.activated && calculatedIndex >= item.index) {
              item.activated = true;
              switchToProject(item.key);
            }
          }
        }

        // Update progressive text in chat
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, text: fullText.slice(0, Math.max(calculatedIndex, 1)) } : m
          )
        );

        // Update closed captions window (slice nearby sentence context)
        const windowStart = Math.max(0, calculatedIndex - 20);
        const windowEnd = Math.min(fullText.length, calculatedIndex + 80);
        setActiveSubtitle(fullText.slice(windowStart, windowEnd));
      }
    );
  };

  // Send message from chat input or voice
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    // Add visitor message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);

    // Instant client-side check for stop screen share / close presentation
    const isStopScreen =
      /stop\s*(your\s*)?(screen\s*share|sharing|presentation)/i.test(trimmed) ||
      /screen\s*share\s*(stop|band|close|off|hatao|caro|karo)/i.test(trimmed) ||
      /band\s*kar\s*(o|do)\s*screen/i.test(trimmed) ||
      /screen\s*band/i.test(trimmed);

    if (isStopScreen) {
      setPresentedProject(null);
      const isHindi = /\b(caro|karo|na|bhai|band|hatao|rok)\b/i.test(trimmed);
      const reply = isHindi
        ? 'Haan bhai, screen share stop kar diya.'
        : 'Sure, let me stop sharing my screen.';
      speakAndRenderMessage(reply, [{ type: 'CLOSE_PROJECT' }], trimmed);
      return;
    }

    setIsThinking(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await queryAgent(trimmed, historyPayload);
      setIsThinking(false);

      // Handle actions returned by agent
      if (response.actions) {
        for (const act of response.actions) {
          if (act.type === 'CLOSE_PROJECT') {
            setPresentedProject(null);
          }
        }
      }

      speakAndRenderMessage(response.text, response.actions, trimmed);
    } catch (err: any) {
      setIsThinking(false);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: err?.message || 'Error communicating with backend service',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Quick prompt selection (e.g. from Hand Raise or Chat Carousel)
  const handleSelectPrompt = (prompt: string) => {
    setIsHandRaised(false);
    handleSendMessage(prompt);
  };

  // Toggle in-call chat drawer
  const handleToggleChat = () => {
    const next = !isChatOpen;
    setIsChatOpen(next);
    if (next) {
      setUnreadCount(0);
      setIsPeopleOpen(false);
    }
  };

  // Toggle people drawer
  const handleTogglePeople = () => {
    const next = !isPeopleOpen;
    setIsPeopleOpen(next);
    if (next) {
      setIsChatOpen(false);
    }
  };

  // 1. GREEN ROOM SCREEN (Matching Image 5)
  if (meetState === 'green-room') {
    return (
      <MeetGreenRoom
        onJoin={() => handleJoinCall()}
        isMicOn={isVisitorMicOn}
        setIsMicOn={setIsVisitorMicOn}
        isCamOn={isVisitorCamOn}
        setIsCamOn={setIsVisitorCamOn}
        backendStatus={backendStatus}
        wakeSeconds={wakeSeconds}
        onRetryBackend={pingBackend}
      />
    );
  }

  // 2. CALL ENDED SCREEN (Matching Image 4)
  if (meetState === 'call-ended') {
    return (
      <MeetEndCallView
        onRejoin={handleRejoin}
        onReturnHome={handleReturnHome}
      />
    );
  }

  // 3. ACTIVE IN-CALL EXPERIENCE
  return (
    <div className="h-screen w-full bg-[#121212] text-white flex flex-col justify-between overflow-hidden selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      {/* Top Meeting Bar: 56px */}
      <header className="h-14 shrink-0 px-5 sm:px-8 flex items-center justify-between z-30 select-none bg-transparent">
        {/* Left Info: Time | hire-adi-tya [orange shield] */}
        <div className="flex items-center gap-2.5 text-xs text-white">
          <span className="font-medium text-slate-200">{timeStr || '3:00 PM'}</span>
          <span className="text-slate-500 font-light">|</span>
          <span className="font-mono text-slate-200">hire-adi-tya</span>
          <MeetLockShield />
        </div>

        {/* Right Info: Circular avatar with 2 participant count */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#282a2d] border border-white/5 text-xs text-white">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20">
              <img
                src="/meet-user-avatar.png"
                alt="Aditya"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-mono text-[11px] text-slate-300">2</span>
          </div>
        </div>
      </header>

      {/* Main Viewport: Stage on Left + In-Flow Drawer on Right (smoothly resizes main stage) */}
      <div className="flex-1 min-h-0 w-full flex flex-row overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3">
        {/* Left/Main Stage: Takes 100% of remaining width and height */}
        <div className="flex-1 min-w-0 h-full flex items-center justify-center overflow-hidden">
          <MeetStage
            isSpeaking={isSpeaking}
            activeSubtitle={activeSubtitle}
            isCaptionsOn={isCaptionsOn}
            isVisitorCamOn={isVisitorCamOn}
            isVisitorMicOn={isVisitorMicOn}
            audioLevel={audioLevel}
            isVoiceDetected={isVoiceDetected}
            presentedProject={presentedProject}
            onToggleMobileOrientation={() => setIsMobileOrientation(!isMobileOrientation)}
            isMobileOrientation={isMobileOrientation}
          />
        </div>

        {/* Right Drawer (Desktop in-flow): smoothly resizes the main stage when opened */}
        {(isChatOpen || isPeopleOpen) && (
          <div className="hidden sm:flex w-[360px] shrink-0 h-full overflow-hidden">
            {isChatOpen && (
              <MeetChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={messages}
                onSendMessage={handleSendMessage}
                isThinking={isThinking}
                onSelectPrompt={handleSelectPrompt}
                inFlow={true}
              />
            )}
            {isPeopleOpen && (
              <MeetPeopleDrawer
                isOpen={isPeopleOpen}
                onClose={() => setIsPeopleOpen(false)}
                isAdityaSpeaking={isSpeaking}
                isVisitorMicOn={isVisitorMicOn}
                isVoiceDetected={isVoiceDetected}
                inFlow={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Mobile Overlay Drawers (for screens below sm) */}
      {isChatOpen && (
        <MeetChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
          onSelectPrompt={handleSelectPrompt}
          inFlow={false}
        />
      )}
      {isPeopleOpen && (
        <MeetPeopleDrawer
          isOpen={isPeopleOpen}
          onClose={() => setIsPeopleOpen(false)}
          isAdityaSpeaking={isSpeaking}
          isVisitorMicOn={isVisitorMicOn}
          isVoiceDetected={isVoiceDetected}
          inFlow={false}
        />
      )}

      {/* Bottom Meeting Controls Dock: 80px */}
      <MeetBottomBar
        timeStr={timeStr}
        isMicOn={isVisitorMicOn}
        onToggleMic={handleToggleMic}
        audioLevel={audioLevel}
        isVoiceDetected={isVoiceDetected}
        isCamOn={isVisitorCamOn}
        onToggleCam={handleToggleCam}
        isCaptionsOn={isCaptionsOn}
        onToggleCaptions={() => setIsCaptionsOn(!isCaptionsOn)}
        isHandRaised={isHandRaised}
        onToggleHand={() => {
          const next = !isHandRaised;
          setIsHandRaised(next);
          if (next) {
            handleSendMessage('Walk me through your key engineering projects');
          }
        }}
        onPresentClick={() => setIsPresentModalOpen(true)}
        onEndCall={handleEndCall}
        isChatOpen={isChatOpen}
        onToggleChat={handleToggleChat}
        isPeopleOpen={isPeopleOpen}
        onTogglePeople={handleTogglePeople}
        unreadCount={unreadCount}
      />

      {/* Present Screen Picker Modal */}
      <MeetPresentPickerModal
        isOpen={isPresentModalOpen}
        onClose={() => setIsPresentModalOpen(false)}
        onSelectProject={(url, title, isMobile) => {
          setPresentedProject({ url, title, isMobile });
          setIsMobileOrientation(Boolean(isMobile));
        }}
      />
    </div>
  );
};

export default ChatPage;

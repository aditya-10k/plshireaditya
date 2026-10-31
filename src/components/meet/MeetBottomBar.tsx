import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  MonitorUp,
  Hand,
  Users,
} from 'lucide-react';

interface MeetBottomBarProps {
  timeStr?: string;
  isMicOn: boolean;
  onToggleMic: () => void;
  audioLevel?: number;
  isVoiceDetected?: boolean;
  isCamOn: boolean;
  onToggleCam: () => void;
  isCaptionsOn: boolean;
  onToggleCaptions: () => void;
  isHandRaised: boolean;
  onToggleHand: () => void;
  onPresentClick: () => void;
  onEndCall: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isPeopleOpen: boolean;
  onTogglePeople: () => void;
  unreadCount: number;
}

export const MeetBottomBar: React.FC<MeetBottomBarProps> = ({
  timeStr,
  isMicOn,
  onToggleMic,
  audioLevel = 0,
  isVoiceDetected = false,
  isCamOn,
  onToggleCam,
  isCaptionsOn,
  onToggleCaptions,
  isHandRaised,
  onToggleHand,
  onPresentClick,
  onEndCall,
  isChatOpen,
  onToggleChat,
  isPeopleOpen,
  onTogglePeople,
  unreadCount,
}) => {
  return (
    <footer className="w-full h-20 bg-[#121212] px-4 sm:px-6 flex items-center justify-between z-40 select-none shrink-0 border-t border-white/5">
      {/* Left Corner: Live Time Clock & Meeting Code (hidden on mobile to prevent overflow) */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-medium">
        <span>{timeStr || '3:00 PM'}</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-slate-200">hire-adi-tya</span>
      </div>

      {/* Center Pill Dock: strictly functional and responsive controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 bg-[#282a2d] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/5 shadow-2xl">
        {/* Microphone Toggle with Live Audio Level Wave Visualizer */}
        <div className="relative flex items-center">
          <button
            onClick={onToggleMic}
            className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
              isMicOn
                ? isVoiceDetected
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                  : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
            }`}
            title={isMicOn ? 'Turn off microphone' : 'Turn on microphone (Speak to Aditya)'}
          >
            {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}

            {/* Live pulsing waveform ring when speech is detected */}
            {isMicOn && isVoiceDetected && (
              <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none duration-700" />
            )}
          </button>

          {/* Live Audio Visualizer Bars when Mic is Unmuted */}
          {isMicOn && (
            <div
              className="hidden sm:flex items-center gap-0.5 ml-2 px-1.5 py-1 rounded-md bg-black/40 border border-white/10"
              title="Microphone input volume"
            >
              {[0.3, 0.7, 1.0, 0.6].map((scale, i) => {
                const height = Math.max(3, Math.min(16, audioLevel * 18 * scale + 3));
                return (
                  <span
                    key={i}
                    style={{ height: `${height}px` }}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isVoiceDetected ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCam}
          className={`w-9 h-9 sm:w-11 sm:h-10 rounded-full sm:rounded-2xl flex items-center justify-center transition-all ${
            isCamOn
              ? 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
              : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
          }`}
          title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCamOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
        </button>

        {/* Present Screen / Projects Button */}
        <button
          onClick={onPresentClick}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          title="Present a project or document"
        >
          <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Captions (CC) Toggle */}
        <button
          onClick={onToggleCaptions}
          className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center text-xs font-bold transition-all ${
            isCaptionsOn
              ? 'bg-[#8ab4f8] text-[#202124]'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={isCaptionsOn ? 'Turn off subtitles' : 'Turn on subtitles'}
        >
          CC
        </button>

        {/* Raise Hand Toggle (prompts key engineering highlights) */}
        <button
          onClick={onToggleHand}
          className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-all ${
            isHandRaised
              ? 'bg-[#fbbc04] text-[#202124]'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={isHandRaised ? 'Lower hand' : 'Raise hand (Ask key project question)'}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* Red End Call Pill */}
        <button
          onClick={onEndCall}
          className="w-12 sm:w-16 h-9 sm:h-10 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center justify-center shadow-md transition-all ml-0.5 sm:ml-1"
          title="Leave meeting"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Right Corner: In-Call Messages & People in Call */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Chat Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative p-2 sm:p-2.5 rounded-full transition-colors ${
            isChatOpen ? 'bg-white/15 text-[#8ab4f8]' : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
          title="In-call messages"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#8ab4f8] ring-2 ring-[#121212]" />
          )}
        </button>

        {/* People in call Toggle */}
        <button
          onClick={onTogglePeople}
          className={`p-2 sm:p-2.5 rounded-full transition-colors ${
            isPeopleOpen ? 'bg-white/15 text-[#8ab4f8]' : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
          title="People in call"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </footer>
  );
};

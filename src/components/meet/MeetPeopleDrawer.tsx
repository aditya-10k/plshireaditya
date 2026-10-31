import React, { useState } from 'react';
import { X, Search, MoreVertical, Mic, MicOff, Volume2 } from 'lucide-react';

interface MeetPeopleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdityaSpeaking: boolean;
  isVisitorMicOn: boolean;
  isVoiceDetected?: boolean;
  inFlow?: boolean;
}

export const MeetPeopleDrawer: React.FC<MeetPeopleDrawerProps> = ({
  isOpen,
  onClose,
  isAdityaSpeaking,
  isVisitorMicOn,
  isVoiceDetected = false,
  inFlow = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <aside
      className={
        inFlow
          ? 'h-full w-full bg-[#1e1f20] rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-hidden select-none font-sans'
          : 'fixed inset-0 sm:hidden z-50 bg-[#1e1f20] flex flex-col justify-between select-none font-sans'
      }
    >
      {/* Header matching Photo 3 */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <h2 className="text-base font-normal text-white tracking-tight">People</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close people drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Drawer Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 space-y-4">
        {/* Search Input Box */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#282a2d] border border-white/5 focus-within:border-[#8ab4f8]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for people"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Section: IN THE MEETING */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            In the meeting
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 font-medium py-0.5">
            <span>Contributors</span>
            <span className="font-mono">2</span>
          </div>

          {/* Participant 1: Aditya Kathe */}
          <div className="flex items-center justify-between py-2 px-2 hover:bg-white/[0.03] rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 shadow-sm">
                <img
                  src="/meet-user-avatar.png"
                  alt="Aditya Kathe"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-white tracking-tight">
                  Aditya Kathe
                </div>
                <div className="text-[11px] text-slate-400">Meeting host • Systems Builder</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              {isAdityaSpeaking ? (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-slate-400" />
              )}
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Participant 2: You (Guest) */}
          <div className="flex items-center justify-between py-2 px-2 hover:bg-white/[0.03] rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-700/80 border border-cyan-400/30 flex items-center justify-center text-xs font-semibold text-white">
                Y
              </div>
              <div>
                <div className="text-sm font-medium text-white tracking-tight">
                  You (Guest)
                </div>
                <div className="text-[11px] text-slate-400">Interviewer / Engineering Reviewer</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              {isVisitorMicOn ? (
                <Mic
                  className={`w-4 h-4 ${
                    isVoiceDetected ? 'text-emerald-400 animate-pulse' : 'text-emerald-500'
                  }`}
                />
              ) : (
                <MicOff className="w-4 h-4 text-rose-400" />
              )}
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Candidate Profile Summary */}
        <div className="p-3.5 rounded-2xl bg-[#282a2d] border border-white/5 space-y-1.5 mt-3 text-xs text-slate-300">
          <div className="font-medium text-white text-sm">Verified Candidate Profile</div>
          <div className="text-slate-400 text-xs">Aditya Kathe • DJSCE Honors (CGPA: 8.67)</div>
          <div className="text-slate-400 text-xs pt-1 leading-relaxed">
            Tech Stack: Java 17, Spring Boot 3, Python, Go, RabbitMQ, Redis, PostgreSQL, pgvector
          </div>
        </div>
      </div>
    </aside>
  );
};

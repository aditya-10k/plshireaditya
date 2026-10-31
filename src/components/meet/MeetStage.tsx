import React, { useRef, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  ExternalLink,
  Mic,
  MicOff,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface MeetStageProps {
  isSpeaking: boolean;
  activeSubtitle: string;
  isCaptionsOn: boolean;
  isVisitorCamOn: boolean;
  isVisitorMicOn: boolean;
  audioLevel?: number;
  isVoiceDetected?: boolean;
  presentedProject: {
    url: string;
    title: string;
    isMobile?: boolean;
  } | null;
  onToggleMobileOrientation?: () => void;
  isMobileOrientation?: boolean;
}

export const MeetStage: React.FC<MeetStageProps> = ({
  isSpeaking,
  activeSubtitle,
  isCaptionsOn,
  isVisitorCamOn,
  isVisitorMicOn,
  audioLevel = 0,
  isVoiceDetected = false,
  presentedProject,
  onToggleMobileOrientation,
  isMobileOrientation = false,
}) => {
  const visitorVideoRef = useRef<HTMLVideoElement | null>(null);
  const visitorStreamRef = useRef<MediaStream | null>(null);

  // Manage visitor camera stream
  useEffect(() => {
    let active = true;
    const startCam = async () => {
      try {
        if (isVisitorCamOn) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
            audio: false,
          });
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          visitorStreamRef.current = stream;
          if (visitorVideoRef.current) {
            visitorVideoRef.current.srcObject = stream;
          }
        } else {
          if (visitorStreamRef.current) {
            visitorStreamRef.current.getTracks().forEach((t) => t.stop());
            visitorStreamRef.current = null;
          }
          if (visitorVideoRef.current) {
            visitorVideoRef.current.srcObject = null;
          }
        }
      } catch (_) {}
    };

    startCam();

    return () => {
      active = false;
      if (visitorStreamRef.current) {
        visitorStreamRef.current.getTracks().forEach((t) => t.stop());
        visitorStreamRef.current = null;
      }
    };
  }, [isVisitorCamOn]);

  const hasPresentation = presentedProject !== null;
  const isSVKM = presentedProject?.url.includes('educonnect.svkm.ac.in');
  const isPDF = presentedProject?.url.toLowerCase().includes('.pdf');

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-3 select-none overflow-hidden">
      {hasPresentation ? (
        /* SCREEN SHARE PRESENTATION LAYOUT */
        <div className="relative w-full h-full flex flex-col rounded-2xl sm:rounded-3xl bg-[#1e1f20] border border-white/10 overflow-hidden shadow-2xl">
          {/* Top Bar with Presenting Indicator (NO stop button for user since Aditya is presenting) */}
          <div className="w-full px-4 sm:px-6 py-2.5 bg-[#282a2d] border-b border-white/[0.08] flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-white truncate">
                Aditya Kathe is presenting • {presentedProject.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onToggleMobileOrientation && (
                <button
                  onClick={onToggleMobileOrientation}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                    isMobileOrientation
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title={isMobileOrientation ? 'Switch to desktop orientation' : 'Switch to mobile orientation'}
                >
                  {isMobileOrientation ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isMobileOrientation ? 'Mobile view' : 'Desktop view'}</span>
                </button>
              )}

              <a
                href={presentedProject.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Presentation Main Viewport: Fills 100% of remaining height */}
          <div className="relative flex-1 min-h-0 w-full bg-[#0d1117] flex items-center justify-center overflow-hidden p-2 sm:p-4">
            <div
              className={`transition-all duration-300 h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0d14] flex flex-col ${
                isMobileOrientation
                  ? 'w-full max-w-[395px] max-h-full aspect-[9/19]'
                  : 'w-full h-full'
              }`}
            >
              {isSVKM ? (
                /* Rich Interactive SVKM EduConnect Showcase (to bypass external X-Frame-Options blocking) */
                <div className="w-full h-full p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-[#0c192c] via-[#101e38] to-[#0a1220] text-white overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
                          <GraduationCap className="w-7 h-7" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            SVKM EduConnect
                          </h2>
                          <p className="text-xs text-blue-300">
                            Enterprise School Communication & Administration Platform
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://educonnect.svkm.ac.in/"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg"
                      >
                        <span>Open Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                      <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10">
                        <div className="text-2xl font-bold text-cyan-400">1,000+</div>
                        <div className="text-xs text-slate-400 mt-0.5">Mobile App Downloads</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10">
                        <div className="text-2xl font-bold text-emerald-400">40+</div>
                        <div className="text-xs text-slate-400 mt-0.5">Faculty Profiles Managed</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/10">
                        <div className="text-2xl font-bold text-amber-400">iOS & Android</div>
                        <div className="text-xs text-slate-400 mt-0.5">Cross-Platform Flutter & FCM</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-400" /> Key Engineering Architecture
                      </div>
                      <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside">
                        <li>High-throughput real-time messaging pipeline built on WebSockets & Firebase Cloud Messaging (FCM)</li>
                        <li>Automated student attendance tracking, leave sanctioning, and verified teacher appointment workflows</li>
                        <li>Unified broadcast notices and digital diary features replacing manual administrative paperwork</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 text-xs text-slate-400 flex items-center justify-between border-t border-white/10">
                    <span>Host Domain: educonnect.svkm.ac.in</span>
                    <span className="text-emerald-400 font-mono">Production Deployed</span>
                  </div>
                </div>
              ) : isPDF ? (
                /* PDF Viewer Embed with local file */
                <object
                  data="/Aditya_Kathe_Resume.pdf#toolbar=0"
                  type="application/pdf"
                  className="w-full h-full block"
                >
                  <iframe
                    src="/Aditya_Kathe_Resume.pdf#toolbar=0"
                    title={presentedProject.title}
                    className="w-full h-full border-0 block"
                  />
                </object>
              ) : (
                /* Live Demo Web Application iframe */
                <iframe
                  src={presentedProject.url}
                  title={presentedProject.title}
                  className="w-full h-full border-0 block"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="eager"
                />
              )}
            </div>

            {/* DOCKED PARTICIPANT TILES IN PRESENTATION: Aditya Kathe + You */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-30 flex flex-row sm:flex-col gap-1.5 sm:gap-2">
              {/* Tile 1: Aditya Kathe */}
              <div className="w-24 sm:w-40 md:w-44 aspect-video rounded-lg sm:rounded-xl bg-[#48161b] border border-white/20 shadow-2xl overflow-hidden relative flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {isSpeaking && (
                    <span className="absolute -inset-1.5 sm:-inset-2.5 rounded-full bg-emerald-400/40 animate-ping duration-1000" />
                  )}
                  <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-white/30 sm:border-2 shadow-lg relative z-10">
                    <img
                      src="/meet-user-avatar.png"
                      alt="Aditya Kathe"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute bottom-1 left-1.5 sm:bottom-1.5 sm:left-2 text-[9px] sm:text-xs font-medium text-white tracking-tight drop-shadow-md truncate max-w-[80px] sm:max-w-none">
                  Aditya Kathe
                </div>
              </div>

              {/* Tile 2: You (Guest User) */}
              <div className="w-24 sm:w-40 md:w-44 aspect-video rounded-lg sm:rounded-xl bg-[#1e1f20] border border-white/20 shadow-2xl overflow-hidden relative flex items-center justify-center">
                {isVisitorCamOn ? (
                  <video
                    ref={visitorVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="relative flex items-center justify-center">
                    {isVisitorMicOn && isVoiceDetected && (
                      <span className="absolute -inset-1.5 rounded-full bg-emerald-400/30 animate-ping duration-700" />
                    )}
                    <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-cyan-700/80 border border-cyan-400/30 flex items-center justify-center text-[11px] sm:text-xs font-bold text-white shadow-md">
                      Y
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1.5 sm:bottom-1.5 sm:left-2 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-medium text-white tracking-tight drop-shadow-md">
                  <span>You</span>
                  {isVisitorMicOn ? (
                    <span
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        isVoiceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                  ) : (
                    <MicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD 2-PARTICIPANT GOOGLE MEET GRID: Aditya Kathe + You */
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-3 overflow-hidden">
          {/* Tile 1: Aditya Kathe (Deep Wine / Maroon matching Google Meet) */}
          <div className="relative flex-1 w-full h-full rounded-2xl sm:rounded-3xl bg-[#48161b] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center min-h-0">
            {/* Subtle Lighting */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Speaking Waveform Rings & Avatar */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {isSpeaking && (
                  <>
                    <span className="absolute w-32 sm:w-48 h-32 sm:h-48 rounded-full border-2 border-emerald-400/40 animate-ping duration-1000" />
                    <span className="absolute w-44 sm:w-60 h-44 sm:h-60 rounded-full border border-cyan-400/20 animate-pulse duration-700" />
                  </>
                )}
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl relative z-10 bg-slate-800">
                  <img
                    src="/meet-user-avatar.png"
                    alt="Aditya Kathe"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Name Label */}
            <div className="absolute bottom-4 left-5 z-20 flex items-center gap-2 text-xs sm:text-sm font-medium text-white tracking-tight drop-shadow-md">
              <span>Aditya Kathe</span>
              {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          </div>

          {/* Tile 2: You (Guest Interviewer Tile - ALWAYS present) */}
          <div className="relative flex-1 w-full h-full rounded-2xl sm:rounded-3xl bg-[#1e1f20] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center min-h-0">
            {isVisitorCamOn ? (
              <video
                ref={visitorVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {isVisitorMicOn && isVoiceDetected && (
                    <span className="absolute w-28 sm:w-40 h-28 sm:h-40 rounded-full border-2 border-emerald-400/40 animate-ping duration-700" />
                  )}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#1557b0] border-2 border-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-2xl">
                    Y
                  </div>
                </div>
                {isVisitorMicOn && isVoiceDetected && (
                  <span className="mt-3 text-xs text-emerald-400 font-medium animate-pulse">
                    Speaking...
                  </span>
                )}
              </div>
            )}

            {/* User Label & Mic Status Badge */}
            <div className="absolute bottom-4 left-5 z-20 flex items-center gap-2 text-xs sm:text-sm font-medium text-white tracking-tight drop-shadow-md">
              <span>You</span>
              <div
                className={`p-1 rounded-full ${
                  isVisitorMicOn
                    ? isVoiceDetected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#3c4043] text-emerald-400'
                    : 'bg-[#ea4335] text-white'
                }`}
                title={isVisitorMicOn ? 'Microphone on' : 'Microphone muted'}
              >
                {isVisitorMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </div>
              {isVisitorMicOn && (
                <div className="flex items-center gap-0.5 ml-0.5">
                  {[0.4, 0.8, 1.0].map((s, idx) => (
                    <span
                      key={idx}
                      style={{ height: `${Math.max(3, Math.min(12, audioLevel * 14 * s + 3))}px` }}
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        isVoiceDetected ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CLOSED CAPTIONS (CC) OVERLAY */}
      {isCaptionsOn && activeSubtitle && (
        <div className="absolute bottom-4 left-4 right-4 z-30 flex justify-center pointer-events-none">
          <div className="max-w-2xl px-5 py-2.5 rounded-xl bg-black/85 backdrop-blur-md text-white text-xs sm:text-sm font-sans text-center leading-relaxed shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="font-semibold text-emerald-400 mr-1.5">[Aditya Kathe]:</span>
            <span className="text-slate-100">{activeSubtitle}</span>
          </div>
        </div>
      )}
    </div>
  );
};

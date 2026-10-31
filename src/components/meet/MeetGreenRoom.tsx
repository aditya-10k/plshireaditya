import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  FileText,
  Mail,
} from 'lucide-react';

interface MeetGreenRoomProps {
  onJoin: () => void;
  isMicOn: boolean;
  setIsMicOn: (on: boolean) => void;
  isCamOn: boolean;
  setIsCamOn: (on: boolean) => void;
}

export const MeetGreenRoom: React.FC<MeetGreenRoomProps> = ({
  onJoin,
  isMicOn,
  setIsMicOn,
  isCamOn,
  setIsCamOn,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manage webcam stream when camera is toggled
  useEffect(() => {
    let active = true;

    const startMedia = async () => {
      try {
        if (isCamOn) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
            audio: false,
          });
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      } catch (_) {
        setIsCamOn(false);
      }
    };

    startMedia();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isCamOn, setIsCamOn]);

  return (
    <div className="min-h-screen w-full bg-white text-[#202124] flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-900 font-sans">
      {/* Top Header: Favicon Logo on Left + Candidate Socials on Right */}
      <header className="w-full px-4 sm:px-10 py-3.5 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <img
            src="/favicon.png"
            alt="Aditya Kathe"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain"
          />
          <span className="text-[18px] sm:text-[20px] font-normal tracking-tight text-[#5f6368]">
            Google <span className="text-[#202124] font-medium">Meet</span>
          </span>
        </div>

        {/* Top-Right: Social Links & Verified Resume */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <a
            href="https://github.com/aditya-10k"
            target="_blank"
            rel="noreferrer"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-slate-300 hover:border-slate-800 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5"
            title="Aditya's GitHub"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <a
            href="https://linkedin.com/in/adityakathe"
            target="_blank"
            rel="noreferrer"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-slate-300 hover:border-[#0a66c2] hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5"
            title="Aditya's LinkedIn"
          >
            <svg className="w-3.5 h-3.5 fill-[#0a66c2]" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span className="hidden sm:inline">LinkedIn</span>
          </a>

          <a
            href="/Aditya_Kathe_Resume.pdf"
            download="Aditya_Kathe_Resume.pdf"
            className="p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
            title="Download Verified Resume PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resume PDF</span>
          </a>

          <a
            href="mailto:katheaditya10@gmail.com?subject=Interview%20Invitation%20for%20Aditya%20Kathe"
            className="p-2 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Email Aditya"
          >
            <Mail className="w-4 h-4 text-emerald-600" />
          </a>
        </div>
      </header>

      {/* Main Check-In Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        {/* Left Side: Clean Video Preview Card (unresponsive icons removed) */}
        <div className="w-full max-w-lg flex flex-col items-center">
          <div className="relative w-full aspect-video rounded-3xl bg-[#1e1e1e] overflow-hidden shadow-xl flex items-center justify-center border border-slate-800">
            {isCamOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-white/90 text-lg font-normal tracking-tight">
                Camera is off
              </div>
            )}

            {/* Top-left name label */}
            <div className="absolute top-4 left-5 text-sm font-medium text-white tracking-tight drop-shadow-md">
              Aditya Kathe
            </div>

            {/* Functional Center Controls: Microphone and Camera Toggles */}
            <div className="absolute bottom-4 flex items-center gap-3">
              {/* Mic Toggle Button */}
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isMicOn
                    ? 'bg-[#3c4043] text-white hover:bg-[#4a4e51]'
                    : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                }`}
                title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
              </button>

              {/* Cam Toggle Button */}
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isCamOn
                    ? 'bg-[#3c4043] text-white hover:bg-[#4a4e51]'
                    : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
                }`}
                title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCamOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Action Box */}
        <div className="w-full max-w-sm flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-[38px] font-normal tracking-tight text-[#202124]">
              Ready to join?
            </h1>
            <p className="text-sm text-slate-600">
              Technical Interview with Aditya Kathe
            </p>
          </div>

          {/* Big Blue Join Now Pill */}
          <div className="w-full space-y-3">
            <button
              onClick={onJoin}
              className="w-full sm:w-auto min-w-[180px] px-8 py-3 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Join now
            </button>
            <p className="text-xs text-slate-500 pt-1">
              Ask about JackDSQL, MatchResume, SVKM EduConnect, or system design
            </p>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200">
        Aditya Kathe • SDE / Distributed Systems • Java 17, Spring Boot 3, Python, RabbitMQ, Redis, pgvector
      </footer>
    </div>
  );
};

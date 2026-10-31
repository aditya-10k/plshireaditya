import React, { useState } from 'react';
import { FileText, Mail, Shield, Check } from 'lucide-react';

interface MeetEndCallViewProps {
  onRejoin: () => void;
  onReturnHome: () => void;
}

export const MeetEndCallView: React.FC<MeetEndCallViewProps> = ({
  onRejoin,
  onReturnHome,
}) => {
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#202124] flex flex-col justify-between items-center p-6 selection:bg-blue-500/20 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="Aditya Kathe"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-[21px] font-normal tracking-tight text-[#5f6368]">
            Google <span className="text-[#202124] font-medium">Meet</span>
          </span>
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
          hire-adi-tya
        </span>
      </header>

      {/* Center Content matching Image 4 */}
      <main className="w-full max-w-xl flex flex-col items-center text-center space-y-6 my-auto py-8">
        <h1 className="text-[34px] sm:text-[40px] font-normal tracking-tight text-[#202124] leading-tight">
          You left the meeting
        </h1>

        {/* Buttons Row matching Image 4 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-1">
          {/* Rejoin: Blue outline pill */}
          <button
            onClick={onRejoin}
            className="w-full sm:w-auto min-w-[130px] px-8 py-2.5 rounded-full border-2 border-[#1a73e8] text-[#1a73e8] font-medium text-sm hover:bg-blue-50/70 transition-all shadow-xs"
          >
            Rejoin
          </button>

          {/* Return to home screen: Solid blue pill */}
          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto min-w-[190px] px-8 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-sm transition-all shadow-sm"
          >
            Return to home screen
          </button>
        </div>

        {/* Feedback Link */}
        <div className="pt-1">
          {feedbackSent ? (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-center">
              <Check className="w-3.5 h-3.5" /> Feedback submitted. Thanks!
            </span>
          ) : (
            <button
              onClick={handleFeedback}
              className="text-sm text-[#1a73e8] hover:underline font-medium"
            >
              Submit feedback
            </button>
          )}
        </div>

        {/* Security Notice Card matching Image 4 */}
        <div className="w-full max-w-md p-5 rounded-lg border border-slate-300 bg-white text-left shadow-xs flex items-start gap-4 mt-4">
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] flex items-center justify-center shrink-0 text-[#1a73e8]">
            <Shield className="w-5 h-5 fill-[#1a73e8] text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-medium text-[#202124] leading-snug">
              Your meeting is safe
            </h2>
            <p className="text-xs text-[#5f6368] mt-1 leading-relaxed">
              No one can join a meeting unless invited or admitted by the host
            </p>
            <div className="text-right mt-2">
              <span className="text-xs font-medium text-[#1a73e8] hover:underline cursor-pointer">
                Learn more
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Next Steps & Links */}
        <div className="w-full max-w-md pt-6 border-t border-slate-200 space-y-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
            Aditya Kathe • Contact & Verified Assets
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="/Aditya_Kathe_Resume.pdf"
              download="Aditya_Kathe_Resume.pdf"
              className="p-2.5 rounded-lg border border-slate-200 hover:border-[#1a73e8] hover:bg-blue-50/50 text-[#1a73e8] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Resume PDF</span>
            </a>

            <a
              href="mailto:katheaditya10@gmail.com?subject=Interview%20Follow-up%20with%20Aditya%20Kathe"
              className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-[#202124] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Email Aditya</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
            <a
              href="https://github.com/aditya-10k"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub: aditya-10k
            </a>
            <span>•</span>
            <a
              href="https://linkedin.com/in/adityakathe"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1a73e8] transition-colors"
            >
              LinkedIn: in/adityakathe
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-slate-500 py-3 text-center">
        Meeting code: hire-adi-tya
      </footer>
    </div>
  );
};

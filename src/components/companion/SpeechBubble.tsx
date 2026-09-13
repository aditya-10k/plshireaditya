import React from 'react';

interface SpeechBubbleProps {
  customText?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ customText }) => {
  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none mb-1">
      {/* Frosted pill speech bubble */}
      <div className="relative px-6 py-3 rounded-2xl bg-[#111728]/90 border border-white/10 shadow-xl shadow-black/40 backdrop-blur-md text-center max-w-xs transition-all duration-300">
        <p className="text-sm font-semibold text-slate-100 leading-snug">
          {customText || 'Ask me anything.'}
        </p>
      </div>

      {/* Whimsical curved pointer tail */}
      <div className="relative w-16 h-8 -mt-1 ml-4 overflow-visible">
        <svg
          viewBox="0 0 60 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-slate-400"
        >
          <path
            d="M 12 0 C 12 12, 10 20, 20 22 C 28 24, 30 14, 22 14 C 15 14, 18 32, 28 36"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 23 34 L 28 36 L 27 30"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

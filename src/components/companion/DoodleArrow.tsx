import React from 'react';

export const DoodleArrow: React.FC = () => {
  return (
    <div className="relative select-none pointer-events-none hidden lg:block">
      
      {/* Hand-drawn sparks near the cloud's head */}
      <div className="absolute -left-12 -bottom-2 w-8 h-8 text-blue-300/80">
        <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M 6 18 L 2 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 16 12 L 18 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 24 20 L 30 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Doodle text */}
      <div className="font-doodle text-xl md:text-2xl text-slate-300 font-semibold leading-tight -rotate-3">
        I can show you
        <br />
        my projects too!
      </div>

      {/* Hand-drawn curved arrow pointing to the project card */}
      <div className="w-20 h-16 ml-10 mt-1 overflow-visible text-slate-400">
        <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Gentle curve loop pointing down-right */}
          <path
            d="M 5 5 C 10 30, 25 45, 55 42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrowhead */}
          <path
            d="M 46 36 L 56 42 L 48 48"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

    </div>
  );
};

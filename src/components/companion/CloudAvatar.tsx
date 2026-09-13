import React from 'react';
import { EmotionState } from '../../types';

interface CloudAvatarProps {
  emotion: EmotionState;
  onAvatarClick?: () => void;
  isThinking?: boolean;
}

export const CloudAvatar: React.FC<CloudAvatarProps> = ({
  emotion,
  onAvatarClick,
  isThinking = false,
}) => {
  // Fallback to idle if image error
  const spriteSrc = `/sprites/${emotion}.png`;

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      
      {/* Background ambient radial neon aura */}
      <div className="absolute -top-12 w-80 h-72 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-600/30 to-pink-500/20 blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Floating Cloud Character */}
      <div 
        onClick={onAvatarClick}
        className="relative z-10 cursor-pointer transform transition-transform duration-300 hover:scale-105 active:scale-95 animate-float-gentle"
        title={`Mood: ${emotion} (Click to interact)`}
      >
        <div className="relative w-64 h-52 sm:w-80 sm:h-64 flex items-center justify-center">
          <img
            src={spriteSrc}
            alt={`Cloud Companion - ${emotion}`}
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(168,85,247,0.45)] drop-shadow-[0_0_60px_rgba(56,189,248,0.3)] transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/sprites/idle.png';
            }}
          />

          {/* Subtle thinking / processing ripple rings */}
          {isThinking && (
            <div className="absolute inset-0 rounded-full border border-purple-400/40 animate-ping pointer-events-none" />
          )}
        </div>
      </div>

      {/* Ground neon reflection / shadow beneath the cloud */}
      <div className="relative w-72 sm:w-96 h-10 mt-1 pointer-events-none flex items-center justify-center">
        {/* Soft dark contact shadow */}
        <div className="w-56 h-3 bg-black/60 rounded-[100%] blur-sm" />
        {/* Glowing neon reflection pool matching the mockup */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/25 via-purple-500/35 to-pink-500/20 rounded-[100%] blur-xl opacity-80" />
      </div>

    </div>
  );
};

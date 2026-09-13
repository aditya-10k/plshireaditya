import React, { useState, useEffect } from 'react';
import { BlobBody } from './BlobBody';
import { Eyes } from './Eyes';
import { Eyebrows } from './Eyebrows';
import { Mouth } from './Mouth';
import { AvatarExpression, EyeDirection, MouthShape } from '../../types/avatar';

interface AvatarProps {
  expression: AvatarExpression;
  isDark: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  expression = 'idle',
  isDark = true,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<EyeDirection>('center');

  // Natural periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Directional gaze logic
  useEffect(() => {
    switch (expression) {
      case 'thinking':
        setEyeDirection('up');
        break;
      case 'skeptical':
        setEyeDirection('right');
        break;
      case 'curious':
        setEyeDirection('left');
        break;
      case 'listening':
      case 'serious':
      case 'focused':
        setEyeDirection('center');
        break;
      default:
        setEyeDirection('center');
    }
  }, [expression]);

  let mouthShape: MouthShape = 'smile';
  let isHappyEyeShape = false;
  let isSleepy = false;
  let pupilScale = 1;

  switch (expression) {
    case 'happy':
    case 'greeting':
    case 'agreeing':
      mouthShape = 'smile';
      break;

    case 'excited':
      mouthShape = 'big_smile';
      pupilScale = 1.15;
      break;

    case 'laughing':
      mouthShape = 'laugh';
      isHappyEyeShape = true;
      break;

    case 'surprised':
      mouthShape = 'open';
      pupilScale = 1.25;
      break;

    case 'confused':
      mouthShape = 'small_open';
      break;

    case 'skeptical':
      mouthShape = 'skeptical';
      pupilScale = 0.9;
      break;

    case 'sad':
    case 'disagreeing':
      mouthShape = 'frown';
      break;

    case 'angry':
    case 'frustrated':
    case 'serious':
      mouthShape = 'neutral';
      pupilScale = 0.85;
      break;

    case 'sleepy':
      isSleepy = true;
      mouthShape = 'small_open';
      break;

    case 'thinking':
      mouthShape = 'neutral';
      break;

    case 'listening':
    case 'idle':
    default:
      mouthShape = 'smile';
  }

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center select-none cursor-pointer group"
      title={`Mood: ${expression} (Click to interact)`}
    >
      {/* 1. Behind-Avatar Soft Atmospheric Halo (Pure CSS - Zero pixelation) */}
      <div
        className={`absolute -top-10 w-[420px] h-[340px] sm:w-[560px] sm:h-[450px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isDark
            ? 'bg-gradient-to-tr from-cyan-500/25 via-purple-600/35 to-pink-500/30'
            : 'bg-gradient-to-tr from-cyan-400/30 via-purple-400/30 to-rose-400/30'
        }`}
      />

      {/* 2. Scalable High-Resolution Vector Character (Infinite sharpness) */}
      <div className="relative z-10 w-80 h-64 sm:w-[460px] sm:h-[370px] md:w-[540px] md:h-[430px] transform transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] animate-float-gentle">
        <svg
          viewBox="0 0 320 260"
          className="w-full h-full overflow-visible"
        >
          {/* Layer 1: Symmetrical 3D Contoured Cloud Body */}
          <BlobBody isDark={isDark} expression={expression} />

          {/* Layer 2: Big Glossy Anime Eyes */}
          <Eyes
            direction={eyeDirection}
            isBlinking={isBlinking}
            pupilScale={pupilScale}
            isHappyShape={isHappyEyeShape}
            isSleepy={isSleepy}
          />

          {/* Layer 3: Eyebrows */}
          <Eyebrows expression={expression} />

          {/* Layer 4: Expressive Mouth */}
          <Mouth
            shape={mouthShape}
            isSpeaking={isSpeaking || expression === 'speaking'}
          />
        </svg>

        {/* Listening / Thinking Pulse Ring */}
        {(isListening || isThinking) && (
          <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-ping pointer-events-none" />
        )}
      </div>

      {/* 3. Soft Dark Contact Shadow & Ambient Floor Reflection */}
      <div className="relative w-80 sm:w-[500px] h-10 -mt-3 pointer-events-none flex items-center justify-center">
        {/* Crisp Contact Shadow beneath base */}
        <div
          className={`w-72 sm:w-[380px] h-4 rounded-[100%] blur-md transition-colors duration-500 ${
            isDark ? 'bg-black/60' : 'bg-purple-950/20'
          }`}
        />
        {/* Ambient Floor Reflection */}
        <div
          className={`absolute inset-0 rounded-[100%] blur-2xl opacity-75 transition-colors duration-500 ${
            isDark
              ? 'bg-gradient-to-r from-cyan-500/35 via-purple-500/40 to-pink-500/30'
              : 'bg-gradient-to-r from-cyan-400/35 via-purple-400/35 to-rose-400/30'
          }`}
        />
      </div>

    </div>
  );
};

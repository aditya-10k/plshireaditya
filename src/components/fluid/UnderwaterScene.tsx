import React, { useMemo } from 'react';

export type FluidTone =
  | 'neutral'
  | 'excited'
  | 'thinking'
  | 'speaking'
  | 'curious'
  | 'calm';

export type FluidState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface UnderwaterSceneProps {
  isDark: boolean;
  state: FluidState;
  tone: FluidTone;
  audioLevel?: number;
}

const MOOD_COLORS: Record<FluidTone, { neon1: string; neon2: string; mistTint: string }> = {
  calm: {
    neon1: '#00f2fe',
    neon2: '#4facfe',
    mistTint: 'rgba(6, 182, 212, 0.18)',
  },
  neutral: {
    neon1: '#6366f1',
    neon2: '#38bdf8',
    mistTint: 'rgba(99, 102, 241, 0.15)',
  },
  thinking: {
    neon1: '#c084fc',
    neon2: '#818cf8',
    mistTint: 'rgba(168, 85, 247, 0.22)',
  },
  speaking: {
    neon1: '#06b6d4',
    neon2: '#f43f5e',
    mistTint: 'rgba(0, 242, 254, 0.24)',
  },
  excited: {
    neon1: '#f43f5e',
    neon2: '#e879f9',
    mistTint: 'rgba(244, 63, 94, 0.22)',
  },
  curious: {
    neon1: '#a855f7',
    neon2: '#fbbf24',
    mistTint: 'rgba(168, 85, 247, 0.18)',
  },
};

export const UnderwaterScene: React.FC<UnderwaterSceneProps> = ({
  isDark,
  state,
  tone,
}) => {
  const mood = useMemo(() => MOOD_COLORS[tone], [tone]);
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none bg-[#03050a]"
      style={{ zIndex: 0 }}
    >
      <style>{`
        /* In-place chromatic glitch: image does NOT shift or pan */
        @keyframes glitchInPlace {
          0%, 95%, 100% {
            filter: none;
            opacity: 1;
          }
          96% {
            filter: drop-shadow(3px 0px 0px rgba(0, 242, 254, 0.75)) drop-shadow(-3px 0px 0px rgba(244, 63, 94, 0.75));
          }
          97% {
            filter: drop-shadow(-4px 0px 0px rgba(0, 242, 254, 0.85)) drop-shadow(4px 0px 0px rgba(244, 63, 94, 0.85));
          }
          98% {
            filter: none;
          }
        }

        /* Intense in-place glitch during thinking */
        @keyframes glitchThinking {
          0%, 88%, 100% {
            filter: none;
          }
          89% {
            filter: drop-shadow(4px 0px 0px rgba(0, 242, 254, 0.9)) drop-shadow(-4px 0px 0px rgba(244, 63, 94, 0.9));
          }
          91% {
            filter: drop-shadow(-3px 0px 0px rgba(0, 242, 254, 0.9)) drop-shadow(3px 0px 0px rgba(244, 63, 94, 0.9));
          }
          93% {
            filter: none;
          }
        }

        /* Swirling fog drifting across the stationary scene */
        @keyframes fogDriftLeft {
          0% {
            transform: translate3d(-15%, 0, 0);
          }
          50% {
            transform: translate3d(5%, 0, 0);
          }
          100% {
            transform: translate3d(-15%, 0, 0);
          }
        }

        @keyframes fogDriftRight {
          0% {
            transform: translate3d(10%, 0, 0);
          }
          50% {
            transform: translate3d(-10%, 0, 0);
          }
          100% {
            transform: translate3d(10%, 0, 0);
          }
        }

        /* Neon flicker pulse */
        @keyframes neonFlicker {
          0%, 100% { opacity: 0.75; }
          22% { opacity: 0.55; }
          24% { opacity: 0.85; }
          52% { opacity: 0.65; }
          54% { opacity: 0.95; }
          78% { opacity: 0.60; }
        }

        /* Ambient floating dust motes / rain mist */
        @keyframes particleRise {
          0% {
            transform: translateY(100vh);
            opacity: 0;
          }
          20% {
            opacity: 0.55;
          }
          80% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-10vh);
            opacity: 0;
          }
        }

        .glitch-still-layer {
          animation: ${isThinking ? 'glitchThinking 3s' : 'glitchInPlace 7s'} ease-in-out infinite;
        }

        .scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0, 0, 0, 0.35) 50%,
            rgba(0, 0, 0, 0.35)
          );
          background-size: 100% 4px;
        }
      `}</style>

      {/* Layer 1: STATIONARY Background Image (Zero Pan, Zero Zoom, Zero Parallax) */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full glitch-still-layer">
          <img
            src="/blade3.webp"
            alt="Blade Runner Environment"
            className="w-full h-full object-cover object-center"
            style={{
              filter: isDark
                ? 'brightness(0.76) contrast(1.18) saturate(1.25)'
                : 'brightness(0.98) contrast(1.05) saturate(1.05)',
              opacity: isDark ? 0.96 : 0.55,
            }}
          />
        </div>
      </div>

      {/* Layer 2: Rolling Fog / Mist Layer 1 (Ground Haze drifting over stationary background) */}
      <div
        className="absolute -bottom-16 -left-1/4 w-[150%] h-[60%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 80%, ${mood.mistTint} 0%, rgba(15, 23, 42, 0.40) 45%, transparent 75%)`,
          filter: 'blur(55px)',
          animation: 'fogDriftLeft 28s ease-in-out infinite',
          mixBlendMode: isDark ? 'screen' : 'multiply',
          opacity: isSpeaking ? 0.90 : 0.70,
        }}
      />

      {/* Layer 3: Rolling Fog / Mist Layer 2 (Mid-Atmosphere Steam) */}
      <div
        className="absolute top-1/4 -right-1/4 w-[140%] h-[50%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 45% at 50% 50%, rgba(2, 132, 199, 0.14) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 80%)`,
          filter: 'blur(60px)',
          animation: 'fogDriftRight 36s ease-in-out infinite',
          mixBlendMode: isDark ? 'screen' : 'multiply',
          opacity: 0.65,
        }}
      />

      {/* Layer 4: Living Fluid Mist / Smoke Turbulence */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        style={{
          mixBlendMode: isDark ? 'color-dodge' : 'soft-light',
        }}
      >
        <filter id="swirling-fog" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.02"
            numOctaves="4"
            seed="5"
          >
            <animate
              attributeName="baseFrequency"
              dur="20s"
              values="0.012 0.02; 0.018 0.035; 0.012 0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="30" />
        </filter>
        <rect
          width="100%"
          height="100%"
          fill={mood.neon1}
          opacity="0.10"
          filter="url(#swirling-fog)"
        />
      </svg>

      {/* Layer 5: Drifting Neon Mist / Atmosphere Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => {
          const size = 2 + (i % 3) * 1.5;
          const left = 6 + (i * 8.2) % 88;
          const dur = 14 + (i % 4) * 4;
          const delay = (i * 1.6) % 8;
          const isCyan = i % 2 === 0;

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size * 2}px`,
                left: `${left}%`,
                bottom: '-20px',
                background: isCyan ? mood.neon1 : mood.neon2,
                boxShadow: `0 0 8px ${isCyan ? mood.neon1 : mood.neon2}`,
                opacity: 0.45,
                animation: `particleRise ${dur}s linear ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Layer 6: Dynamic Neon Sign Glow / Lighting Flare */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 78% 28%, ${mood.neon1}30 0%, transparent 45%),
            radial-gradient(circle at 18% 72%, ${mood.neon2}25 0%, transparent 50%)
          `,
          mixBlendMode: isDark ? 'screen' : 'overlay',
          animation: 'neonFlicker 8s ease-in-out infinite',
        }}
      />

      {/* Layer 7: Subtle CRT Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none scanlines opacity-20"
        style={{
          mixBlendMode: 'overlay',
        }}
      />

      {/* Layer 8: Tactile Film Grain */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: isDark ? 0.040 : 0.025,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      >
        <filter id="blade-grain-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#blade-grain-noise)" />
      </svg>

      {/* Layer 9: Cinematic Vignette & Edge Shading */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, rgba(4, 6, 14, 0.10) 30%, rgba(3, 5, 10, 0.65) 75%, rgba(2, 3, 7, 0.88) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(248, 250, 252, 0.20) 30%, rgba(241, 245, 249, 0.55) 75%, rgba(226, 232, 240, 0.75) 100%)',
        }}
      />
    </div>
  );
};

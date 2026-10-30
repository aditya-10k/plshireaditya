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

/**
 * Live Translucent Sky Blue Glass Background with Fluted Vertical Lines,
 * Deep Ultramarine Blue Anchors, and Soft Organic Glowing Neon Pink Blobs.
 * (Pure soft blurred blobs with heavy diffusion; zero sharp polygon geometry).
 */
export const UnderwaterScene: React.FC<UnderwaterSceneProps> = ({
  isDark = true,
  state = 'idle',
  tone = 'calm',
}) => {
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isListening = state === 'listening';

  // Dynamic animation speeds and glow intensifiers based on voice activity and tone
  const toneMultiplier = useMemo(() => {
    switch (tone) {
      case 'excited':
        return 1.25;
      case 'thinking':
        return 0.85;
      case 'curious':
        return 1.1;
      case 'calm':
        return 0.9;
      default:
        return 1.0;
    }
  }, [tone]);

  const pinkBlobDuration = useMemo(() => {
    if (isSpeaking) return '3.6s';
    if (isThinking) return '5s';
    if (isListening) return '6.5s';
    return `${Math.round(15 / toneMultiplier)}s`;
  }, [isSpeaking, isThinking, isListening, toneMultiplier]);

  const glassWaveDuration = useMemo(() => {
    if (isSpeaking) return '6s';
    if (isThinking) return '8s';
    return '18s';
  }, [isSpeaking, isThinking]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0, background: isDark ? '#020617' : '#f0f9ff' }}
      aria-hidden="true"
    >
      <style>{`
        /* Deep Ultramarine Blue Ambient Drift */
        @keyframes ultramarineSway {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: ${isDark ? '0.85' : '0.55'};
          }
          50% {
            transform: translate3d(-3%, -4%, 0) scale(1.08);
            opacity: ${isDark ? '0.98' : '0.70'};
          }
        }

        /* Translucent Sky Blue Glass Blob Float */
        @keyframes skyGlassFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          33% {
            transform: translate3d(4%, -3%, 0) rotate(2deg) scale(1.06);
          }
          66% {
            transform: translate3d(-3%, 3%, 0) rotate(-1.5deg) scale(0.96);
          }
        }

        /* Organic Neon Pink Liquid Blob Morphing & Drift */
        @keyframes neonPinkBlobMotion {
          0% {
            border-radius: 46% 54% 62% 38% / 52% 45% 55% 48%;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.88;
          }
          25% {
            border-radius: 60% 40% 45% 55% / 40% 60% 40% 60%;
            transform: translate3d(${isSpeaking ? '60px, -35px' : '20px, -12px'}, 0) scale(${isSpeaking ? '1.24' : '1.05'}) rotate(${isSpeaking ? '15deg' : '5deg'});
            opacity: 0.98;
          }
          50% {
            border-radius: 38% 62% 65% 35% / 58% 38% 62% 42%;
            transform: translate3d(${isSpeaking ? '-45px, 30px' : '-16px, 14px'}, 0) scale(${isSpeaking ? '0.92' : '0.97'}) rotate(${isSpeaking ? '-12deg' : '-4deg'});
            opacity: 0.92;
          }
          75% {
            border-radius: 55% 45% 38% 62% / 48% 62% 38% 52%;
            transform: translate3d(${isSpeaking ? '35px, 20px' : '12px, 8px'}, 0) scale(${isSpeaking ? '1.16' : '1.03'}) rotate(${isSpeaking ? '10deg' : '3deg'});
            opacity: 1;
          }
          100% {
            border-radius: 46% 54% 62% 38% / 52% 45% 55% 48%;
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0.88;
          }
        }

        /* Secondary Soft Neon Pink Ambient Blob */
        @keyframes neonPinkSecondaryBlob {
          0%, 100% {
            border-radius: 58% 42% 50% 50% / 46% 54% 46% 54%;
            transform: translate3d(0, 0, 0) scale(1);
            opacity: ${isSpeaking ? '0.85' : '0.50'};
          }
          50% {
            border-radius: 42% 58% 38% 62% / 58% 42% 58% 42%;
            transform: translate3d(${isSpeaking ? '-50px, -30px' : '-18px, -12px'}, 0) scale(${isSpeaking ? '1.30' : '1.08'});
            opacity: ${isSpeaking ? '0.98' : '0.68'};
          }
        }

        /* Vertical Lines Light Beam Shimmer Sweep */
        @keyframes verticalLineShimmer {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          20% {
            opacity: ${isSpeaking ? '0.85' : '0.35'};
          }
          80% {
            opacity: ${isSpeaking ? '0.85' : '0.35'};
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        /* Voice Acoustic Glass Ripple Propagation */
        @keyframes glassVoiceRipple {
          0% {
            transform: scaleX(0.7) scaleY(0.9);
            opacity: 0.2;
          }
          50% {
            transform: scaleX(1.18) scaleY(1.12);
            opacity: ${isSpeaking ? '0.88' : '0.4'};
          }
          100% {
            transform: scaleX(0.7) scaleY(0.9);
            opacity: 0.2;
          }
        }

        /* Glass Surface Diagonal Sheen */
        @keyframes glassSheenDrift {
          0%, 100% {
            opacity: 0.35;
            transform: translate3d(0, 0, 0);
          }
          50% {
            opacity: 0.55;
            transform: translate3d(2%, 1%, 0);
          }
        }
      `}</style>

      {/* Layer 1: Deep Ultramarine Blue Base Anchor Pools */}
      <div className="absolute inset-0 w-full h-full">
        {/* Ultramarine Blob A (Bottom-Right Dominant Anchor) */}
        <div
          className="absolute -bottom-24 -right-24 w-[75vw] h-[75vh] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 70%, #002fa7 0%, #120a8f 35%, #041e42 65%, transparent 85%)',
            filter: 'blur(85px)',
            animation: 'ultramarineSway 16s ease-in-out infinite',
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        />

        {/* Ultramarine Blob B (Top-Left Counter-Anchor) */}
        <div
          className="absolute -top-24 -left-24 w-[65vw] h-[65vh] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #120a8f 0%, #0818A8 30%, #041e42 60%, transparent 85%)',
            filter: 'blur(90px)',
            animation: 'ultramarineSway 20s ease-in-out infinite reverse',
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        />

        {/* Ultramarine Blob C (Mid-Depth Horizon Pool) */}
        <div
          className="absolute top-1/3 left-1/4 w-[55vw] h-[45vh] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #002fa7 0%, #1d4ed8 35%, transparent 75%)',
            filter: 'blur(95px)',
            opacity: isDark ? 0.45 : 0.25,
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        />
      </div>

      {/* Layer 2: Translucent Sky Blue Glass Liquid Blobs */}
      <div className="absolute inset-0 w-full h-full">
        {/* Sky Blue Blob 1 (Center-Left Luminous Translucent Blob) */}
        <div
          className="absolute top-10 -left-12 w-[65vw] h-[60vh] pointer-events-none"
          style={{
            borderRadius: '54% 46% 38% 62% / 49% 70% 30% 51%',
            background: 'radial-gradient(ellipse 65% 55% at 40% 45%, rgba(56, 189, 248, 0.42) 0%, rgba(14, 165, 233, 0.25) 45%, rgba(125, 211, 252, 0.10) 70%, transparent 85%)',
            filter: 'blur(70px)',
            animation: `skyGlassFloat ${glassWaveDuration} ease-in-out infinite`,
            mixBlendMode: isDark ? 'screen' : 'soft-light',
          }}
        />

        {/* Sky Blue Blob 2 (Center-Right Translucent Blob) */}
        <div
          className="absolute bottom-12 right-1/12 w-[58vw] h-[52vh] pointer-events-none"
          style={{
            borderRadius: '40% 60% 55% 45% / 60% 35% 65% 40%',
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(125, 211, 252, 0.38) 0%, rgba(56, 189, 248, 0.20) 45%, transparent 80%)',
            filter: 'blur(65px)',
            animation: `skyGlassFloat ${glassWaveDuration} ease-in-out infinite reverse`,
            mixBlendMode: isDark ? 'screen' : 'soft-light',
          }}
        />

        {/* Ambient Sky Blue Frosted Glass Caustic Mist */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(56, 189, 248, ${isSpeaking ? '0.28' : '0.16'}) 0%, rgba(3, 105, 161, 0.10) 50%, transparent 80%)`,
            filter: 'blur(50px)',
            transition: 'background 0.6s ease',
          }}
        />
      </div>

      {/* Layer 3: Dash of Neon Pink - Soft Organic Glowing Liquid Blobs (NO SHARP POLYGONS) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Primary Soft Neon Pink Liquid Blob (Center-Right Glowing Accent, pulses and undulates on voice) */}
        <div
          className="absolute top-[28%] right-[20%] w-[320px] h-[280px] sm:w-[400px] sm:h-[340px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 45% 45%, #ff007f 0%, #ff1493 30%, #ff2d75 55%, rgba(244, 63, 94, 0.35) 75%, transparent 95%)',
            boxShadow: `
              0 0 ${isSpeaking ? '80px' : '50px'} rgba(255, 0, 128, 0.85),
              0 0 ${isSpeaking ? '140px' : '90px'} rgba(244, 63, 94, 0.45)
            `,
            filter: isSpeaking ? 'blur(45px)' : 'blur(55px)',
            animation: `neonPinkBlobMotion ${pinkBlobDuration} cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite`,
            mixBlendMode: isDark ? 'screen' : 'multiply',
            transition: 'filter 0.5s ease',
          }}
        />

        {/* Secondary Soft Neon Pink Liquid Blob (Lower-Left Accent, soft counter-orbit) */}
        <div
          className="absolute bottom-[22%] left-[16%] w-[260px] h-[220px] sm:w-[320px] sm:h-[260px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #ff2d75 0%, #ec4899 40%, rgba(236, 72, 153, 0.25) 70%, transparent 90%)',
            boxShadow: '0 0 60px rgba(255, 45, 117, 0.65), 0 0 100px rgba(236, 72, 153, 0.35)',
            filter: 'blur(52px)',
            animation: `neonPinkSecondaryBlob ${isSpeaking ? '4s' : '12s'} ease-in-out infinite`,
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        />

        {/* Ambient Chromatic Fusion: Magenta/Violet Soft Flare at Pink-Ultramarine Intersection */}
        <div
          className="absolute top-[44%] left-[40%] w-[380px] h-[200px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(217, 70, 239, 0.35) 0%, rgba(168, 85, 247, 0.18) 50%, transparent 80%)',
            filter: 'blur(60px)',
            transform: isSpeaking ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.7s ease',
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        />
      </div>

      {/* Layer 4: Voice-Reactive Acoustic Glass Soundwave Ripple */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{
          opacity: isSpeaking ? 1 : 0.35,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div
          className="w-[90vw] max-w-5xl h-[280px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.22) 0%, rgba(255, 20, 147, 0.16) 40%, rgba(18, 10, 143, 0.12) 70%, transparent 95%)',
            filter: 'blur(45px)',
            animation: isSpeaking ? 'glassVoiceRipple 2.4s ease-in-out infinite' : 'glassVoiceRipple 8s ease-in-out infinite',
            mixBlendMode: isDark ? 'screen' : 'soft-light',
          }}
        />
      </div>

      {/* Layer 5: Fluted Glass Architectural Vertical Lines Grid */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Crisp Fluted Vertical Glass Ribs (Repeating Pattern) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 39px,
                rgba(186, 230, 253, ${isDark ? '0.07' : '0.11'}) 39px,
                rgba(186, 230, 253, ${isDark ? '0.07' : '0.11'}) 40px
              )
            `,
            backgroundSize: '40px 100%',
            maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 50%, rgba(0,0,0,0.4) 85%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 50%, rgba(0,0,0,0.4) 85%, transparent 100%)',
          }}
        />

        {/* Subtle Alternating Glass Rib Column Translucency */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.012),
                rgba(255, 255, 255, 0.012) 40px,
                transparent 40px,
                transparent 80px
              )
            `,
            backgroundSize: '80px 100%',
          }}
        />

        {/* Dynamic Vertical Light Beam Shimmer across Glass Ribs */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          }}
        >
          <div
            className="w-full h-1/2 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, rgba(56, 189, 248, ${isSpeaking ? '0.20' : '0.08'}) 50%, rgba(255, 20, 147, ${isSpeaking ? '0.16' : '0.05'}) 75%, transparent 100%)`,
              animation: `verticalLineShimmer ${isSpeaking ? '3.8s' : '9s'} ease-in-out infinite`,
            }}
          />
        </div>
      </div>

      {/* Layer 6: Frosted Glass Refraction & Blur Diffusion Sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(35px)',
          WebkitBackdropFilter: 'blur(35px)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0%, transparent 40%, rgba(56, 189, 248, 0.025) 70%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, transparent 40%, rgba(56, 189, 248, 0.12) 70%, transparent 100%)',
          animation: 'glassSheenDrift 14s ease-in-out infinite',
        }}
      />

      {/* Layer 7: Micro-Prism Ambient Specular Light Highlights */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, rgba(125, 211, 252, 0.20) 0%, transparent 35%),
            radial-gradient(circle at 80% 75%, rgba(255, 20, 147, ${isSpeaking ? '0.22' : '0.12'}) 0%, transparent 40%)
          `,
          mixBlendMode: isDark ? 'screen' : 'overlay',
          transition: 'background 0.6s ease',
        }}
      />

      {/* Layer 8: Fine Vignette Edge Framing */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(2, 6, 23, 0.45) 80%, rgba(2, 6, 23, 0.85) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(224, 242, 254, 0.35) 80%, rgba(186, 230, 253, 0.65) 100%)',
        }}
      />
    </div>
  );
};

export const LiveGlassBackground = UnderwaterScene;

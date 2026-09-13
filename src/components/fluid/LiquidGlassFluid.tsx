import React, { useRef, useEffect } from 'react';

export type FluidTone = 'neutral' | 'excited' | 'thinking' | 'speaking' | 'curious' | 'calm';

interface LiquidGlassFluidProps {
  isDark: boolean;
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  tone?: FluidTone;
  audioLevel?: number; // 0 to 1 for live voice modulation
}

interface TonePalette {
  topGrad: string[];
  ambientGlow: string;
  particleColor: string;
}

const PALETTES: Record<FluidTone, TonePalette> = {
  neutral: {
    topGrad: ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e'],
    ambientGlow: 'rgba(129, 140, 248, 0.4)',
    particleColor: '#38bdf8',
  },
  excited: {
    topGrad: ['#ff007f', '#ff758c', '#a855f7', '#00f0ff'],
    ambientGlow: 'rgba(244, 63, 94, 0.5)',
    particleColor: '#f43f5e',
  },
  thinking: {
    topGrad: ['#00f2fe', '#4facfe', '#6366f1', '#3b82f6'],
    ambientGlow: 'rgba(56, 189, 248, 0.45)',
    particleColor: '#00f2fe',
  },
  speaking: {
    topGrad: ['#00f0ff', '#8b5cf6', '#ff007f', '#facc15'],
    ambientGlow: 'rgba(168, 85, 247, 0.55)',
    particleColor: '#c084fc',
  },
  curious: {
    topGrad: ['#8b5cf6', '#fbbf24', '#f43f5e', '#06b6d4'],
    ambientGlow: 'rgba(251, 191, 36, 0.4)',
    particleColor: '#fbbf24',
  },
  calm: {
    topGrad: ['#06b6d4', '#38bdf8', '#818cf8', '#6366f1'],
    ambientGlow: 'rgba(6, 182, 212, 0.35)',
    particleColor: '#38bdf8',
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
}

export const LiquidGlassFluid: React.FC<LiquidGlassFluidProps> = ({
  isDark,
  state,
  tone = 'neutral',
  audioLevel = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Smooth target height and amplitude transitions
  const currentHeightTarget = useRef(0.32);
  const currentAmpTarget = useRef(14);
  const actualHeight = useRef(0.32);
  const actualAmp = useRef(14);

  // Particles array
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Set target parameters based on conversational state
    if (state === 'speaking') {
      currentHeightTarget.current = 0.68 + audioLevel * 0.2;
      currentAmpTarget.current = 36 + audioLevel * 20;
    } else if (state === 'listening') {
      currentHeightTarget.current = 0.52 + audioLevel * 0.25;
      currentAmpTarget.current = 28 + audioLevel * 18;
    } else if (state === 'thinking') {
      currentHeightTarget.current = 0.58;
      currentAmpTarget.current = 22;
    } else {
      // Idle: gentle calm water/gas swell
      currentHeightTarget.current = 0.35;
      currentAmpTarget.current = 12;
    }
  }, [state, audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize floating gas / liquid particles
    particles.current = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: height - Math.random() * (height * 0.5),
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.6 - Math.random() * 1.2,
      size: 1.5 + Math.random() * 3.5,
      alpha: Math.random() * 0.8,
      maxAlpha: 0.3 + Math.random() * 0.6,
    }));

    let phase = 0;

    const render = () => {
      // Smooth lerp height & amplitude
      actualHeight.current += (currentHeightTarget.current - actualHeight.current) * 0.06;
      actualAmp.current += (currentAmpTarget.current - actualAmp.current) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const activePalette = PALETTES[tone] || PALETTES.neutral;
      const speedMultiplier = state === 'speaking' ? 0.055 : state === 'listening' ? 0.04 : state === 'thinking' ? 0.045 : 0.02;
      phase += speedMultiplier;

      // Base water line Y coordinate (0 at top, height at bottom)
      const targetWaterY = height * (1 - actualHeight.current);
      const amp = actualAmp.current;

      // -------------------------------------------------------------
      // 1. Draw 3 Multi-layered Refractive Liquid Waves
      // -------------------------------------------------------------
      const layers = [
        {
          opacity: 0.35,
          freq: 0.008,
          phaseOffset: phase * 0.8,
          yOffset: amp * 0.5,
          colorA: activePalette.topGrad[0],
          colorB: activePalette.topGrad[1],
        },
        {
          opacity: 0.55,
          freq: 0.012,
          phaseOffset: phase * 1.2 + 2,
          yOffset: -amp * 0.3,
          colorA: activePalette.topGrad[1],
          colorB: activePalette.topGrad[2],
        },
        {
          opacity: 0.9,
          freq: 0.015,
          phaseOffset: phase * 1.5 + 4,
          yOffset: 0,
          colorA: activePalette.topGrad[0],
          colorB: activePalette.topGrad[3] || activePalette.topGrad[2],
        },
      ];

      layers.forEach((layer, idx) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        // Calculate wave vertices
        for (let x = 0; x <= width; x += 4) {
          // Interactive mouse wave disturbance
          let mouseDisturbance = 0;
          if (mouseRef.current.active) {
            const dist = Math.abs(x - mouseRef.current.x);
            if (dist < 120) {
              mouseDisturbance = Math.cos((dist / 120) * (Math.PI / 2)) * 25;
            }
          }

          // Composite wave harmonics
          const sin1 = Math.sin(x * layer.freq + layer.phaseOffset);
          const sin2 = Math.cos(x * layer.freq * 1.7 - phase * 0.6);
          const waveY =
            targetWaterY +
            layer.yOffset +
            (sin1 * amp + sin2 * (amp * 0.45)) -
            mouseDisturbance;

          if (x === 0) ctx.lineTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Fluid gradient
        const fluidGrad = ctx.createLinearGradient(0, targetWaterY - amp, width, height);
        fluidGrad.addColorStop(0, layer.colorA);
        fluidGrad.addColorStop(0.5, layer.colorB);
        fluidGrad.addColorStop(1, isDark ? '#080a14' : '#ffffff');

        ctx.fillStyle = fluidGrad;
        ctx.globalAlpha = layer.opacity;
        ctx.fill();

        // Specular Liquid Glass Edge Crest (Highlight)
        if (idx === layers.length - 1) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.globalAlpha = 0.85;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.restore();

          // Second soft neon glow stroke
          ctx.save();
          ctx.strokeStyle = activePalette.topGrad[0];
          ctx.lineWidth = 6;
          ctx.globalAlpha = 0.5;
          ctx.shadowColor = activePalette.ambientGlow;
          ctx.shadowBlur = 25;
          ctx.stroke();
          ctx.restore();
        }
      });

      ctx.globalAlpha = 1.0;

      // -------------------------------------------------------------
      // 2. Rising Luminous Gas / Vapor Bubbles
      // -------------------------------------------------------------
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset if reached above water or exited
        if (p.y < targetWaterY - 30 || p.x < 0 || p.x > width) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.vy = -0.8 - Math.random() * 1.4;
          p.alpha = 0;
        }

        p.alpha = Math.min(p.maxAlpha, p.alpha + 0.02);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = activePalette.particleColor;
        ctx.globalAlpha = p.alpha * (state === 'speaking' ? 0.9 : 0.45);
        ctx.shadowColor = activePalette.particleColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      // -------------------------------------------------------------
      // 3. Liquid Glass Surface Refraction & Specular Highlights
      // -------------------------------------------------------------
      const glassSheenGrad = ctx.createLinearGradient(0, 0, width, height);
      glassSheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      glassSheenGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.0)');
      glassSheenGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
      glassSheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.18)');

      ctx.fillStyle = glassSheenGrad;
      ctx.fillRect(0, 0, width, height);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDark, state, tone, audioLevel]);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        };
      }}
      onMouseLeave={() => {
        mouseRef.current.active = false;
      }}
      className={`relative w-full max-w-4xl h-80 sm:h-[420px] mx-auto rounded-[40px] overflow-hidden border transition-all duration-700 shadow-2xl backdrop-blur-2xl ${
        isDark
          ? 'bg-[#0b0e1b]/70 border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.8)]'
          : 'bg-white/60 border-slate-200/80 shadow-[0_25px_60px_rgba(139,92,246,0.15)]'
      }`}
    >
      {/* 1. Behind-Glass Ambient Atmosphere Aura */}
      <div
        className="absolute inset-0 blur-3xl pointer-events-none transition-all duration-700 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${
            PALETTES[tone]?.ambientGlow || 'rgba(129, 140, 248, 0.4)'
          }, transparent 70%)`,
        }}
      />

      {/* 2. Interactive Liquid Glass Canvas */}
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block cursor-pointer" />

      {/* 3. Liquid Glass Top Specular Bevel & Inner Rim Highlight */}
      <div className="absolute inset-0 rounded-[40px] border border-white/20 pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_6px_rgba(0,0,0,0.4)]" />

      {/* 4. Glass Reflection Slanted Sheen */}
      <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -rotate-45" />

      {/* 5. Live State & Height Indicator Badge */}
      <div className="absolute top-5 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-slate-300 pointer-events-none">
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${
            state === 'speaking'
              ? 'bg-pink-400 shadow-[0_0_8px_#f43f5e]'
              : state === 'listening'
              ? 'bg-purple-400 shadow-[0_0_8px_#a855f7]'
              : state === 'thinking'
              ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
              : 'bg-emerald-400'
          }`}
        />
        <span className="capitalize font-medium tracking-wide">
          {state === 'speaking'
            ? 'Resonating...'
            : state === 'listening'
            ? 'Absorbing Voice...'
            : state === 'thinking'
            ? 'Synthesizing...'
            : 'Atmosphere: Calm'}
        </span>
        <span className="text-[10px] text-slate-400 pl-1 border-l border-white/10 uppercase">
          {tone} Tone
        </span>
      </div>

      {/* 6. Subtle Interaction Hint */}
      <div className="absolute bottom-4 right-6 z-20 text-[11px] text-slate-400/80 pointer-events-none select-none">
        Touch / hover to ripple the liquid glass
      </div>
    </div>
  );
};

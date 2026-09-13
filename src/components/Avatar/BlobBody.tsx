import React from 'react';

interface BlobBodyProps {
  isDark: boolean;
  expression: string;
}

export const BlobBody: React.FC<BlobBodyProps> = ({ isDark, expression }) => {
  let scaleX = 1;
  let scaleY = 1;
  let rotate = 0;

  if (expression === 'excited' || expression === 'surprised') {
    scaleX = 0.97;
    scaleY = 1.04;
  } else if (expression === 'sad' || expression === 'sleepy') {
    scaleX = 1.03;
    scaleY = 0.96;
  } else if (expression === 'thinking' || expression === 'skeptical') {
    rotate = -2;
  } else if (expression === 'curious') {
    rotate = 2;
  }

  // Exact symmetrical gumdrop / cloud bell silhouette from media_1789243731316.png
  const cloudSilhouette = `
    M 160 218
    C 215 218, 255 210, 272 185
    C 290 158, 276 126, 246 108
    C 222 92, 198 48, 160 42
    C 122 48, 98 92, 74 108
    C 44 126, 30 158, 48 185
    C 65 210, 105 218, 160 218 Z
  `;

  return (
    <g
      className="transition-transform duration-500 ease-out"
      style={{
        transformOrigin: '160px 145px',
        transform: `scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`,
      }}
    >
      <defs>
        {/* ================================================================= */}
        {/* DARK MODE GRADIENT: Authentic 3D Luminous Pixar Cloud Shading     */}
        {/* ================================================================= */}
        <linearGradient id="cloudBody3DDark" x1="20%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#38bdf8" />    {/* Sky Cyan */}
          <stop offset="25%" stopColor="#60a5fa" />   {/* Electric Blue */}
          <stop offset="55%" stopColor="#818cf8" />   {/* Soft Indigo */}
          <stop offset="78%" stopColor="#c084fc" />   {/* Radiant Violet */}
          <stop offset="100%" stopColor="#f43f5e" />  {/* Hot Neon Pink */}
        </linearGradient>

        {/* Top-Left Cyan Rim Highlight */}
        <linearGradient id="cyanEdgeGrad" x1="0%" y1="0%" x2="60%" y2="60%">
          <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>

        {/* Bottom-Right Magenta Rim Highlight */}
        <linearGradient id="magentaEdgeGrad" x1="100%" y1="100%" x2="40%" y2="40%">
          <stop offset="0%" stopColor="#ff007f" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>

        {/* 3D Volumetric Specular Sheen (Gives plump silicone feel) */}
        <radialGradient id="cloudSpecularSheen" cx="42%" cy="30%" r="46%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Atmospheric Bloom Halo Filter */}
        <filter id="cloudSoftBloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>


        {/* ================================================================= */}
        {/* LIGHT MODE GRADIENT: Rich Vibrant Candy Cloud Shading             */}
        {/* ================================================================= */}
        <linearGradient id="cloudBody3DLight" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#06b6d4" />    {/* Aqua Turquoise */}
          <stop offset="30%" stopColor="#3b82f6" />   {/* Royal Blue */}
          <stop offset="65%" stopColor="#8b5cf6" />   {/* Rich Violet */}
          <stop offset="100%" stopColor="#ec4899" />  {/* Hot Magenta */}
        </linearGradient>

        <filter id="cloudLightShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#7c3aed" floodOpacity="0.3" />
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0284c7" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* 1. Atmospheric Ambient Glow Behind Cloud */}
      <path
        d={cloudSilhouette}
        fill={isDark ? 'url(#cloudBody3DDark)' : 'url(#cloudBody3DLight)'}
        filter={isDark ? 'url(#cloudSoftBloom)' : 'url(#cloudLightShadow)'}
        opacity={isDark ? 0.65 : 0.85}
        className="transition-opacity duration-700"
      />

      {/* 2. Main 3D Vector Cloud Body (100% Crisp / Never Blurry) */}
      <path
        d={cloudSilhouette}
        fill={isDark ? 'url(#cloudBody3DDark)' : 'url(#cloudBody3DLight)'}
        className="transition-colors duration-500"
      />

      {/* 3. Top-Left Electric Cyan Rim */}
      <path
        d={cloudSilhouette}
        stroke="url(#cyanEdgeGrad)"
        strokeWidth="5.5"
        fill="none"
        style={{ mixBlendMode: 'screen' }}
        opacity={isDark ? 0.85 : 0.5}
      />

      {/* 4. Bottom-Right Hot Neon Pink Rim */}
      <path
        d={cloudSilhouette}
        stroke="url(#magentaEdgeGrad)"
        strokeWidth="6"
        fill="none"
        style={{ mixBlendMode: 'screen' }}
        opacity={isDark ? 0.9 : 0.6}
      />

      {/* 5. Volumetric 3D Specular Dome */}
      <path
        d={cloudSilhouette}
        fill="url(#cloudSpecularSheen)"
        style={{ mixBlendMode: 'overlay' }}
      />
    </g>
  );
};

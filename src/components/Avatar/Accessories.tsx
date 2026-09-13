import React from 'react';

interface AccessoriesProps {
  showHat: boolean;
  showSunglasses: boolean;
}

export const Accessories: React.FC<AccessoriesProps> = ({
  showHat,
  showSunglasses,
}) => {
  return (
    <g className="transition-all duration-500 ease-out select-none pointer-events-none">
      <defs>
        {/* Iridescent Polarized Mirror Reflection for Sunglasses */}
        <linearGradient id="sunglassLensMirror" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#c084fc" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
        </linearGradient>

        {/* Hat Fabric Gradient */}
        <linearGradient id="hatFabricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Hat Ribbon Gradient */}
        <linearGradient id="hatRibbonGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* ----------------------------------------------------------------- */}
      {/* 1. Designer Streetwear Bucket Hat                                  */}
      {/* ----------------------------------------------------------------- */}
      {showHat && (
        <g
          className="transition-all duration-500 transform ease-out"
          style={{ transformOrigin: '150px 58px' }}
        >
          {/* Hat Shadow on the Cloud Head */}
          <ellipse
            cx="148"
            cy="66"
            rx="46"
            ry="12"
            fill="#000000"
            opacity="0.25"
            className="blur-[2px]"
          />

          {/* Wide Flared Bucket Brim */}
          <path
            d="M 96 68 C 96 52, 200 52, 200 68 C 200 80, 96 80, 96 68 Z"
            fill="url(#hatFabricGrad)"
            stroke="#0f172a"
            strokeWidth="2"
            className="filter drop-shadow-md"
          />

          {/* Hat Crown / Dome */}
          <path
            d="M 112 60 C 114 26, 182 26, 184 60 Z"
            fill="url(#hatFabricGrad)"
            stroke="#0f172a"
            strokeWidth="2"
          />

          {/* Hat Crown Top Indent / Crease */}
          <path
            d="M 132 30 Q 148 35 164 30"
            stroke="#0f172a"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Vibrant Holographic Band / Ribbon */}
          <path
            d="M 113 54 C 128 49, 168 49, 183 54 L 184 60 C 169 55, 127 55, 112 60 Z"
            fill="url(#hatRibbonGrad)"
          />

          {/* Embroidered Neon Star Emblem on Hat */}
          <path
            d="M 148 42 L 150 47 L 155 48 L 151 51 L 152 56 L 148 53 L 144 56 L 145 51 L 141 48 L 146 47 Z"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="0.8"
            className="filter drop-shadow-sm"
          />
        </g>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. Cyber-Chic Wayfarer Sunglasses with Polarized Reflection        */}
      {/* ----------------------------------------------------------------- */}
      {showSunglasses && (
        <g
          className="transition-all duration-500 transform ease-out"
          style={{ transformOrigin: '150px 142px' }}
        >
          {/* Soft Shadow behind glasses */}
          <ellipse
            cx="150"
            cy="146"
            rx="54"
            ry="18"
            fill="#000000"
            opacity="0.22"
            className="blur-[3px]"
          />

          {/* Left Lens Glass */}
          <path
            d="M 104 133 C 104 158, 143 158, 143 133 Z"
            fill="url(#sunglassLensMirror)"
          />

          {/* Right Lens Glass */}
          <path
            d="M 157 133 C 157 158, 196 158, 196 133 Z"
            fill="url(#sunglassLensMirror)"
          />

          {/* Bold Glossy Black Wayfarer Acetate Frame */}
          <path
            d="M 98 128
               L 202 128
               C 204 134, 200 162, 188 164
               C 174 166, 155 162, 153 140
               C 151 138, 149 138, 147 140
               C 145 162, 126 166, 112 164
               C 100 162, 96 134, 98 128 Z"
            fill="#090d18"
            stroke="#1e293b"
            strokeWidth="2.5"
            fillRule="evenodd"
          />

          {/* Left Lens Sharp Specular Gleam Slash */}
          <path
            d="M 112 135 L 126 153"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 119 135 L 128 147"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Right Lens Sharp Specular Gleam Slash */}
          <path
            d="M 165 135 L 179 153"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 172 135 L 181 147"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Metallic Silver Corner Rivets */}
          <circle cx="102" cy="132" r="1.8" fill="#e2e8f0" stroke="#475569" strokeWidth="0.6" />
          <circle cx="198" cy="132" r="1.8" fill="#e2e8f0" stroke="#475569" strokeWidth="0.6" />
        </g>
      )}
    </g>
  );
};

import React from 'react';
import { EyeDirection } from '../../types/avatar';

interface EyesProps {
  direction?: EyeDirection;
  isBlinking?: boolean;
  pupilScale?: number;
  isHappyShape?: boolean;
  isSleepy?: boolean;
}

export const Eyes: React.FC<EyesProps> = ({
  direction = 'center',
  isBlinking = false,
  pupilScale = 1,
  isHappyShape = false,
  isSleepy = false,
}) => {
  let offsetX = 0;
  let offsetY = 0;

  switch (direction) {
    case 'left':
      offsetX = -5;
      break;
    case 'right':
      offsetX = 5;
      break;
    case 'up':
      offsetY = -5;
      break;
    case 'down':
      offsetY = 5;
      break;
    default:
      offsetX = 0;
      offsetY = 0;
  }

  // Exact centers matching media_1789243731316.png proportions
  const leftX = 132;
  const leftY = 138;
  const rightX = 188;
  const rightY = 138;

  // Sleepy state
  if (isSleepy) {
    return (
      <g className="transition-all duration-300">
        <path
          d={`M ${leftX - 16} ${leftY} Q ${leftX} ${leftY + 5.5} ${leftX + 16} ${leftY}`}
          stroke="#090d18"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${rightX - 16} ${rightY} Q ${rightX} ${rightY + 5.5} ${rightX + 16} ${rightY}`}
          stroke="#090d18"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  // Happy state: (^ ^)
  if (isHappyShape) {
    return (
      <g className="transition-all duration-300">
        <path
          d={`M ${leftX - 15} ${leftY + 4} Q ${leftX} ${leftY - 14} ${leftX + 15} ${leftY + 4}`}
          stroke="#090d18"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${rightX - 15} ${rightY + 4} Q ${rightX} ${rightY - 14} ${rightX + 15} ${rightY + 4}`}
          stroke="#090d18"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  // Open animated eyes from media_1789243731316.png
  return (
    <g
      className="transition-transform duration-150 ease-out"
      style={{
        transformOrigin: '160px 138px',
        transform: isBlinking ? 'scaleY(0.06)' : 'scaleY(1)',
      }}
    >
      {/* Sclera: Big white rounded capsules */}
      <ellipse
        cx={leftX}
        cy={leftY}
        rx="17"
        ry="23"
        fill="#ffffff"
        className="filter drop-shadow-sm"
      />
      <ellipse
        cx={rightX}
        cy={rightY}
        rx="17"
        ry="23"
        fill="#ffffff"
        className="filter drop-shadow-sm"
      />

      {/* Pupils with Directional Gaze */}
      <g
        className="transition-transform duration-200 ease-out"
        style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
      >
        {/* Left Pupil */}
        <ellipse
          cx={leftX + 0.5}
          cy={leftY + 1.5}
          rx={12.5 * pupilScale}
          ry={16.5 * pupilScale}
          fill="#080c16"
        />
        {/* Primary Specular Glint (Top-Right) */}
        <circle
          cx={leftX + 4.2}
          cy={leftY - 5.5}
          r="4.6"
          fill="#ffffff"
        />
        {/* Secondary Glint (Bottom-Left) */}
        <circle
          cx={leftX - 4.5}
          cy={leftY + 5.5}
          r="2.2"
          fill="#ffffff"
        />

        {/* Right Pupil */}
        <ellipse
          cx={rightX + 0.5}
          cy={leftY + 1.5}
          rx={12.5 * pupilScale}
          ry={16.5 * pupilScale}
          fill="#080c16"
        />
        {/* Primary Specular Glint (Top-Right) */}
        <circle
          cx={rightX + 4.2}
          cy={rightY - 5.5}
          r="4.6"
          fill="#ffffff"
        />
        {/* Secondary Glint (Bottom-Left) */}
        <circle
          cx={rightX - 4.5}
          cy={rightY + 5.5}
          r="2.2"
          fill="#ffffff"
        />
      </g>
    </g>
  );
};

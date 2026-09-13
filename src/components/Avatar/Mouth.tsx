import React from 'react';
import { MouthShape } from '../../types/avatar';

interface MouthProps {
  shape: MouthShape;
  isSpeaking?: boolean;
}

export const Mouth: React.FC<MouthProps> = ({ shape, isSpeaking = false }) => {
  const centerX = 160;
  const centerY = 172;

  // Animated speaking rhythm
  if (isSpeaking) {
    return (
      <g className="animate-pulse">
        <path
          d={`M ${centerX - 11} ${centerY - 2}
             Q ${centerX} ${centerY + 15} ${centerX + 11} ${centerY - 2}
             Z`}
          fill="#080c16"
          stroke="#080c16"
          strokeWidth="1.5"
          className="transition-all duration-150"
        />
        <path
          d={`M ${centerX - 6} ${centerY + 7}
             Q ${centerX} ${centerY + 2} ${centerX + 6} ${centerY + 7}
             Q ${centerX} ${centerY + 14} ${centerX - 6} ${centerY + 7} Z`}
          fill="#f472b6"
        />
      </g>
    );
  }

  switch (shape) {
    case 'small_open':
      // Sleepy oval mouth
      return (
        <g className="transition-all duration-300">
          <ellipse
            cx={centerX}
            cy={centerY + 1}
            rx="5.5"
            ry="8.5"
            fill="#080c16"
          />
        </g>
      );

    case 'open':
    case 'wide_open':
      return (
        <g className="transition-all duration-300">
          <ellipse
            cx={centerX}
            cy={centerY + 2}
            rx="8"
            ry="11"
            fill="#080c16"
          />
          <path
            d={`M ${centerX - 5} ${centerY + 6} Q ${centerX} ${centerY + 2} ${centerX + 5} ${centerY + 6} Q ${centerX} ${centerY + 12} ${centerX - 5} ${centerY + 6} Z`}
            fill="#f472b6"
          />
        </g>
      );

    case 'big_smile':
    case 'laugh':
      return (
        <g className="transition-all duration-300">
          <path
            d={`M ${centerX - 14} ${centerY - 2}
               C ${centerX - 12} ${centerY + 16}, ${centerX + 12} ${centerY + 16}, ${centerX + 14} ${centerY - 2}
               Z`}
            fill="#080c16"
          />
          <path
            d={`M ${centerX - 8} ${centerY + 7}
               Q ${centerX} ${centerY + 2} ${centerX + 8} ${centerY + 7}
               Q ${centerX} ${centerY + 15} ${centerX - 8} ${centerY + 7} Z`}
            fill="#f472b6"
          />
        </g>
      );

    case 'frown':
      return (
        <g className="transition-all duration-300">
          <path
            d={`M ${centerX - 10} ${centerY + 6} Q ${centerX} ${centerY - 3} ${centerX + 10} ${centerY + 6}`}
            stroke="#080c16"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );

    case 'skeptical':
      return (
        <g className="transition-all duration-300">
          <path
            d={`M ${centerX - 9} ${centerY + 4} Q ${centerX} ${centerY + 1} ${centerX + 9} ${centerY}`}
            stroke="#080c16"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );

    case 'neutral':
      return (
        <g className="transition-all duration-300">
          <path
            d={`M ${centerX - 7} ${centerY + 1} L ${centerX + 7} ${centerY + 1}`}
            stroke="#080c16"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );

    case 'smile':
    default:
      // Joyful sweet smile from media_1789243731316.png
      return (
        <g className="transition-all duration-300">
          <path
            d={`M ${centerX - 12} ${centerY - 1}
               Q ${centerX} ${centerY + 12} ${centerX + 12} ${centerY - 1}
               Z`}
            fill="#080c16"
          />
        </g>
      );
  }
};

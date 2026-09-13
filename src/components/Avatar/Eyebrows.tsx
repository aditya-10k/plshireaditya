import React from 'react';
import { AvatarExpression } from '../../types/avatar';

interface EyebrowsProps {
  expression: AvatarExpression;
}

export const Eyebrows: React.FC<EyebrowsProps> = ({ expression }) => {
  let leftD = 'M 119 110 Q 132 102 145 110';
  let rightD = 'M 175 110 Q 188 102 201 110';
  let strokeWidth = 4.2;
  let opacity = 0.9;

  switch (expression) {
    case 'sleepy':
      leftD = 'M 118 114 Q 132 110 146 114';
      rightD = 'M 174 114 Q 188 110 202 114';
      strokeWidth = 4.5;
      break;

    case 'curious':
      leftD = 'M 118 104 Q 132 96 146 103'; // raised
      rightD = 'M 174 113 Q 188 109 202 113';
      break;

    case 'skeptical':
      leftD = 'M 118 102 Q 132 94 146 102'; // high arched
      rightD = 'M 174 115 Q 188 113 202 111'; // flat
      break;

    case 'surprised':
    case 'excited':
      leftD = 'M 118 100 Q 132 92 146 100';
      rightD = 'M 174 100 Q 188 92 202 100';
      break;

    case 'thinking':
    case 'confused':
      leftD = 'M 118 109 Q 132 104 146 111';
      rightD = 'M 174 108 Q 188 102 202 109';
      break;

    case 'sad':
      leftD = 'M 118 114 Q 132 107 146 111';
      rightD = 'M 174 110 Q 188 107 202 114';
      break;

    case 'angry':
    case 'frustrated':
    case 'serious':
      leftD = 'M 118 106 L 146 115';
      rightD = 'M 174 115 L 202 106';
      strokeWidth = 4.8;
      opacity = 1;
      break;

    case 'happy':
    case 'laughing':
      leftD = 'M 119 108 Q 132 102 145 108';
      rightD = 'M 175 108 Q 188 102 201 108';
      opacity = 0.75;
      break;

    default:
      leftD = 'M 119 110 Q 132 102 145 110';
      rightD = 'M 175 110 Q 188 102 201 110';
  }

  return (
    <g className="transition-all duration-300 ease-out" opacity={opacity}>
      <path
        d={leftD}
        stroke="#080c16"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={rightD}
        stroke="#080c16"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

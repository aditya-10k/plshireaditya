import React from 'react';

/**
 * Pixel-perfect Google Meet SVG Icons matching official Google Design System
 */

export const GoogleMeetLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 192 192" fill="none">
    <rect width="192" height="192" rx="38" fill="white" />
    <path
      d="M148.5 70.5L120 90V66C120 59.37 114.63 54 108 54H42C35.37 54 30 59.37 30 66V126C30 132.63 35.37 138 42 138H108C114.63 138 120 132.63 120 126V102L148.5 121.5C153.5 125 160 121.4 160 115.2V76.8C160 70.6 153.5 67 148.5 70.5Z"
      fill="#00AC47"
    />
    <path
      d="M120 102V126C120 132.63 114.63 138 108 138H42L120 60V102Z"
      fill="#00832D"
    />
    <path
      d="M148.5 70.5L120 90V66C120 59.37 114.63 54 108 54L30 132C30 138.63 35.37 138 42 138H108C114.63 138 120 132.63 120 126V102L148.5 121.5C153.5 125 160 121.4 160 115.2V76.8C160 70.6 153.5 67 148.5 70.5Z"
      fill="#2684FC"
      opacity="0.1"
    />
    <path
      d="M148.5 70.5L120 90V66L160 76.8V115.2L148.5 70.5Z"
      fill="#0066DA"
    />
    <path
      d="M120 66C120 59.37 114.63 54 108 54H42C35.37 54 30 59.37 30 66V84L78 138H108C114.63 138 120 132.63 120 126V66Z"
      fill="#FFBA00"
    />
    <path
      d="M42 54C35.37 54 30 59.37 30 66V126C30 132.63 35.37 138 42 138L84 96L42 54Z"
      fill="#EA4335"
    />
    <path
      d="M108 54H42C35.37 54 30 59.37 30 66L84 120L120 84V66C120 59.37 114.63 54 108 54Z"
      fill="#2684FC"
    />
  </svg>
);

export const MeetLockShield: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-[#f29900]' }) => (
  <span className="w-5 h-5 rounded-md bg-[#c26400] flex items-center justify-center text-white">
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  </span>
);

export const MeetNoiseCancelIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-slate-400' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v3m0 12v3M5 12H2m20 0h-3M6.3 6.3l2.1 2.1m7.2 7.2l2.1 2.1M6.3 17.7l2.1-2.1m7.2-7.2l2.1-2.1" />
    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const MeetActivitiesIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l5.5 4.1v9.4H6.5V9.6L12 5.5z" opacity="0.3" />
    <circle cx="7" cy="7" r="2.5" />
    <rect x="13.5" y="4.5" width="5" height="5" rx="1" />
    <path d="M7 14l3.5 5h-7z" />
    <polygon points="16,13.5 19,19 13,19" />
  </svg>
);

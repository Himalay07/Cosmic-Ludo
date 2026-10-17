import React from 'react';
import { PlayerColor } from '../types';

interface MascotProps {
  color: PlayerColor;
  className?: string;
}

export const MascotIcon: React.FC<MascotProps> = ({ color, className = 'w-full h-full' }) => {
  switch (color) {
    case 'red':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mars Pilot: One-eyed crimson cyclops with antenna and visor */}
          <ellipse cx="38" cy="88" rx="8" ry="5" fill="#ff5b4a" />
          <ellipse cx="62" cy="88" rx="8" ry="5" fill="#ff5b4a" />
          {/* Antenna */}
          <rect x="47" y="15" width="6" height="18" rx="3" fill="#ff5b4a" />
          <circle cx="50" cy="13" r="7" fill="#ffe082" />
          <circle cx="50" cy="13" r="4" fill="#ff5b4a" />
          {/* Main Body */}
          <ellipse cx="50" cy="58" rx="33" ry="29" fill="#ff5b4a" />
          <ellipse cx="50" cy="68" rx="20" ry="14" fill="#ff998f" opacity="0.6" />
          {/* Large Eye */}
          <circle cx="50" cy="50" r="16" fill="#ffffff" />
          <circle cx="50" cy="51" r="8.5" fill="#140f26" />
          <circle cx="53.5" cy="47.5" r="3" fill="#ffffff" />
          <circle cx="47" cy="53" r="1.5" fill="#ff5b4a" />
          {/* Smile */}
          <path d="M42 70 Q50 77 58 70" stroke="#701a12" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );

    case 'green':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Nebula Phantom: Floating purple cosmic apparition with dual glowing eyes */}
          <path
            d="M22 46 Q22 14 50 14 Q78 14 78 46 L78 72 Q70 85 62 72 Q50 85 38 72 Q30 85 22 72 Z"
            fill="#b06bff"
          />
          {/* Energy core */}
          <ellipse cx="50" cy="40" rx="24" ry="14" fill="#e9d5ff" opacity="0.4" />
          {/* Eyes */}
          <circle cx="38" cy="46" r="10" fill="#ffffff" />
          <circle cx="62" cy="46" r="10" fill="#ffffff" />
          <circle cx="38" cy="49" r="5" fill="#180e2e" />
          <circle cx="62" cy="49" r="5" fill="#180e2e" />
          <circle cx="41" cy="45" r="2.2" fill="#b06bff" />
          <circle cx="65" cy="45" r="2.2" fill="#b06bff" />
          {/* Mouth/Maw */}
          <ellipse cx="50" cy="62" rx="5" ry="6" fill="#180e2e" />
          <circle cx="50" cy="60" r="2" fill="#e9d5ff" />
        </svg>
      );

    case 'yellow':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Saturn Sovereign: Golden solar creature encased in gleaming asteroid ring */}
          <ellipse
            cx="50"
            cy="56"
            rx="44"
            ry="11"
            fill="none"
            stroke="#ffe3a8"
            strokeWidth="5.5"
            opacity="0.9"
            transform="rotate(-14 50 56)"
          />
          <circle cx="50" cy="55" r="28" fill="#ffc247" />
          <ellipse cx="50" cy="46" rx="18" ry="10" fill="#fff6df" opacity="0.4" />
          {/* Dual Eyes */}
          <circle cx="41" cy="51" r="9" fill="#ffffff" />
          <circle cx="61" cy="51" r="9" fill="#ffffff" />
          <circle cx="41" cy="53" r="4.5" fill="#241705" />
          <circle cx="61" cy="53" r="4.5" fill="#241705" />
          <circle cx="44" cy="49" r="2" fill="#ffffff" />
          <circle cx="64" cy="49" r="2" fill="#ffffff" />
          {/* Cheerful grin */}
          <path d="M43 66 Q50 72 57 66" stroke="#8a5a10" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'blue':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Neptune Kraken: Ocean blue cephalopod alien with tentacles */}
          <path d="M25 58 Q18 72 25 86" stroke="#3fa7ff" strokeWidth="9" strokeLinecap="round" />
          <path d="M40 60 Q35 76 40 90" stroke="#3fa7ff" strokeWidth="9" strokeLinecap="round" />
          <path d="M60 60 Q65 76 60 90" stroke="#3fa7ff" strokeWidth="9" strokeLinecap="round" />
          <path d="M75 58 Q82 72 75 86" stroke="#3fa7ff" strokeWidth="9" strokeLinecap="round" />
          {/* Head */}
          <ellipse cx="50" cy="42" rx="31" ry="27" fill="#3fa7ff" />
          <ellipse cx="50" cy="33" rx="19" ry="11" fill="#cbe6ff" opacity="0.5" />
          {/* Eyes */}
          <circle cx="39" cy="42" r="9.5" fill="#ffffff" />
          <circle cx="61" cy="42" r="9.5" fill="#ffffff" />
          <circle cx="39" cy="44" r="4.8" fill="#07203d" />
          <circle cx="61" cy="44" r="4.8" fill="#07203d" />
          <circle cx="42" cy="40" r="2" fill="#ffffff" />
          <circle cx="64" cy="40" r="2" fill="#ffffff" />
          {/* Smile */}
          <path d="M43 56 Q50 61 57 56" stroke="#0b4a80" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};

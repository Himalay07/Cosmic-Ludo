import React from 'react';
import { DiceDisplayMode } from '../types';

interface DiceProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  displayMode?: DiceDisplayMode;
}

// Precision percentage coordinates (x, y) for standard 6-sided dice faces
const PIP_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 50 }],
  2: [
    { x: 26, y: 26 },
    { x: 74, y: 74 }
  ],
  3: [
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 75, y: 75 }
  ],
  4: [
    { x: 26, y: 26 },
    { x: 74, y: 26 },
    { x: 26, y: 74 },
    { x: 74, y: 74 }
  ],
  5: [
    { x: 26, y: 26 },
    { x: 74, y: 26 },
    { x: 50, y: 50 },
    { x: 26, y: 74 },
    { x: 74, y: 74 }
  ],
  6: [
    { x: 28, y: 24 },
    { x: 72, y: 24 },
    { x: 28, y: 50 },
    { x: 72, y: 50 },
    { x: 28, y: 76 },
    { x: 72, y: 76 }
  ]
};

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  onClick,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl',
    md: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl'
  }[size];

  // Standard pip sizes (proportional to die size)
  const pipSizes = {
    sm: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
    md: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    lg: 'w-4.5 h-4.5 sm:w-5 sm:h-5'
  }[size];

  // Slightly larger center pip when rolling a 1
  const centerSinglePipSizes = {
    sm: 'w-4 h-4 sm:w-5 sm:h-5',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-6.5 h-6.5 sm:w-7.5 sm:h-7.5'
  }[size];

  const pips = PIP_POSITIONS[value] || PIP_POSITIONS[1];

  return (
    <div
      onClick={canRoll && !isRolling ? onClick : undefined}
      className={`relative select-none transition-all duration-200 group ${
        canRoll && !isRolling
          ? 'cursor-pointer hover:scale-105 active:scale-95'
          : 'cursor-default'
      }`}
      role="button"
      tabIndex={canRoll ? 0 : -1}
      aria-label={`Dice showing ${value} dot${value > 1 ? 's' : ''}${canRoll ? ', click to roll' : ''}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canRoll && !isRolling) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Outer Neon Glow when ready to roll */}
      {canRoll && !isRolling && (
        <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-cyan-400/30 via-indigo-500/30 to-purple-400/30 blur-lg animate-pulse pointer-events-none" />
      )}

      {/* Main Dice Cube */}
      <div
        className={`${sizeClasses} aspect-square bg-gradient-to-br from-[#181f4a] via-[#0e1234] to-[#06081c] border-2 border-cyan-400/50 shadow-2xl shadow-black/95 flex items-center justify-center relative z-10 transition-transform ${
          isRolling ? 'animate-[spin_0.35s_linear_infinite] scale-105' : ''
        } ${
          canRoll && !isRolling
            ? 'ring-2 ring-cyan-400/90 shadow-[0_0_24px_rgba(6,182,212,0.55)]'
            : 'opacity-95'
        }`}
        style={{
          boxShadow: 'inset 0 0 16px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.7)'
        }}
      >
        {/* Cyber Corner Bracket Accents matching sci-fi cockpit */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

        {/* Faint subtle holographic grid background */}
        <div
          className="absolute inset-2 pointer-events-none opacity-15 rounded-lg"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(34,211,238,0.4) 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }}
        />

        {/* Precision Galactic Quantum Plasma Pips (Dots) */}
        <div className="absolute inset-0 pointer-events-none">
          {pips.map((pos, idx) => {
            const isSingleOne = value === 1;
            const currentPipSize = isSingleOne ? centerSinglePipSizes : pipSizes;

            return (
              <div
                key={`pip-${value}-${idx}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200 animate-in fade-in zoom-in-75`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`
                }}
              >
                {/* Cyber recessed socket ring */}
                <div
                  className="absolute -inset-1 rounded-full bg-[#05081b] border border-cyan-400/30 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.9)]"
                />

                {/* Glowing Cosmic Energy Pip */}
                <div
                  className={`${currentPipSize} rounded-full relative z-10`}
                  style={{
                    background: isSingleOne
                      ? 'radial-gradient(circle at 35% 32%, #ffffff 0%, #cffafe 25%, #22d3ee 55%, #0891b2 85%, #0369a1 100%)'
                      : 'radial-gradient(circle at 35% 32%, #ffffff 0%, #a5f3fc 28%, #06b6d4 60%, #0e7490 85%, #083344 100%)',
                    boxShadow: isSingleOne
                      ? '0 0 16px rgba(34, 211, 238, 0.95), 0 0 26px rgba(6, 182, 212, 0.6), inset 0 1px 2px #ffffff'
                      : '0 0 10px rgba(6, 182, 212, 0.9), 0 0 18px rgba(6, 182, 212, 0.45), inset 0 1px 2px #ffffff',
                    border: isSingleOne
                      ? '1.5px solid rgba(207, 250, 254, 0.95)'
                      : '1.5px solid rgba(165, 243, 252, 0.85)'
                  }}
                >
                  {/* Top-left specular glint */}
                  <div className="absolute top-[12%] left-[15%] w-[32%] h-[32%] rounded-full bg-white/95 pointer-events-none blur-[0.2px]" />

                  {/* Pulsing energy resonance ring on roll 1 */}
                  {isSingleOne && (
                    <div className="absolute -inset-1.5 rounded-full border border-cyan-300/40 animate-ping pointer-events-none" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { PlayerConfig } from '../types';
import { COLOR_METAS } from '../utils/geometry';
import { MascotIcon } from './MascotIcons';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { ConfettiCanvas } from './ConfettiCanvas';

interface VictoryModalProps {
  winner: PlayerConfig;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  onPlayAgain
}) => {
  const meta = COLOR_METAS[winner.color];

  useEffect(() => {
    sound.play('win');
  }, [winner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-[fadeIn_0.3s_ease-out] select-none overflow-hidden">
      {/* Canvas-based high performance galactic particle confetti system */}
      <ConfettiCanvas primaryColor={meta.hex} />

      {/* Main Victory Card */}
      <div
        className="relative z-10 w-full max-w-[480px] bg-gradient-to-b from-[#181c42] to-[#090b1c] border-2 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-4"
        style={{
          borderColor: meta.hex,
          boxShadow: `0 0 60px ${meta.glow.replace('0.8', '0.4')}`
        }}
      >
        {/* Crown / Trophy Icon */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full p-2 relative flex items-center justify-center animate-bounce"
            style={{
              backgroundColor: `${meta.hex}22`,
              border: `3px solid ${meta.hex}`,
              boxShadow: `0 0 30px ${meta.glow}`
            }}
          >
            <MascotIcon color={winner.color} />
          </div>
          <div className="absolute -top-3 -right-2 p-2 rounded-full bg-amber-400 text-black shadow-lg">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Victory Announcement */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Galactic Champion</span>
          </div>

          <h2
            className="font-['Orbitron'] text-2xl sm:text-4xl font-black tracking-wider uppercase drop-shadow-md mt-1"
            style={{ color: meta.hex }}
          >
            {winner.name} WINS!
          </h2>

          <p className="text-sm text-indigo-200/70 font-['Rajdhani'] font-semibold mt-1">
            Successfully piloted all 4 starships into the center wormhole.
          </p>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onPlayAgain}
          className="w-full mt-3 py-3.5 px-6 rounded-2xl font-['Orbitron'] font-black text-sm tracking-widest text-black bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 hover:from-amber-300 hover:to-purple-300 shadow-[0_10px_30px_rgba(255,194,71,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>NEW MISSION</span>
        </button>
      </div>
    </div>
  );
};

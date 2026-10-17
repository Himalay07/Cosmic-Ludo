import React from 'react';
import { X, ShieldAlert, Sparkles, Zap, Trophy, Rocket } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-[540px] bg-gradient-to-b from-[#161a3d] to-[#0b0d22] border border-white/20 rounded-2xl p-6 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/10">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="font-['Orbitron'] font-bold text-lg text-white tracking-wider">
            MISSION BRIEFING PROTOCOL
          </h2>
        </div>

        {/* Rules Body */}
        <div className="flex flex-col gap-3.5 text-xs sm:text-sm leading-relaxed font-['Rajdhani'] font-medium overflow-y-auto max-h-[60vh] pr-1">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <Rocket className="w-5 h-5 text-cyan-400 flex-none mt-0.5" />
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-cyan-300">
                1. LAUNCH & DEPLOYMENT
              </div>
              <div>
                Roll a <b className="text-amber-300">6</b> to launch a docked ship from your hangar pad onto the orbital track. Rolling a 6 grants a bonus turn.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <Zap className="w-5 h-5 text-rose-400 flex-none mt-0.5" />
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-rose-300">
                2. INTERCEPT & CAPTURE
              </div>
              <div>
                Landing directly on a rival ship vaporizes it back to their hangar base! Capturing an enemy gives you an extra turn roll.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <ShieldAlert className="w-5 h-5 text-purple-400 flex-none mt-0.5" />
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-purple-300">
                3. SAFE HARBORS & CORRIDORS
              </div>
              <div>
                Cells marked with a <b className="text-amber-300">★ Star</b> and faction launch pads are protected safe zones where ships cannot be captured.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <Trophy className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-amber-300">
                4. EXACT DOCKING & VICTORY
              </div>
              <div>
                Navigate the full orbit into your colored home runway. Docking at the center wormhole requires an <b>exact die roll</b>. First pilot to dock all 4 ships wins the galaxy!
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-['Orbitron'] font-bold text-xs tracking-wider transition-all"
        >
          ACKNOWLEDGE & RESUME
        </button>
      </div>
    </div>
  );
};

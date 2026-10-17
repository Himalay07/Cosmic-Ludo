import React from 'react';
import { PlayerColor, PlayerConfig } from '../types';
import { COLOR_METAS, COLOR_ORDER } from '../utils/geometry';
import { MascotIcon } from './MascotIcons';
import { Rocket, Users, Bot, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface SetupScreenProps {
  players: PlayerConfig[];
  onUpdatePlayer: (color: PlayerColor, updates: Partial<PlayerConfig>) => void;
  onLaunch: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  players,
  onUpdatePlayer,
  onLaunch,
  isMuted,
  onToggleMute
}) => {
  const setPreset = (mode: 'solo' | 'duo' | 'party' | 'spectate') => {
    sound.play('select');
    if (mode === 'solo') {
      onUpdatePlayer('red', { isAI: false });
      onUpdatePlayer('green', { isAI: true });
      onUpdatePlayer('yellow', { isAI: true });
      onUpdatePlayer('blue', { isAI: true });
    } else if (mode === 'duo') {
      onUpdatePlayer('red', { isAI: false });
      onUpdatePlayer('green', { isAI: true });
      onUpdatePlayer('yellow', { isAI: false });
      onUpdatePlayer('blue', { isAI: true });
    } else if (mode === 'party') {
      COLOR_ORDER.forEach(c => onUpdatePlayer(c, { isAI: false }));
    } else if (mode === 'spectate') {
      COLOR_ORDER.forEach(c => onUpdatePlayer(c, { isAI: true }));
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[620px] mx-auto px-4 py-8 flex flex-col items-center select-none">
      {/* Game Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Retro Sci-Fi Arcade Edition</span>
        </div>

        <h1 className="font-['Orbitron'] text-3xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 via-amber-300 to-rose-400 drop-shadow-[0_0_25px_rgba(120,140,255,0.4)]">
          COSMIC LUDO
        </h1>
        <p className="text-xs sm:text-sm text-indigo-200/60 font-['Rajdhani'] font-semibold tracking-widest uppercase mt-1">
          Galactic Race · 4 Pilots · 1 Wormhole
        </p>
      </div>

      {/* Preset Mode Quick Bar */}
      <div className="w-full grid grid-cols-4 gap-2 mb-4">
        {[
          { id: 'solo', label: '1P vs 3 AI', icon: Bot },
          { id: 'duo', label: '2P Co-op', icon: Users },
          { id: 'party', label: '4P Local', icon: Users },
          { id: 'spectate', label: 'Spectate', icon: Sparkles }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id as 'solo' | 'duo' | 'party' | 'spectate')}
            className="py-2 px-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-cyan-300 text-[11px] font-['Orbitron'] font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <p.icon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Pilot Roster Setup Card */}
      <div className="w-full bg-gradient-to-b from-[#141736]/90 to-[#0b0d20]/90 border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <h2 className="font-['Orbitron'] text-xs sm:text-sm font-bold tracking-widest text-indigo-300 uppercase">
            Pilot Flight Manifest
          </h2>
          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Seats List */}
        <div className="flex flex-col gap-3">
          {COLOR_ORDER.map(color => {
            const player = players.find(p => p.color === color);
            if (!player) return null;
            const meta = COLOR_METAS[color];

            return (
              <div
                key={color}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all"
                style={{
                  boxShadow: `inset 0 0 20px ${meta.glow.replace('0.8', '0.05')}`
                }}
              >
                {/* Mascot Icon */}
                <div
                  className="w-10 h-10 rounded-full p-1 flex-none relative"
                  style={{
                    backgroundColor: `${meta.hex}22`,
                    border: `2px solid ${meta.hex}`,
                    boxShadow: `0 0 12px ${meta.glow.replace('0.8', '0.4')}`
                  }}
                >
                  <MascotIcon color={color} />
                </div>

                {/* Pilot Name Input */}
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-mono text-white/40 uppercase">
                    {meta.planet}
                  </div>
                  <input
                    type="text"
                    value={player.name}
                    onChange={e => onUpdatePlayer(color, { name: e.target.value })}
                    maxLength={16}
                    placeholder={meta.name}
                    className="w-full bg-transparent border-b border-transparent focus:border-cyan-400 outline-none text-white font-['Rajdhani'] font-bold text-sm sm:text-base py-0.5"
                    style={{ color: meta.hex }}
                  />
                </div>

                {/* Role Switcher (Human vs AI) */}
                <div className="flex rounded-lg overflow-hidden border border-white/15 bg-black/40 flex-none p-0.5">
                  <button
                    onClick={() => {
                      sound.play('select');
                      onUpdatePlayer(color, { isAI: false });
                    }}
                    className={`px-2.5 py-1 text-[11px] font-['Orbitron'] font-bold rounded transition-all ${
                      !player.isAI
                        ? 'text-black shadow-md'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                    style={{
                      backgroundColor: !player.isAI ? meta.hex : 'transparent'
                    }}
                  >
                    HUMAN
                  </button>
                  <button
                    onClick={() => {
                      sound.play('select');
                      onUpdatePlayer(color, { isAI: true });
                    }}
                    className={`px-2.5 py-1 text-[11px] font-['Orbitron'] font-bold rounded transition-all ${
                      player.isAI
                        ? 'text-black shadow-md'
                        : 'text-white/40 hover:text-white/80'
                    }`}
                    style={{
                      backgroundColor: player.isAI ? meta.hex : 'transparent'
                    }}
                  >
                    AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Launch Button */}
        <button
          onClick={() => {
            sound.play('launch');
            onLaunch();
          }}
          className="w-full mt-5 py-3.5 px-6 rounded-xl font-['Orbitron'] font-black text-sm sm:text-base tracking-widest text-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 shadow-[0_10px_30px_rgba(63,167,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
        >
          <Rocket className="w-5 h-5" />
          <span>LAUNCH MISSION</span>
        </button>

        <p className="text-[11px] text-indigo-200/50 text-center font-['Rajdhani'] mt-3 leading-relaxed">
          Roll 6 to launch ships from base • Star cells are safe safezones • 1st to center wormhole wins!
        </p>
      </div>
    </div>
  );
};

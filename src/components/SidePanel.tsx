import React, { useRef, useEffect } from 'react';
import {
  PlayerColor,
  PlayerConfig,
  LogMessage,
  GameSpeed,
  TokenState,
  DiceDisplayMode
} from '../types';
import { COLOR_METAS, COLOR_ORDER, FINISH_STEP } from '../utils/geometry';
import { MascotIcon } from './MascotIcons';
import { Dice } from './Dice';
import { Volume2, VolumeX, HelpCircle, RotateCcw, FastForward, Play, Zap } from 'lucide-react';

interface SidePanelProps {
  players: PlayerConfig[];
  currentColor: PlayerColor;
  tokens: TokenState[];
  statusText: string;
  canRoll: boolean;
  isRolling: boolean;
  diceValue: number;
  onRoll: () => void;
  logs: LogMessage[];
  speed: GameSpeed;
  onSpeedChange: (speed: GameSpeed) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRules: () => void;
  onRestart: () => void;
  diceDisplayMode?: DiceDisplayMode;
  onToggleDiceMode?: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  players,
  currentColor,
  tokens,
  statusText,
  canRoll,
  isRolling,
  diceValue,
  onRoll,
  logs,
  speed,
  onSpeedChange,
  isMuted,
  onToggleMute,
  onOpenRules,
  onRestart,
  diceDisplayMode = 'pips',
  onToggleDiceMode
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom on new events
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const activePlayer = players.find(p => p.color === currentColor);
  const activeMeta = activePlayer ? COLOR_METAS[activePlayer.color] : COLOR_METAS.red;

  return (
    <div className="flex flex-col gap-3.5 w-full max-w-[420px] lg:max-w-[340px]">
      {/* 1. TOP UTILITY TOOLBAR */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-[#11142c]/90 border border-white/10 shadow-lg">
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenRules}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Mission Briefing & Rules"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Rules</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
          {(['normal', 'fast', 'turbo'] as GameSpeed[]).map(s => {
            const isSelected = speed === s;
            const labels = { normal: '1x', fast: '2x', turbo: '4x' };
            const icons = { normal: Play, fast: FastForward, turbo: Zap };
            const Icon = icons[s];

            return (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : 'text-white/40 hover:text-white/80'
                }`}
                title={`Game Speed: ${s}`}
              >
                <Icon className="w-3 h-3" />
                <span>{labels[s]}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onRestart}
          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 transition-colors"
          title="Restart Mission"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. PILOT ROSTER STATUS */}
      <div className="p-3 rounded-xl bg-gradient-to-b from-[#141736]/90 to-[#0b0d20]/90 border border-white/10 shadow-xl flex flex-col gap-2">
        <div className="text-[10px] font-mono tracking-widest text-indigo-300/60 uppercase px-1">
          Galactic Pilot Standings
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {COLOR_ORDER.map(color => {
            const p = players.find(player => player.color === color);
            if (!p) return null;
            const meta = COLOR_METAS[color];
            const isCurrent = currentColor === color;
            const docked = tokens.filter(t => t.color === color && t.steps === FINISH_STEP).length;

            return (
              <div
                key={color}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all border ${
                  isCurrent
                    ? 'bg-white/10 border-white/30 shadow-[0_0_16px_rgba(255,255,255,0.15)] ring-1 ring-white/30'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
                style={{
                  boxShadow: isCurrent ? `0 0 14px ${meta.glow.replace('0.8', '0.4')}` : undefined
                }}
              >
                {/* Pilot Mascot Avatar */}
                <div
                  className="w-7 h-7 rounded-full p-0.5 relative flex-none"
                  style={{
                    backgroundColor: `${meta.hex}22`,
                    border: `1.5px solid ${meta.hex}`
                  }}
                >
                  <MascotIcon color={color} />
                </div>

                {/* Name and Role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-['Orbitron'] font-bold text-xs truncate"
                      style={{ color: meta.hex }}
                    >
                      {p.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-white/50 font-mono">
                      {p.isAI ? 'AI' : 'YOU'}
                    </span>
                  </div>
                </div>

                {/* Docked progress dots */}
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i < docked
                          ? 'bg-amber-400 shadow-[0_0_6px_#ffc247]'
                          : 'bg-white/10 border border-white/20'
                      }`}
                      title={`${docked}/4 Docked`}
                    />
                  ))}
                  <span className="text-[11px] font-mono text-white/60 ml-1">
                    {docked}/4
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TURN COMMAND BOX */}
      <div
        className="p-3.5 rounded-xl bg-gradient-to-b from-[#161a3d]/90 to-[#0c0e24]/90 border border-white/10 shadow-xl flex flex-col items-center gap-3 text-center"
        style={{
          borderLeft: `4px solid ${activeMeta.hex}`
        }}
      >
        <div className="w-full">
          <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
            Active Turn Command
          </div>
          <div
            className="font-['Orbitron'] font-bold text-sm sm:text-base mt-0.5 tracking-wide"
            style={{ color: activeMeta.hex }}
          >
            {statusText}
          </div>
        </div>

        {/* Dice roll execution button */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-none">
            <Dice
              value={diceValue}
              isRolling={isRolling}
              canRoll={canRoll}
              onClick={onRoll}
              size="sm"
              displayMode={diceDisplayMode}
            />
          </div>

          <button
            onClick={onRoll}
            disabled={!canRoll || isRolling}
            className={`flex-1 py-3 px-4 rounded-xl font-['Orbitron'] font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
              canRoll && !isRolling
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black cursor-pointer shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRolling ? 'Rolling...' : 'Roll Dice'}</span>
          </button>
        </div>
      </div>

      {/* 4. MISSION LOG FEED */}
      <div className="p-3 rounded-xl bg-[#0e112a]/80 border border-white/10 shadow-xl flex flex-col flex-1 min-h-[140px] max-h-[180px]">
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/5">
          <span className="text-[10px] font-mono tracking-widest text-indigo-300/60 uppercase">
            Mission Flight Log
          </span>
          <span className="text-[9px] text-white/30 font-mono">Live Telemetry</span>
        </div>

        <div
          ref={logContainerRef}
          className="flex flex-col gap-1 overflow-y-auto text-[11px] leading-relaxed pr-1 text-slate-300 font-['Rajdhani'] font-medium select-text scrollbar-thin"
        >
          {logs.length === 0 ? (
            <div className="text-white/30 text-center py-4 italic">
              Awaiting mission telemetry...
            </div>
          ) : (
            logs.map(log => {
              const meta = log.color ? COLOR_METAS[log.color] : null;
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-1.5 py-0.5 border-b border-white/[0.02]"
                >
                  <span className="text-white/30 font-mono text-[9px] flex-none pt-0.5">
                    {log.timestamp}
                  </span>
                  <span className="text-xs flex-none">{log.icon || '🛸'}</span>
                  <span
                    className="flex-1"
                    style={{ color: meta ? meta.hex : undefined }}
                  >
                    {log.text}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

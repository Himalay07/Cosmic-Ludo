import React, { useRef } from 'react';
import {
  PlayerColor,
  TokenState,
  VisualPopup,
  PlayerConfig,
  DiceDisplayMode
} from '../types';
import {
  COLOR_ORDER,
  COLOR_METAS,
  RING_CELLS,
  HOME_PATHS,
  START_INDEXES,
  SAFE_COORDS_SET,
  STAR_COORDS,
  getTokenCoord
} from '../utils/geometry';
import { MascotIcon } from './MascotIcons';
import { Dice } from './Dice';

interface GameBoardProps {
  tokens: TokenState[];
  currentColor: PlayerColor;
  movableTokens: TokenState[];
  onTokenSelect: (token: TokenState) => void;
  diceValue: number;
  isRolling: boolean;
  canRoll: boolean;
  onDiceClick: () => void;
  popups: VisualPopup[];
  isShaking: boolean;
  players: PlayerConfig[];
  winnerColor?: PlayerColor | null;
  diceDisplayMode?: DiceDisplayMode;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tokens,
  currentColor,
  movableTokens,
  onTokenSelect,
  diceValue,
  isRolling,
  canRoll,
  onDiceClick,
  popups,
  isShaking,
  players,
  winnerColor,
  diceDisplayMode = 'pips'
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  // Group tokens by coordinate to apply intelligent clustering offsets
  const tokenGroups: Record<string, TokenState[]> = {};
  tokens.forEach(t => {
    const [r, c] = getTokenCoord(t.color, t.tokenIndex, t.steps);
    const key = `${r},${c}`;
    if (!tokenGroups[key]) tokenGroups[key] = [];
    tokenGroups[key].push(t);
  });

  const getOffsetStyle = (t: TokenState) => {
    const [r, c] = getTokenCoord(t.color, t.tokenIndex, t.steps);
    const key = `${r},${c}`;
    const group = tokenGroups[key] || [t];
    const indexInGroup = group.findIndex(gt => gt.id === t.id);

    // 1 cell is (100 / 15)% ≈ 6.6667% of the board
    const CELL_SIZE_PCT = 100 / 15;

    // Sub-cell offset factors (in fractions of cell size)
    // Ensures multiple tokens on the same start cell or star cell remain strictly within cell bounds
    const subOffsets: Record<number, { x: number; y: number }[]> = {
      1: [{ x: 0, y: 0 }],
      2: [
        { x: -0.19, y: -0.09 },
        { x: 0.19, y: 0.09 }
      ],
      3: [
        { x: 0, y: -0.19 },
        { x: -0.19, y: 0.13 },
        { x: 0.19, y: 0.13 }
      ],
      4: [
        { x: -0.18, y: -0.18 },
        { x: 0.18, y: -0.18 },
        { x: -0.18, y: 0.18 },
        { x: 0.18, y: 0.18 }
      ]
    };

    const count = Math.min(group.length, 4);
    const offsetConfig = subOffsets[count] || subOffsets[4];
    const cellOff = offsetConfig[indexInGroup % offsetConfig.length];

    // Offsets scaled to board percentage
    const offX = cellOff.x * CELL_SIZE_PCT;
    const offY = cellOff.y * CELL_SIZE_PCT;

    // Sizing: single token is 5.5% of board (~82% of cell), clustered tokens are 3.8% or 3.3%
    const sizePct = group.length === 1 ? 5.5 : group.length === 2 ? 3.8 : 3.3;

    // Cell center in percentage
    const centerX = ((c + 0.5) / 15) * 100;
    const centerY = ((r + 0.5) / 15) * 100;

    return {
      left: `calc(${centerX}% + ${offX}%)`,
      top: `calc(${centerY}% + ${offY}%)`,
      width: `${sizePct}%`,
      height: `${sizePct}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  const isMovable = (t: TokenState) => movableTokens.some(mt => mt.id === t.id);

  return (
    <div className="relative w-full max-w-[620px] aspect-square mx-auto select-none">
      {/* Outer Neon Frame */}
      <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-blue-500/20 blur-xl pointer-events-none" />

      <div
        ref={boardRef}
        className={`relative w-full h-full rounded-2xl bg-[#090b20] border-2 border-indigo-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(30,20,80,0.4)] grid grid-cols-15 grid-rows-15 overflow-hidden transition-transform duration-100 ${
          isShaking ? 'animate-[shake_0.45s_ease-in-out]' : ''
        }`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(15, minmax(0, 1fr))'
        }}
      >
        {/* 1. YARDS (4 Corners) */}
        {COLOR_ORDER.map(color => {
          const meta = COLOR_METAS[color];
          const [cr, cc] = meta.corner;
          const isActive = currentColor === color && !winnerColor;
          const isWinner = winnerColor === color;
          const playerConfig = players.find(p => p.color === color);

          return (
            <div
              key={`yard-${color}`}
              className={`relative m-1 rounded-xl border transition-all duration-300 z-1 overflow-hidden ${
                isActive
                  ? 'ring-2 ring-cyan-400 shadow-[0_0_24px_rgba(63,167,255,0.4),inset_0_0_20px_rgba(63,167,255,0.15)] border-cyan-400/80 animate-pulse'
                  : isWinner
                  ? 'ring-4 ring-yellow-400 shadow-[0_0_36px_#ffc247,inset_0_0_30px_#ffc247] border-yellow-400'
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                gridRow: `${cr + 1} / ${cr + 7}`,
                gridColumn: `${cc + 1} / ${cc + 7}`,
                background: `radial-gradient(circle at 35% 30%, ${meta.glow.replace('0.8', '0.28')}, rgba(8, 10, 28, 0.9) 75%)`
              }}
            >
              {/* Header Label */}
              <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                <span
                  className="font-['Orbitron'] font-bold tracking-widest text-[9px] sm:text-[11px] uppercase truncate max-w-[80%]"
                  style={{ color: meta.hex }}
                >
                  {playerConfig?.name || meta.planet}
                </span>
                <span className="text-[9px] text-white/50 font-mono">
                  {playerConfig?.isAI ? 'AI' : 'YOU'}
                </span>
              </div>

              {/* 4 Docking Rings for inactive ships - mathematically aligned with YARD_SLOTS (centers at 25% and 75%) */}
              {[
                { x: '25%', y: '25%' },
                { x: '75%', y: '25%' },
                { x: '25%', y: '75%' },
                { x: '75%', y: '75%' }
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-dashed border-white/25 bg-white/[0.03] shadow-inner flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: pos.x, top: pos.y }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                </div>
              ))}

              <div className="absolute bottom-1.5 inset-x-0 text-center text-[8px] sm:text-[9px] text-white/40 tracking-widest font-mono pointer-events-none">
                BASE HANGAR
              </div>
            </div>
          );
        })}

        {/* 2. CENTER WORMHOLE PANEL (Rows 7..9, Cols 7..9) */}
        <div
          className="relative m-0.5 rounded-xl overflow-hidden flex items-center justify-center z-10 bg-radial from-[#05061a] to-[#0d102e] border border-indigo-500/30"
          style={{
            gridRow: '7 / 10',
            gridColumn: '7 / 10'
          }}
        >
          {/* Rotating Cosmic Wormhole Spiral */}
          <div
            className="absolute inset-1 rounded-full animate-[spin_8s_linear_infinite] opacity-90 blur-[0.5px]"
            style={{
              background:
                'conic-gradient(from 0deg, #ff5b4a, #ffc247, #b06bff, #3fa7ff, #ff5b4a)',
              maskImage: 'radial-gradient(circle, transparent 28%, black 50%, black 100%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 28%, black 50%, black 100%)'
            }}
          />

          {/* Center Dark Gravity Void */}
          <div className="absolute inset-[12%] rounded-full bg-[#05061a] shadow-[0_0_20px_10px_rgba(120,100,255,0.4),inset_0_0_12px_rgba(0,0,0,0.9)] flex items-center justify-center z-10" />

          {/* Center Interactive Dice */}
          <div className="relative z-20 flex items-center justify-center">
            <Dice
              value={diceValue}
              isRolling={isRolling}
              canRoll={canRoll}
              onClick={onDiceClick}
              size="md"
              displayMode={diceDisplayMode}
            />
          </div>
        </div>

        {/* 3. TRACK CELLS (52 Ring cells) */}
        {RING_CELLS.map(([r, c], idx) => {
          const isSafe = SAFE_COORDS_SET.has(`${r},${c}`);
          const isStar = STAR_COORDS.some(([sr, sc]) => sr === r && sc === c);

          // Find if this is a starting launch cell for a faction
          let startFaction: PlayerColor | null = null;
          COLOR_ORDER.forEach(color => {
            if (START_INDEXES[color] === idx) {
              startFaction = color;
            }
          });

          return (
            <div
              key={`ring-${idx}-${r}-${c}`}
              className={`relative border border-white/[0.04] flex items-center justify-center transition-colors ${
                startFaction
                  ? 'bg-white/[0.12]'
                  : isSafe
                  ? 'bg-white/[0.06]'
                  : 'bg-white/[0.015]'
              }`}
              style={{
                gridRow: `${r + 1} / ${r + 2}`,
                gridColumn: `${c + 1} / ${c + 2}`,
                backgroundColor: startFaction
                  ? COLOR_METAS[startFaction].bgRgba
                  : undefined
              }}
            >
              {/* Star Safe Marker */}
              {isStar && (
                <span className="text-amber-300/60 text-[10px] sm:text-xs font-bold pointer-events-none drop-shadow-[0_0_4px_#ffc247]">
                  ★
                </span>
              )}

              {/* Start Pad Marker */}
              {startFaction && !isStar && (
                <div
                  className="w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: COLOR_METAS[startFaction].hex,
                    boxShadow: `0 0 6px ${COLOR_METAS[startFaction].hex}`
                  }}
                />
              )}
            </div>
          );
        })}

        {/* 4. HOME PATH CORRIDORS (6 per player) */}
        {COLOR_ORDER.map(color => {
          const path = HOME_PATHS[color];
          const meta = COLOR_METAS[color];

          return path.map(([r, c], homeIdx) => (
            <div
              key={`home-${color}-${homeIdx}`}
              className="relative border border-white/[0.06] flex items-center justify-center"
              style={{
                gridRow: `${r + 1} / ${r + 2}`,
                gridColumn: `${c + 1} / ${c + 2}`,
                backgroundColor: meta.hex,
                opacity: 0.25 + homeIdx * 0.12
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: meta.hex }}
              />
            </div>
          ));
        })}

        {/* 5. ACTIVE TOKENS */}
        {tokens.map(token => {
          const isSelectable = isMovable(token);
          const meta = COLOR_METAS[token.color];
          const style = getOffsetStyle(token);

          return (
            <div
              key={token.id}
              onClick={() => {
                if (isSelectable) {
                  onTokenSelect(token);
                }
              }}
              style={style}
              className={`absolute z-30 transition-all duration-150 flex items-center justify-center ${
                isSelectable
                  ? 'cursor-pointer animate-[bounce_0.8s_infinite] scale-110 z-40'
                  : 'cursor-default'
              }`}
            >
              {/* Highlight halo when ready to move */}
              {isSelectable && (
                <div
                  className="absolute -inset-1 rounded-full animate-ping opacity-75 pointer-events-none"
                  style={{ backgroundColor: meta.hex }}
                />
              )}

              {/* Token Avatar Mascot */}
              <div
                className={`w-full h-full rounded-full p-0.5 relative transition-transform ${
                  isSelectable ? 'hover:scale-125' : ''
                }`}
                style={{
                  filter: `drop-shadow(0 0 6px ${meta.glow}) drop-shadow(0 4px 6px rgba(0,0,0,0.6))`
                }}
              >
                <MascotIcon color={token.color} />
              </div>
            </div>
          );
        })}

        {/* 6. VISUAL POPUPS (Capture KO, Liftoff, Dock Touchdown) */}
        {popups.map(p => {
          const centerX = ((p.col + 0.5) / 15) * 100;
          const centerY = ((p.row + 0.5) / 15) * 100;
          const meta = COLOR_METAS[p.color];

          return (
            <div
              key={p.id}
              className="absolute z-50 pointer-events-none font-['Orbitron'] font-black whitespace-nowrap animate-[popupFloat_1.3s_ease-out_forwards] -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 shadow-2xl"
              style={{
                left: `${centerX}%`,
                top: `${centerY}%`,
                color: meta.hex,
                boxShadow: `0 0 20px ${meta.glow}`
              }}
            >
              {p.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayerColor,
  PlayerConfig,
  TokenState,
  GamePhase,
  GameSpeed,
  LogMessage,
  VisualPopup,
  DiceDisplayMode
} from './types';
import {
  COLOR_ORDER,
  COLOR_METAS,
  START_INDEXES,
  RING_CELLS,
  SAFE_COORDS_SET,
  FINISH_STEP,
  getTokenCoord
} from './utils/geometry';
import { sound } from './utils/audio';
import { Starfield } from './components/Starfield';
import { SetupScreen } from './components/SetupScreen';
import { GameBoard } from './components/GameBoard';
import { SidePanel } from './components/SidePanel';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';

const INITIAL_PLAYERS: PlayerConfig[] = [
  { color: 'red', name: 'Mars Vanguard', isAI: false },
  { color: 'green', name: 'Nebula Phantom', isAI: true },
  { color: 'yellow', name: 'Saturn Sovereign', isAI: true },
  { color: 'blue', name: 'Neptune Kraken', isAI: true }
];

const createInitialTokens = (): TokenState[] => {
  const list: TokenState[] = [];
  COLOR_ORDER.forEach(color => {
    for (let i = 0; i < 4; i++) {
      list.push({
        id: `${color}-${i}`,
        color,
        tokenIndex: i,
        steps: -1
      });
    }
  });
  return list;
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<PlayerConfig[]>(INITIAL_PLAYERS);
  const [tokens, setTokens] = useState<TokenState[]>(createInitialTokens);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [sixStreak, setSixStreak] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Welcome to Cosmic Ludo');
  const [movableTokens, setMovableTokens] = useState<TokenState[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [popups, setPopups] = useState<VisualPopup[]>([]);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [speed, setSpeed] = useState<GameSpeed>('normal');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerConfig | null>(null);
  const [diceDisplayMode, setDiceDisplayMode] = useState<DiceDisplayMode>('pips');

  // References for handling asynchronous step loops without stale closures
  const tokensRef = useRef<TokenState[]>(tokens);
  tokensRef.current = tokens;
  const phaseRef = useRef<GamePhase>(phase);
  phaseRef.current = phase;
  const currentIdxRef = useRef<number>(currentIdx);
  currentIdxRef.current = currentIdx;
  const speedRef = useRef<GameSpeed>(speed);
  speedRef.current = speed;
  const playersRef = useRef<PlayerConfig[]>(players);
  playersRef.current = players;
  const sixStreakRef = useRef<number>(sixStreak);
  sixStreakRef.current = sixStreak;

  const currentColor = COLOR_ORDER[currentIdx];
  const activePlayer = players[currentIdx];

  const getSpeedDelay = useCallback((baseMs: number) => {
    const s = speedRef.current;
    if (s === 'turbo') return Math.max(15, baseMs * 0.2);
    if (s === 'fast') return Math.max(30, baseMs * 0.5);
    return baseMs;
  }, []);

  const addLog = useCallback((text: string, color?: PlayerColor, icon?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      color,
      icon,
      timestamp: timeStr
    };
    setLogs(prev => [...prev.slice(-45), newLog]);
  }, []);

  const triggerPopup = useCallback((type: 'capture' | 'launch' | 'finish', text: string, row: number, col: number, color: PlayerColor) => {
    const id = Math.random().toString(36).substring(2, 9);
    setPopups(prev => [...prev, { id, type, text, row, col, color }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1400);
  }, []);

  // Update Player Config in Setup
  const handleUpdatePlayer = (color: PlayerColor, updates: Partial<PlayerConfig>) => {
    setPlayers(prev => prev.map(p => (p.color === color ? { ...p, ...updates } : p)));
  };

  // Launch Game from Setup
  const handleLaunchGame = () => {
    setTokens(createInitialTokens());
    setCurrentIdx(0);
    setSixStreak(0);
    setLogs([]);
    setPopups([]);
    setWinner(null);
    setDiceValue(1);
    setIsRolling(false);
    setMovableTokens([]);
    setPhase('awaiting-roll');

    const firstPlayer = players[0];
    setStatusText(
      firstPlayer.isAI
        ? `${firstPlayer.name} (AI) is rolling...`
        : `${firstPlayer.name}'s turn — Roll the dice`
    );
    addLog(`Mission Control active. ${firstPlayer.name} departs first.`, firstPlayer.color, '🚀');
  };

  // Check valid target for a token
  const getMoveTarget = (token: TokenState, roll: number): number | null => {
    if (token.steps === -1) {
      return roll === 6 ? 0 : null;
    }
    const target = token.steps + roll;
    return target <= FINISH_STEP ? target : null;
  };

  const getMovableForColor = (color: PlayerColor, roll: number, currentTokens = tokensRef.current): TokenState[] => {
    const colorTokens = currentTokens.filter(t => t.color === color);
    return colorTokens.filter(t => getMoveTarget(t, roll) !== null);
  };

  // Advanced AI decision heuristics
  const chooseAIToken = (movable: TokenState[], roll: number): TokenState => {
    // 1. Capture enemy token if possible
    for (const t of movable) {
      const target = getMoveTarget(t, roll);
      if (target !== null && target <= 50) {
        const ringIdx = (START_INDEXES[t.color] + target) % 52;
        const [r, c] = RING_CELLS[ringIdx];
        if (!SAFE_COORDS_SET.has(`${r},${c}`)) {
          const hasVictim = tokensRef.current.some(
            o =>
              o.color !== t.color &&
              o.steps >= 0 &&
              o.steps <= 50 &&
              (START_INDEXES[o.color] + o.steps) % 52 === ringIdx
          );
          if (hasVictim) return t;
        }
      }
    }

    // 2. Launch token from base hangar if rolled 6
    if (roll === 6) {
      const baseToken = movable.find(t => t.steps === -1);
      if (baseToken) return baseToken;
    }

    // 3. Move token into center wormhole (Finish)
    const finisher = movable.find(t => getMoveTarget(t, roll) === FINISH_STEP);
    if (finisher) return finisher;

    // 4. Move token closest to home
    return [...movable].sort((a, b) => b.steps - a.steps)[0];
  };

  // Advance to next pilot's turn
  const advanceTurn = useCallback(() => {
    if (phaseRef.current === 'over') return;
    setSixStreak(0);
    sixStreakRef.current = 0;
    const nextIdx = (currentIdxRef.current + 1) % 4;
    setCurrentIdx(nextIdx);
    currentIdxRef.current = nextIdx;
    setMovableTokens([]);
    setPhase('awaiting-roll');

    const nextPlayer = playersRef.current[nextIdx];
    setStatusText(
      nextPlayer.isAI
        ? `${nextPlayer.name} (AI) is rolling...`
        : `${nextPlayer.name}'s turn — Roll the dice`
    );
  }, []);

  // Main turn resolution after dice roll
  const resolveRoll = useCallback((roll: number) => {
    const cColor = COLOR_ORDER[currentIdxRef.current];
    const player = playersRef.current[currentIdxRef.current];

    let newStreak = sixStreakRef.current;
    if (roll === 6) {
      newStreak++;
      setSixStreak(newStreak);
      sixStreakRef.current = newStreak;

      if (newStreak === 3) {
        sound.play('forfeit');
        addLog(`🚫 ${player.name} rolled three 6's in a row — Turn forfeit!`, cColor, '⚠️');
        setStatusText(`Three 6's in a row! Turn forfeited.`);
        setPhase('animating');
        setTimeout(advanceTurn, getSpeedDelay(1000));
        return;
      }
    } else {
      setSixStreak(0);
      sixStreakRef.current = 0;
    }

    const movable = getMovableForColor(cColor, roll);

    if (movable.length === 0) {
      addLog(`${player.name} rolled ${roll} — No starships can move.`, cColor, '🎲');
      setStatusText(`${player.name} rolled ${roll} — No moves available.`);
      setPhase('animating');

      setTimeout(() => {
        if (roll === 6 && sixStreakRef.current < 3) {
          setPhase('awaiting-roll');
          setStatusText(
            player.isAI
              ? `${player.name} (AI) rolled a 6 and rolls again!`
              : `${player.name} rolled a 6 — Roll again!`
          );
        } else {
          advanceTurn();
        }
      }, getSpeedDelay(900));
      return;
    }

    // Exactly 1 movable token -> auto move
    if (movable.length === 1) {
      setPhase('animating');
      setTimeout(() => {
        executeMove(movable[0], roll);
      }, getSpeedDelay(400));
      return;
    }

    // AI Player -> evaluate and pick automatically
    if (player.isAI) {
      setPhase('animating');
      const chosen = chooseAIToken(movable, roll);
      setTimeout(() => {
        executeMove(chosen, roll);
      }, getSpeedDelay(550));
      return;
    }

    // Human player with multiple choices
    setPhase('awaiting-select');
    setMovableTokens(movable);
    setStatusText(`${player.name} rolled ${roll} — Select a ship to move`);
  }, [addLog, advanceTurn, getSpeedDelay]);

  // Execute token move with step-by-step animation
  const executeMove = (token: TokenState, roll: number) => {
    setPhase('animating');
    setMovableTokens([]);
    const player = playersRef.current[currentIdxRef.current];

    // Case A: Launch from Base Yard (steps: -1 -> 0)
    if (token.steps === -1) {
      sound.play('launch');
      const startCell = RING_CELLS[START_INDEXES[token.color]];
      triggerPopup('launch', '🛸 LIFTOFF!', startCell[0], startCell[1], token.color);
      addLog(`🚀 ${player.name} launched a starship onto the orbital track!`, token.color, '✨');

      setTokens(prev =>
        prev.map(t => (t.id === token.id ? { ...t, steps: 0 } : t))
      );

      setTimeout(() => {
        resolveLanding(token.id, token.color, 0, roll);
      }, getSpeedDelay(450));
      return;
    }

    // Case B: Hopping steps along the track
    const targetSteps = token.steps + roll;
    let currentStep = token.steps;

    const hopInterval = setInterval(() => {
      currentStep++;
      sound.play('hop');

      setTokens(prev =>
        prev.map(t => (t.id === token.id ? { ...t, steps: currentStep } : t))
      );

      if (currentStep >= targetSteps) {
        clearInterval(hopInterval);
        setTimeout(() => {
          resolveLanding(token.id, token.color, targetSteps, roll);
        }, getSpeedDelay(180));
      }
    }, getSpeedDelay(120));
  };

  // Resolve Landing: Captures, Docking, Bonus Turns, and Win checking
  const resolveLanding = (
    tokenId: string,
    tokenColor: PlayerColor,
    finalSteps: number,
    roll: number
  ) => {
    const player = playersRef.current.find(p => p.color === tokenColor)!;
    let hasCaptured = false;
    const currentTokens = tokensRef.current;

    // 1. Check for Captures on ring cells (0..50)
    if (finalSteps >= 0 && finalSteps <= 50) {
      const ringIdx = (START_INDEXES[tokenColor] + finalSteps) % 52;
      const [r, c] = RING_CELLS[ringIdx];
      const isSafeCell = SAFE_COORDS_SET.has(`${r},${c}`);

      if (!isSafeCell) {
        const victimTokens = currentTokens.filter(
          o =>
            o.color !== tokenColor &&
            o.steps >= 0 &&
            o.steps <= 50 &&
            (START_INDEXES[o.color] + o.steps) % 52 === ringIdx
        );

        if (victimTokens.length > 0) {
          hasCaptured = true;
          sound.play('capture');
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);

          const popupMsg = victimTokens.length > 1 ? '💥💥 DOUBLE KO!' : '💥 ZAPPED!';
          triggerPopup('capture', popupMsg, r, c, tokenColor);

          victimTokens.forEach(v => {
            const victimPlayer = playersRef.current.find(p => p.color === v.color);
            addLog(
              `💥 ${player.name} vaporized ${victimPlayer?.name || v.color}'s ship back to base!`,
              tokenColor,
              '⚡'
            );
          });

          // Reset captured tokens to yard (-1)
          setTokens(prev =>
            prev.map(t =>
              victimTokens.some(v => v.id === t.id) ? { ...t, steps: -1 } : t
            )
          );
        }
      }
    }

    // 2. Check for Wormhole Docking (Step 57)
    if (finalSteps === FINISH_STEP) {
      sound.play('finish');
      triggerPopup('finish', '🌟 DOCKED!', 7, 7, tokenColor);
      addLog(`🛰️ ${player.name} docked a starship into the center wormhole!`, tokenColor, '🏆');

      // Check if all 4 tokens are docked for victory
      const allTokensOfPlayer = tokensRef.current.map(t =>
        t.id === tokenId ? { ...t, steps: FINISH_STEP } : t
      ).filter(t => t.color === tokenColor);

      const isVictorious = allTokensOfPlayer.every(t => t.steps === FINISH_STEP);

      if (isVictorious) {
        setPhase('over');
        setWinner(player);
        setStatusText(`🏆 ${player.name} WINS THE GALACTIC RACE!`);
        addLog(`🎉 VICTORY! ${player.name} docked all 4 starships and conquered the galaxy!`, tokenColor, '👑');
        return;
      }
    }

    // 3. Grant Bonus Roll if rolled 6 or captured enemy
    const getsBonus = (roll === 6 && sixStreakRef.current < 3) || hasCaptured;

    if (getsBonus) {
      setTimeout(() => {
        setPhase('awaiting-roll');
        setStatusText(
          hasCaptured
            ? `${player.name} captured an enemy — Bonus roll granted!`
            : `${player.name} rolled a 6 — Bonus roll granted!`
        );
      }, getSpeedDelay(500));
    } else {
      setTimeout(advanceTurn, getSpeedDelay(400));
    }
  };

  // Dice Roll Trigger
  const handleRollDice = () => {
    if (phase !== 'awaiting-roll' || isRolling) return;
    const player = players[currentIdx];
    if (player.isAI && phaseRef.current === 'awaiting-roll') return; // AI rolls automatically

    executeDiceRoll();
  };

  const executeDiceRoll = () => {
    setIsRolling(true);
    setPhase('rolling');
    sound.play('roll');

    let ticks = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= 8) {
        clearInterval(rollInterval);
        setIsRolling(false);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        resolveRoll(finalValue);
      }
    }, getSpeedDelay(55));
  };

  // Automatic AI Roll Effect
  useEffect(() => {
    if (phase === 'awaiting-roll') {
      const activeP = players[currentIdx];
      if (activeP.isAI && !isRolling) {
        const timer = setTimeout(() => {
          if (phaseRef.current === 'awaiting-roll') {
            executeDiceRoll();
          }
        }, getSpeedDelay(650));
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentIdx, players, isRolling, getSpeedDelay]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (phase === 'awaiting-roll' && !players[currentIdx].isAI && !isRolling) {
          e.preventDefault();
          handleRollDice();
        }
      } else if (e.key === 'Escape') {
        setIsRulesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentIdx, players, isRolling]);

  // Audio Mute Toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const canRoll = phase === 'awaiting-roll' && !players[currentIdx].isAI && !isRolling;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-x-hidden">
      {/* Background Animated Space Starfield */}
      <Starfield />

      {/* SETUP PHASE VIEW */}
      {phase === 'setup' && (
        <SetupScreen
          players={players}
          onUpdatePlayer={handleUpdatePlayer}
          onLaunch={handleLaunchGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* GAME RUNTIME VIEW */}
      {phase !== 'setup' && (
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center gap-4 animate-[fadeIn_0.3s_ease-out]">
          {/* Main Content Layout (Responsive: Board + Command Panel) */}
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
            {/* Left: 15x15 Cosmic Board */}
            <div className="w-full max-w-[620px]">
              <GameBoard
                tokens={tokens}
                currentColor={currentColor}
                movableTokens={movableTokens}
                onTokenSelect={token => {
                  if (phase === 'awaiting-select') {
                    sound.play('select');
                    executeMove(token, diceValue);
                  }
                }}
                diceValue={diceValue}
                isRolling={isRolling}
                canRoll={canRoll}
                onDiceClick={handleRollDice}
                popups={popups}
                isShaking={isShaking}
                players={players}
                winnerColor={winner?.color}
                diceDisplayMode={diceDisplayMode}
              />
            </div>

            {/* Right: Mission Control Side Panel */}
            <SidePanel
              players={players}
              currentColor={currentColor}
              tokens={tokens}
              statusText={statusText}
              canRoll={canRoll}
              isRolling={isRolling}
              diceValue={diceValue}
              onRoll={handleRollDice}
              logs={logs}
              speed={speed}
              onSpeedChange={setSpeed}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenRules={() => setIsRulesOpen(true)}
              onRestart={() => setPhase('setup')}
              diceDisplayMode={diceDisplayMode}
              onToggleDiceMode={() => setDiceDisplayMode(prev => (prev === 'number' ? 'pips' : 'number'))}
            />
          </div>
        </div>
      )}

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Victory Celebration Modal */}
      {phase === 'over' && winner && (
        <VictoryModal
          winner={winner}
          onPlayAgain={() => setPhase('setup')}
        />
      )}
    </main>
  );
}

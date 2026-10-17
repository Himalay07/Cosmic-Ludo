export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type GamePhase = 'setup' | 'awaiting-roll' | 'rolling' | 'awaiting-select' | 'animating' | 'over';

export type GameSpeed = 'normal' | 'fast' | 'turbo';

export type DiceDisplayMode = 'number' | 'pips';

export interface PlayerConfig {
  color: PlayerColor;
  name: string;
  isAI: boolean;
  avatarSeed?: string;
}

export interface PlayerState {
  color: PlayerColor;
  name: string;
  isAI: boolean;
  dockedCount: number;
}

export interface TokenState {
  id: string; // e.g. "red-0"
  color: PlayerColor;
  tokenIndex: number;
  /**
   * steps:
   * -1 = in yard/dock
   * 0..50 = on the 52-cell shared ring
   * 51..56 = on the 6 home stretch cells
   * 57 = reached center wormhole (FINISH)
   */
  steps: number;
}

export interface CellCoord {
  row: number; // 0..14
  col: number; // 0..14
}

export interface ColorMeta {
  name: string;
  planet: string;
  hex: string;
  glow: string;
  bgRgba: string;
  corner: [number, number];
  startIdx: number;
  description: string;
}

export interface LogMessage {
  id: string;
  text: string;
  color?: PlayerColor;
  icon?: string;
  timestamp: string;
}

export interface VisualPopup {
  id: string;
  type: 'capture' | 'launch' | 'finish';
  text: string;
  row: number;
  col: number;
  color: PlayerColor;
}

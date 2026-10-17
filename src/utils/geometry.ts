import { PlayerColor, ColorMeta } from '../types';

/**
 * 90° clockwise rotation about board center (row 7, col 7)
 */
export function rot(r: number, c: number): [number, number] {
  return [7 + (c - 7), 14 - r];
}

export function rotateArr(arr: [number, number][]): [number, number][] {
  return arr.map(p => rot(p[0], p[1]));
}

// 13 track cells of quadrant 1 (Red's starting branch and top turn)
const baseRing13: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], [0, 8]
];

const q1 = baseRing13;
const q2 = rotateArr(q1);
const q3 = rotateArr(q2);
const q4 = rotateArr(q3);

// The 52 continuous outer ring cells
export const RING_CELLS: [number, number][] = [...q1, ...q2, ...q3, ...q4];

// The 6 colored home corridor cells leading into center
const baseHome: [number, number][] = [
  [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]
];

export const HOME_PATHS: Record<PlayerColor, [number, number][]> = {
  red: baseHome,
  green: rotateArr(baseHome),
  yellow: rotateArr(rotateArr(baseHome)),
  blue: rotateArr(rotateArr(rotateArr(baseHome)))
};

// 4 dock slots in each quadrant's yard
const baseYard: [number, number][] = [
  [1, 1], [1, 4], [4, 1], [4, 4]
];

export const YARD_SLOTS: Record<PlayerColor, [number, number][]> = {
  red: baseYard,
  green: rotateArr(baseYard),
  yellow: rotateArr(rotateArr(baseYard)),
  blue: rotateArr(rotateArr(rotateArr(baseYard)))
};

// Star / Safe zones
const baseStar: [number, number] = [2, 6];
const s1 = baseStar;
const s2 = rot(s1[0], s1[1]);
const s3 = rot(s2[0], s2[1]);
const s4 = rot(s3[0], s3[1]);

export const STAR_COORDS: [number, number][] = [s1, s2, s3, s4];

export const START_INDEXES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const SAFE_COORDS_SET = new Set<string>();
// Starting cells + Star cells are all safe zones
[RING_CELLS[0], RING_CELLS[13], RING_CELLS[26], RING_CELLS[39], ...STAR_COORDS].forEach(([r, c]) => {
  SAFE_COORDS_SET.add(`${r},${c}`);
});

export const COLOR_METAS: Record<PlayerColor, ColorMeta> = {
  red: {
    name: 'Mars Explorer',
    planet: 'Mars Core',
    hex: '#ff5b4a',
    glow: 'rgba(255, 91, 74, 0.8)',
    bgRgba: 'rgba(255, 91, 74, 0.15)',
    corner: [0, 0],
    startIdx: 0,
    description: 'Relentless crimson vanguard powered by volcanic plasma.'
  },
  green: {
    name: 'Nebula Phantom',
    planet: 'Purple Nebula',
    hex: '#b06bff',
    glow: 'rgba(176, 107, 255, 0.8)',
    bgRgba: 'rgba(176, 107, 255, 0.15)',
    corner: [0, 9],
    startIdx: 13,
    description: 'Ethereal cosmic phantom capable of phasing through starlight.'
  },
  yellow: {
    name: 'Saturn Sovereign',
    planet: 'Saturn Rings',
    hex: '#ffc247',
    glow: 'rgba(255, 194, 71, 0.8)',
    bgRgba: 'rgba(255, 194, 71, 0.15)',
    corner: [9, 9],
    startIdx: 26,
    description: 'Regal golden starfarer armored with asteroid rings.'
  },
  blue: {
    name: 'Neptune Kraken',
    planet: 'Neptune Abyss',
    hex: '#3fa7ff',
    glow: 'rgba(63, 167, 255, 0.8)',
    bgRgba: 'rgba(63, 167, 255, 0.15)',
    corner: [9, 0],
    startIdx: 39,
    description: 'Deep-void bioluminescent cephalopod gliding through gravity waves.'
  }
};

export const FINISH_STEP = 57;

export function getTokenCoord(color: PlayerColor, tokenIndex: number, steps: number): [number, number] {
  if (steps === -1) {
    return YARD_SLOTS[color][tokenIndex];
  }
  if (steps <= 50) {
    const ringIdx = (START_INDEXES[color] + steps) % 52;
    return RING_CELLS[ringIdx];
  }
  if (steps < FINISH_STEP) {
    const homeIdx = steps - 51;
    return HOME_PATHS[color][homeIdx];
  }
  return [7, 7]; // Center wormhole
}

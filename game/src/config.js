// Dapur Kilat — tuning, dishes, ingredients and layout in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** One work shift lasts this long; when it ends the game is over. */
export const SHIFT_SECONDS = 120;

export const LIVES = 3;

/** A plate holds exactly three ingredients — every dish needs three. */
export const PLATE_SLOTS = 3;

export const LEVEL = { seconds: 30, max: 8 };

/** Seconds between new orders; each level shortens it a little. */
export const ORDER = {
  firstAfter: 2,
  interval: 12,
  intervalPerLevel: 0.9,
  minInterval: 6,
  patience: 42,
  patiencePerLevel: 1.5,
  minPatience: 26,
  maxActive: 3,
};

/** Points for a served dish, plus a bonus for patience still left. */
export const SCORE = { serve: 100, patienceBonus: 2, wrongDish: -25, comboStep: 15 };

export const INGREDIENTS = [
  { id: 'rice', name: 'Nasi', key: '1', emoji: '🍚', color: '#f5f0e1', ring: '#c9b458' },
  { id: 'noodle', name: 'Mie', key: '2', emoji: '🍜', color: '#f7d774', ring: '#c98f2e' },
  { id: 'egg', name: 'Telur', key: '3', emoji: '🥚', color: '#fdf6d8', ring: '#d8c26a' },
  { id: 'chili', name: 'Cabai', key: '4', emoji: '🌶️', color: '#e5534b', ring: '#8f2b25' },
  { id: 'veg', name: 'Sayur', key: '5', emoji: '🥬', color: '#7bc96f', ring: '#3d7a33' },
  { id: 'cheese', name: 'Keju', key: '6', emoji: '🧀', color: '#f2c94c', ring: '#b98a1d' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

/** Original dishes, each an exact set of three ingredients. */
export const DISHES = [
  { name: 'Nasi Goreng Kilat', needs: ['rice', 'egg', 'chili'], color: '#e8823a' },
  { name: 'Mie Pedas Mantap', needs: ['noodle', 'chili', 'egg'], color: '#d94f3d' },
  { name: 'Omelet Keju Kebun', needs: ['egg', 'cheese', 'veg'], color: '#e9b949' },
  { name: 'Nasi Sayur Sehat', needs: ['rice', 'veg', 'cheese'], color: '#7bc96f' },
  { name: 'Mie Goreng Spesial', needs: ['noodle', 'egg', 'veg'], color: '#c98f2e' },
  { name: 'Tumis Pedas Nasi', needs: ['rice', 'chili', 'veg'], color: '#c65a3c' },
];

/** Where things sit on the 1280x720 field. */
export const LAYOUT = {
  board: { x: 16, y: 12, ticketW: 218, ticketH: 104, gap: 10 },
  hud: { x: 720, y: 12, w: 544, h: 104 },
  plate: { x: 640, y: 330, r: 108 },
  serve: { x: 1052, y: 268, w: 200, h: 84 },
  counter: { y: 470, h: 130 },
  buttons: { y: 606, h: 96, gap: 10, margin: 16 },
};

export const PALETTE = {
  backdrop: '#241a12',
  wall: '#f3d9a4',
  wallTrim: '#d9a066',
  floor: '#8a5a3b',
  floorLine: '#6e452c',
  counterTop: '#b08954',
  counterFront: '#7c4f2c',
  board: '#3a2a1c',
  boardPaper: '#fff8e6',
  plate: '#f7f3ea',
  plateRim: '#4a90d9',
  text: '#2b2118',
  light: '#fff8e6',
  muted: '#8b7a63',
  good: '#3d7a33',
  bad: '#d94f3d',
  timer: '#e8823a',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'dapur-kilat.best';

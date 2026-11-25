// Keyboard and pointer input. Held keys are not needed here; one-shot presses
// (add an ingredient, serve, clear, pause, start) are queued as actions and
// taken once by the loop, so a press between two frames is never lost and
// never counted twice. Pointer clicks are queued as logical-field points.
export const ACTION_START = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_CLEAR = 8;

const ADD_KEYS = new Set(['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);

export function createInput(target) {
  let actions = 0;
  let addIndex = -1;
  const clicks = [];

  window.addEventListener('keydown', (event) => {
    if (ADD_KEYS.has(event.code)) {
      if (!event.repeat) addIndex = Number(event.code.slice(-1)) - 1;
    } else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_START | ACTION_SERVE;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (event.code === 'Backspace') {
      if (!event.repeat) actions |= ACTION_CLEAR;
    } else return;
    event.preventDefault();
  });

  target.addEventListener('pointerdown', (event) => {
    const rect = target.getBoundingClientRect();
    clicks.push({
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    });
  });

  return {
    /** One-shot actions since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Ingredient index queued by keys 1-6 since the last call, or -1. */
    takeAdd() {
      const taken = addIndex;
      addIndex = -1;
      return taken;
    },
    /** Click points since the last call, in 1280x720 field coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}

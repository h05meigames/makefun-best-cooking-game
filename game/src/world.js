// The game's rules and state, with no drawing and no browser in it: orders on
// the board, the plate being assembled, the shift timer, score, lives and
// level. step() advances one fixed step and returns what happened as bit
// flags, so the caller can react (sound, announcements) without the world
// knowing about screens or sound. Nothing here allocates after createWorld.

import {
  DISHES,
  INGREDIENTS,
  LIVES,
  LEVEL,
  ORDER,
  PLATE_SLOTS,
  SCORE,
  SHIFT_SECONDS,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_OVER = 8;
export const EVENT_ADDED = 16;

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const rest = [...b];
  for (const item of a) {
    const at = rest.indexOf(item);
    if (at === -1) return false;
    rest.splice(at, 1);
  }
  return true;
}

function orderPatience(level) {
  return Math.max(ORDER.minPatience, ORDER.patience - ORDER.patiencePerLevel * (level - 1));
}

function orderInterval(level) {
  return Math.max(ORDER.minInterval, ORDER.interval - ORDER.intervalPerLevel * (level - 1));
}

export function createWorld(random) {
  const state = {
    orders: [],
    plate: [],
    score: 0,
    served: 0,
    combo: 0,
    lives: LIVES,
    level: 1,
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    spawnTimer: ORDER.firstAfter,
    message: '',
    messageTimer: 0,
    nextOrderId: 1,
  };

  function pickDish() {
    return DISHES[Math.floor(random() * DISHES.length)];
  }

  function spawnOrder() {
    if (state.orders.length >= ORDER.maxActive) return;
    const dish = pickDish();
    state.orders.push({
      id: state.nextOrderId,
      dish,
      patience: orderPatience(state.level),
      maxPatience: orderPatience(state.level),
    });
    state.nextOrderId += 1;
  }

  function reset() {
    state.orders = [];
    state.plate = [];
    state.score = 0;
    state.served = 0;
    state.combo = 0;
    state.lives = LIVES;
    state.level = 1;
    state.elapsed = 0;
    state.timeLeft = SHIFT_SECONDS;
    state.spawnTimer = ORDER.firstAfter;
    state.message = '';
    state.messageTimer = 0;
    state.nextOrderId = 1;
    spawnOrder();
  }

  function setMessage(text) {
    state.message = text;
    state.messageTimer = 2.2;
  }

  /** The dish the plate matches, or null when it matches nothing yet. */
  function matchingOrder() {
    if (state.plate.length !== PLATE_SLOTS) return null;
    for (const order of state.orders) {
      if (sameSet(state.plate, order.dish.needs)) return order;
    }
    return null;
  }

  function addIngredient(index) {
    if (index < 0 || index >= INGREDIENTS.length) return 0;
    if (state.plate.length >= PLATE_SLOTS) return 0;
    state.plate.push(INGREDIENTS[index].id);
    return EVENT_ADDED;
  }

  function clearPlate() {
    state.plate = [];
  }

  function serve() {
    if (state.plate.length === 0) return 0;
    const order = matchingOrder();
    if (order === null) {
      state.score = Math.max(0, state.score + SCORE.wrongDish);
      state.combo = 0;
      clearPlate();
      setMessage('Bukan pesanan itu! −25');
      return EVENT_WRONG;
    }
    const bonus = Math.round(order.patience) * SCORE.patienceBonus + state.combo * SCORE.comboStep;
    state.score += SCORE.serve + bonus;
    state.served += 1;
    state.combo += 1;
    state.orders.splice(state.orders.indexOf(order), 1);
    clearPlate();
    setMessage(`Tersaji! +${SCORE.serve + bonus}`);
    return EVENT_SERVED;
  }

  /**
   * One fixed step. `action` is null, { type: 'add', index }, { type: 'serve' }
   * or { type: 'clear' }. With `harmless` set (the title screen's backdrop)
   * orders come and go but nothing expires and nothing scores.
   */
  function step(dt, action, harmless) {
    let events = 0;
    state.elapsed += dt;
    state.level = Math.min(LEVEL.max, 1 + Math.floor(state.elapsed / LEVEL.seconds));
    if (state.messageTimer > 0) state.messageTimer -= dt;

    if (action) {
      if (action.type === 'add') events |= addIngredient(action.index);
      else if (action.type === 'serve') events |= serve();
      else if (action.type === 'clear') clearPlate();
    }
    if (harmless) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnOrder();
        state.spawnTimer += orderInterval(state.level);
      }
      return events;
    }

    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      return events | EVENT_OVER;
    }

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnOrder();
      state.spawnTimer += orderInterval(state.level);
    }

    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.lives -= 1;
        state.combo = 0;
        setMessage('Pesanan hangus! −1 ❤');
        events |= EVENT_EXPIRED;
        if (state.lives <= 0) {
          state.lives = 0;
          return events | EVENT_OVER;
        }
      }
    }
    return events;
  }

  reset();
  return { state, reset, step, matchingOrder, spawnOrder };
}

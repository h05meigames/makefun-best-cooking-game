// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between four screens: title,
// play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_EXPIRED, EVENT_OVER, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { ACTION_CLEAR, ACTION_PAUSE, ACTION_SERVE, ACTION_START, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, hitControl } from './render.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Bermain. Sajikan pesanan sebelum pelanggan kabur.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    sound.over();
    announce(`Shift selesai. Skor ${world.state.score}. Terbaik ${best}.`);
  }

  function react(events) {
    if (events & EVENT_SERVED) {
      sound.serve();
      announce(`Tersaji! Skor ${world.state.score}.`);
    } else if (events & EVENT_WRONG) {
      sound.wrong();
      announce('Bukan pesanan itu.');
    } else if (events & EVENT_EXPIRED) {
      sound.expired();
      announce(world.state.lives === 1 ? 'Pesanan hangus. 1 nyawa tersisa.' : `Pesanan hangus. ${world.state.lives} nyawa tersisa.`);
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    const addIndex = input.takeAdd();
    for (const click of input.takeClicks()) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
        startGame();
        continue;
      }
      if (screen !== SCREEN_PLAY) continue;
      const hit = hitControl(click.x, click.y);
      if (hit && hit.kind === 'add') react(world.step(0, { type: 'add', index: hit.index }, false));
      else if (hit && hit.kind === 'serve') react(world.step(0, { type: 'serve' }, false));
    }
    if (actions & ACTION_START && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    } else if (actions & (ACTION_PAUSE | ACTION_START) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Bermain.');
    } else if (screen === SCREEN_PLAY) {
      if (addIndex !== -1) react(world.step(0, { type: 'add', index: addIndex }, false));
      if (actions & ACTION_SERVE) react(world.step(0, { type: 'serve' }, false));
      if (actions & ACTION_CLEAR) world.step(0, { type: 'clear' }, false);
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, null, true);
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    const events = world.step(STEP, null, false);
    react(events);
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting orders expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Dapur Kilat. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();

// The screenshot scenes behind ?shot=start|play|end. Each one plays the real
// rules forward from a fresh world for a fixed number of steps, steered by a
// simple autopilot (add the next missing ingredient of the first order, serve
// when the plate is full), so the frame is what a short game really looks
// like and the same seed always gives the same frame.
import { STEP } from './config.js';
import { EVENT_OVER, EVENT_SERVED } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 26;
const END_LIMIT_SECONDS = 600;
const SAMPLE = STEP;

/** The next action the autopilot takes for this world state, or null. */
function autopilot(state, world) {
  if (state.plate.length === 3) return { type: 'serve' };
  const order = state.orders[0];
  if (!order) return null;
  const rest = [...order.dish.needs];
  for (const id of state.plate) {
    const at = rest.indexOf(id);
    if (at !== -1) rest.splice(at, 1);
  }
  if (rest.length === 0) return { type: 'serve' };
  const index = ['rice', 'noodle', 'egg', 'chili', 'veg', 'cheese'].indexOf(rest[0]);
  return { type: 'add', index };
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / SAMPLE; index += 1) world.step(SAMPLE, null, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    // Serve the first order, then assemble two thirds of the next one, so the
    // frame shows a kitchen, an order board, ingredients on the counter, one
    // dish mid-assembly, a timer and a plate ready to serve.
    let servedOnce = false;
    let addedAfterServe = 0;
    for (let index = 0; index < PLAY_SECONDS / SAMPLE; index += 1) {
      const action = autopilot(world.state, world);
      if (action && action.type === 'serve' && servedOnce && addedAfterServe >= 2) break;
      const events = world.step(SAMPLE, action, false);
      if (events & EVENT_SERVED) servedOnce = true;
      if (servedOnce && action && action.type === 'add') addedAfterServe += 1;
      if (events & EVENT_OVER) break;
    }
    return { screen: SCREEN_PLAY, best: world.state.score };
  }
  // End: never serve anything; orders expire until the lives run out.
  for (let index = 0; index < END_LIMIT_SECONDS / SAMPLE; index += 1) {
    if (world.step(SAMPLE, null, false) & EVENT_OVER) break;
  }
  return { screen: SCREEN_OVER, best: world.state.score };
}

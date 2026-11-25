// Tiny synthesized sound effects (WebAudio, no audio files): a blip when an
// ingredient lands, a little arpeggio when a dish is served, a low buzz for a
// wrong dish or an expired order. Created lazily on the first user gesture,
// so browsers never complain; every call is guarded.
export function createSound() {
  let context = null;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      return null;
    }
    return context;
  }

  function tone(freq, start, length, type, volume) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + length);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + length);
    } catch {
      // Sound is garnish; a failure never breaks the game.
    }
  }

  return {
    add() { tone(520, 0, 0.09, 'sine', 0.12); },
    serve() {
      tone(523, 0, 0.1, 'triangle', 0.14);
      tone(659, 0.08, 0.1, 'triangle', 0.14);
      tone(784, 0.16, 0.16, 'triangle', 0.14);
    },
    wrong() { tone(160, 0, 0.22, 'sawtooth', 0.08); },
    expired() {
      tone(220, 0, 0.14, 'square', 0.07);
      tone(180, 0.14, 0.2, 'square', 0.07);
    },
    over() {
      tone(392, 0, 0.14, 'triangle', 0.12);
      tone(330, 0.16, 0.14, 'triangle', 0.12);
      tone(262, 0.32, 0.3, 'triangle', 0.12);
    },
  };
}

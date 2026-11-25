// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred, the margin
// filled with the backdrop colour. Flat shapes, canvas text for the HUD and
// the panels. Text that holds a number is rebuilt only when the number
// changes, so a frame allocates nothing.
import { FIELD, FONT, INGREDIENTS, LAYOUT, PALETTE, PLATE_SLOTS, ingredientById } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const BUTTON_W = (FIELD.width - LAYOUT.buttons.margin * 2 - (INGREDIENTS.length - 1) * LAYOUT.buttons.gap) / INGREDIENTS.length;

/** The ingredient button rectangles, in field coordinates. */
export function buttonRect(index) {
  return {
    x: LAYOUT.buttons.margin + index * (BUTTON_W + LAYOUT.buttons.gap),
    y: LAYOUT.buttons.y,
    w: BUTTON_W,
    h: LAYOUT.buttons.h,
  };
}

export function serveRect() {
  const s = LAYOUT.serve;
  return { x: s.x, y: s.y, w: s.w, h: s.h };
}

function pointIn(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** Which control a field point hits: { kind: 'add', index } | { kind: 'serve' } | null. */
export function hitControl(x, y) {
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    if (pointIn(buttonRect(i), x, y)) return { kind: 'add', index: i };
  }
  if (pointIn(serveRect(), x, y)) return { kind: 'serve' };
  return null;
}

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const scoreLabel = cachedLabel('Skor ');
  const servedLabel = cachedLabel('Tersaji ');
  const levelLabel = cachedLabel('Level ');
  const bestLabel = cachedLabel('Terbaik ');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function rr(x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `bold ${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  function plain(value, x, y, size, color, align) {
    if (!fonts.has(-size)) fonts.set(-size, `${size}px ${FONT}`);
    context.font = fonts.get(-size);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  function drawKitchen() {
    // Wall, wainscot and tiled floor.
    context.fillStyle = PALETTE.wall;
    context.fillRect(0, 0, FIELD.width, 470);
    context.fillStyle = PALETTE.wallTrim;
    context.fillRect(0, 452, FIELD.width, 18);
    context.fillStyle = PALETTE.floor;
    context.fillRect(0, 470, FIELD.width, 136);
    context.fillStyle = PALETTE.floorLine;
    for (let x = 0; x < FIELD.width; x += 96) context.fillRect(x, 470, 2, 136);
    context.fillRect(0, 540, FIELD.width, 2);
    // Window with a sunny street outside.
    context.fillStyle = '#7ec8e3';
    rr(500, 130, 280, 130, 10);
    context.fill();
    context.strokeStyle = '#8a5a3b';
    context.lineWidth = 8;
    context.stroke();
    context.strokeStyle = '#8a5a3b';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(640, 130);
    context.lineTo(640, 260);
    context.moveTo(500, 195);
    context.lineTo(780, 195);
    context.stroke();
    context.fillStyle = '#ffd94d';
    context.beginPath();
    context.arc(740, 160, 18, 0, Math.PI * 2);
    context.fill();
    // Stove, left: two burners with a steaming pot.
    context.fillStyle = '#3a3a3a';
    rr(60, 330, 220, 140, 10);
    context.fill();
    context.fillStyle = '#222';
    context.beginPath();
    context.arc(120, 380, 34, 0, Math.PI * 2);
    context.arc(220, 380, 34, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#5a5a5a';
    context.beginPath();
    context.arc(120, 380, 26, 0, Math.PI * 2);
    context.arc(220, 380, 26, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#c65a3c';
    context.beginPath();
    context.arc(120, 372, 30, Math.PI, 0);
    context.fill();
    context.fillRect(90, 372, 60, 10);
    plain('~', 112, 340, 26, '#fff8e6', 'center');
    plain('~', 128, 326, 26, '#fff8e6', 'center');
    // Sink, right, under the serve button.
    context.fillStyle = '#9aa5ad';
    rr(1010, 396, 240, 74, 10);
    context.fill();
    context.fillStyle = '#6e7d86';
    rr(1030, 410, 200, 46, 8);
    context.fill();
    context.fillStyle = '#7ec8e3';
    rr(1040, 418, 180, 30, 6);
    context.fill();
    // Counter top and front.
    context.fillStyle = PALETTE.counterTop;
    context.fillRect(0, 470, FIELD.width, 26);
    context.fillStyle = PALETTE.counterFront;
    context.fillRect(0, 496, FIELD.width, 110);
    context.fillStyle = 'rgba(0,0,0,0.12)';
    for (let x = 80; x < FIELD.width; x += 160) context.fillRect(x, 496, 3, 110);
  }

  function drawBoard(state) {
    const b = LAYOUT.board;
    context.fillStyle = PALETTE.board;
    rr(b.x - 6, b.y - 6, b.ticketW * 3 + b.gap * 2 + 12, b.ticketH + 12, 12);
    context.fill();
    text('📋 PAPAN PESANAN', b.x + 8, b.y + 16, 15, PALETTE.light, 'left');
    for (let i = 0; i < 3; i += 1) {
      const x = b.x + i * (b.ticketW + b.gap);
      const y = b.y + 22;
      context.fillStyle = PALETTE.boardPaper;
      rr(x, y, b.ticketW, b.ticketH - 22, 8);
      context.fill();
      const order = state.orders[i];
      if (!order) {
        plain('— kosong —', x + b.ticketW / 2, y + 44, 16, PALETTE.muted, 'center');
        continue;
      }
      text(order.dish.name, x + 10, y + 22, 16, PALETTE.text, 'left');
      order.dish.needs.forEach((id, j) => {
        const ing = ingredientById(id);
        context.font = '26px sans-serif';
        context.textAlign = 'left';
        context.fillText(ing.emoji, x + 10 + j * 40, y + 58);
      });
      const frac = Math.max(0, order.patience / order.maxPatience);
      context.fillStyle = '#e8ddc4';
      rr(x + 10, y + 66, b.ticketW - 20, 8, 4);
      context.fill();
      context.fillStyle = frac > 0.5 ? PALETTE.good : frac > 0.25 ? PALETTE.timer : PALETTE.bad;
      rr(x + 10, y + 66, (b.ticketW - 20) * frac, 8, 4);
      context.fill();
    }
  }

  function drawHud(state) {
    const h = LAYOUT.hud;
    context.fillStyle = 'rgba(42,28,16,0.85)';
    rr(h.x, h.y, h.w, h.h, 12);
    context.fill();
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    const clock = `⏱ ${mins}:${String(secs).padStart(2, '0')}`;
    text(clock, h.x + 16, h.y + 34, 26, state.timeLeft < 20 ? '#ff9a7a' : PALETTE.light, 'left');
    context.fillStyle = '#e8ddc4';
    rr(h.x + 16, h.y + 46, h.w - 32, 10, 5);
    context.fill();
    context.fillStyle = PALETTE.timer;
    rr(h.x + 16, h.y + 46, (h.w - 32) * Math.max(0, state.timeLeft / 120), 10, 5);
    context.fill();
    text(scoreLabel(state.score), h.x + 16, h.y + 88, 22, PALETTE.light, 'left');
    text(servedLabel(state.served), h.x + 210, h.y + 88, 22, PALETTE.light, 'left');
    text(levelLabel(state.level), h.x + 360, h.y + 88, 22, PALETTE.light, 'left');
    let hearts = '';
    for (let i = 0; i < 3; i += 1) hearts += i < state.lives ? '❤️' : '🖤';
    context.font = '20px sans-serif';
    context.textAlign = 'right';
    context.fillText(hearts, h.x + h.w - 14, h.y + 34);
  }

  function drawPlate(state) {
    const p = LAYOUT.plate;
    // Shadow, then the plate itself.
    context.fillStyle = 'rgba(0,0,0,0.25)';
    context.beginPath();
    context.ellipse(p.x, p.y + p.r - 6, p.r, 16, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.plate;
    context.beginPath();
    context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = PALETTE.plateRim;
    context.lineWidth = 6;
    context.stroke();
    context.strokeStyle = '#d8d2c2';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(p.x, p.y, p.r - 22, 0, Math.PI * 2);
    context.stroke();
    const slots = [
      { x: p.x, y: p.y - 34 },
      { x: p.x - 42, y: p.y + 28 },
      { x: p.x + 42, y: p.y + 28 },
    ];
    for (let i = 0; i < PLATE_SLOTS; i += 1) {
      const slot = slots[i];
      const id = state.plate[i];
      if (id) {
        const ing = ingredientById(id);
        context.fillStyle = ing.color;
        context.beginPath();
        context.arc(slot.x, slot.y, 30, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = ing.ring;
        context.lineWidth = 3;
        context.stroke();
        context.font = '30px sans-serif';
        context.textAlign = 'center';
        context.fillText(ing.emoji, slot.x, slot.y + 11);
      } else {
        context.strokeStyle = '#c9c2b0';
        context.setLineDash([6, 6]);
        context.lineWidth = 2;
        context.beginPath();
        context.arc(slot.x, slot.y, 30, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
      }
    }
    plain('PIRING', p.x, p.y + p.r + 24, 15, PALETTE.light, 'center');
    if (state.plate.length === PLATE_SLOTS) {
      const match = state.orders.some((o) => {
        const rest = [...o.dish.needs];
        return state.plate.every((id) => {
          const at = rest.indexOf(id);
          if (at === -1) return false;
          rest.splice(at, 1);
          return true;
        });
      });
      text(match ? '✅ Siap disajikan!' : '❌ Bukan pesanan — sajikan?', p.x, p.y - p.r - 14, 20, match ? '#b8e6a3' : '#ffb3a3', 'center');
    }
  }

  function drawServe(state) {
    const s = LAYOUT.serve;
    const ready = state.plate.length === PLATE_SLOTS;
    context.fillStyle = ready ? '#3d7a33' : '#6e6252';
    rr(s.x, s.y, s.w, s.h, 14);
    context.fill();
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.lineWidth = 2;
    context.stroke();
    text('🍽️ SAJIKAN', s.x + s.w / 2, s.y + 36, 24, '#fff', 'center');
    plain('Spasi / klik', s.x + s.w / 2, s.y + 64, 15, '#e8ddc4', 'center');
  }

  function drawButtons() {
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      const ing = INGREDIENTS[i];
      const r = buttonRect(i);
      context.fillStyle = '#fff8e6';
      rr(r.x, r.y, r.w, r.h, 12);
      context.fill();
      context.strokeStyle = ing.ring;
      context.lineWidth = 3;
      context.stroke();
      context.font = '34px sans-serif';
      context.textAlign = 'center';
      context.fillText(ing.emoji, r.x + r.w / 2, r.y + 46);
      text(ing.name, r.x + r.w / 2, r.y + 74, 17, PALETTE.text, 'center');
      context.fillStyle = PALETTE.muted;
      context.beginPath();
      context.arc(r.x + r.w - 18, r.y + 18, 12, 0, Math.PI * 2);
      context.fill();
      text(ing.key, r.x + r.w - 18, r.y + 24, 14, '#fff', 'center');
    }
  }

  function drawMessage(state) {
    if (state.messageTimer <= 0 || !state.message) return;
    const alpha = Math.min(1, state.messageTimer);
    context.save();
    context.globalAlpha = alpha;
    const w = 420;
    context.fillStyle = 'rgba(42,28,16,0.9)';
    rr(FIELD.width / 2 - w / 2, 508, w, 44, 22);
    context.fill();
    text(state.message, FIELD.width / 2, 538, 20, '#fff', 'center');
    context.restore();
  }

  function panel(title, lines, prompt, best) {
    context.fillStyle = 'rgba(20,12,6,0.72)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = '#fff8e6';
    rr(340, 130, 600, 460, 18);
    context.fill();
    context.strokeStyle = '#d9a066';
    context.lineWidth = 4;
    context.stroke();
    text(title, 640, 200, 44, '#8a4b1d', 'center');
    lines.forEach((line, i) => {
      plain(line, 640, 260 + i * 34, 19, PALETTE.text, 'center');
    });
    if (best !== null && best !== undefined) text(bestLabel(best), 640, 260 + lines.length * 34 + 6, 20, '#8a4b1d', 'center');
    text(prompt, 640, 540, 22, '#3d7a33', 'center');
  }

  function draw(state, screen, best) {
    resize();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawKitchen();
    drawBoard(state);
    drawHud(state);
    drawPlate(state);
    drawServe(state);
    drawButtons();
    drawMessage(state);
    if (screen === SCREEN_TITLE) {
      panel('🍳 DAPUR KILAT', [
        'Masak cepat, sajikan tepat!',
        'Klik bahan di meja (atau tekan 1–6)',
        'untuk merakit pesanan di piring,',
        'lalu SAJIKAN sebelum pelanggan kabur.',
        'Pesanan hangus = −1 ❤. Shift 2 menit.',
      ], 'Tekan Spasi atau klik untuk mulai', best);
    } else if (screen === SCREEN_PAUSED) {
      panel('⏸ JEDA', ['Istirahat sebentar, koki.', 'Pesanan menunggu…'], 'Tekan P atau Spasi untuk lanjut', null);
    } else if (screen === SCREEN_OVER) {
      const lines = [
        `Skor akhir: ${state.score}`,
        `Hidangan tersaji: ${state.served}`,
        state.lives === 0 ? 'Semua pelanggan kabur!' : 'Shift selesai!',
      ];
      panel('🏁 SHIFT SELESAI', lines, 'Tekan Spasi untuk main lagi', best);
    }
  }

  return { draw };
}

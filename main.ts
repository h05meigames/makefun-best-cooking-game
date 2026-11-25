// Dapur Kilat — a cooking game for make.fun's "Make the best cooking game"
// bounty (Node 22, standard library only). The game itself is plain static
// files under game/: game/index.html plus its ES modules, no library and no
// network request, so any static server can host it. This program hands it
// in: it copies game/ and screenshots/ from beside this file to /output and
// writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Fail fast with a readable message when a screenshot is missing or too big
// for the dossier, instead of letting the library throw a bare error.
const shots = readdirSync(join(out, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name));
if (shots.length === 0) throw new Error('main.ts: screenshots/ holds no image: the first is the cover');
if (shots.length > 4) throw new Error(`main.ts: ${shots.length} screenshots, at most 4 allowed`);

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files, in all,
// or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

const gameFiles = readdirSync(join(out, 'game'), { recursive: true }).length;
console.log(`Dapur Kilat handed in: ${gameFiles} game entries, ${shots.length} screenshots -> ${out}/dossier.json`);

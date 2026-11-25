# Dapur Kilat — Sizzle & Serve

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/h05meigames/makefun-best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/h05meigames/makefun-best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Entry for the [make.fun bounty "Make the best cooking game"](https://make.fun/bounty/best-cooking-game-20261125-0137): a fast, original cooking game. You are the cook on a 2-minute shift: orders land on the board, you grab ingredients from the counter, assemble each dish on the plate, and serve it before the customer's patience runs out.

## How to play

- **Orders** appear on the board (top left). Each dish needs exactly 3 ingredients.
- **Add ingredients** by clicking them on the counter, or press **1–6**.
- **Serve** with the green SAJIKAN button or **Space** when the plate matches an order. A wrong plate costs 25 points.
- **Patience matters**: an order that expires costs 1 ❤️. Lose all 3 hearts, or run out the 2-minute shift, and the shift ends.
- **Score**: 100 per dish + a bonus for patience left + a combo bonus for serving dishes back-to-back. Orders arrive faster as the level rises.
- **P** pauses. Best score is saved in your browser.

Dishes are all original: Nasi Goreng Kilat, Mie Pedas Mantap, Omelet Keju Kebun, Nasi Sayur Sehat, Mie Goreng Spesial, and Tumis Pedas Nasi. Sounds are synthesized live with WebAudio — no audio files.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no network requests: `game/` is plain static files. `main.ts` hands the game in — it copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of the game's own code, staged with `?shot=start|play|end&seed=1` (see `shots.json`).

## Referral

Join make.fun with my referral link: https://make.fun/r/0ene8b3q

## License

MIT — see [LICENSE](LICENSE).

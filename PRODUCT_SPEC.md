# MAIN STAGE OR BUST — Product Spec (print + digital share one rules engine)

## A. Products
1. **Print-and-play (PDF via browser print):** `print/rules.html` (2-page rules + offer tables + road table) and `print/sheet.html` (1-page band sheet, front; rules-back optional). Must be usable with 5d6 + pencil, black-and-white friendly, no color-dependent rules.
2. **Web game (static, offline-capable):** `app/` playable in any modern browser by opening `index.html` or `npm start`. Modes: Solo / Coop (shared hot-seat) / Versus (2 humans hot-seat) / Solo vs computer. Punk-zine aesthetic, keyboard + mouse + touch, screen-reader labels on all controls.

## B. Shared rules engine (`app/engine.js`, also used by sims/tests)
Pure logic, no DOM: state creation, offer generation (seedable RNG), dice rolling, song detection, show resolution, work-dice resolution, road events, crew purchases, restock/repair, morale/van fail states, weekly headliner comparison, rival AI turns, final scoring + ranks. Deterministic given an RNG function. Digital UI and print rules MUST match engine behavior; any divergence is a P0 bug.

## C. Functional requirements
- Setup: band name(s), mode, difficulty (Basement=generous: +$5 start, D-0; Club=standard; Grind: -$5 start, road events also on week 2).
- Season: exactly 12 weeks + optional main-stage encore note; forced-rest handling; week log; end-of-season score + rank + tour diary export (copyable text).
- Purchases anytime cash/fame allow (Roadie $25 / Tech $30 / Manager $20+$3/wk); restock/repair anytime; hype spend at show time.
- Versus: shared weekly offers; headliner bonus; separate sheets; final compare.
- Computer opponent: one-click turn resolution with visible log line.
- No accounts, no network, no build step to play (plain HTML/CSS/JS). `npm test` runs engine + sim gates with plain node (no deps).

## D. Non-functional
- Load < 1s locally; all art inline SVG/CSS (no external assets/fonts).
- Print: sheets fit US Letter + A4, 0.5in margins, min 11px type, checkboxes >= 12px.
- Accessibility: focus-visible states, aria-live for dice/log, color-contrast >= 4.5:1 for body text, full keyboard flow (tab + enter, number keys 1-6 to pick dice).
- Punk aesthetic without Codex-slop: photocopy/zine direction — black paper, off-white ink, one neon accent (safety-orange), halftone textures via CSS gradients, sticker-style venue cards, monospace tour-log. No gradients-as-decoration on controls; buttons flat with 2px borders and hard shadows (6px offset, no blur).

## E. Acceptance gates (must all pass)
G1 engine unit tests 100% pass. G2 season sim (10k solo seeds): main-stage-reach rate 15–40% on standard heuristic; bankruptcy (cash<0 at end) <15%; mean final score inside 110–180 on the skilled-heuristic baseline (humans trend lower; rank table valid). G3 full-season browser smoke test passes (scripted playthrough, all 12 weeks, score screen). G4 print files open with zero console errors and fit one/two pages. G5 keyboard-only playthrough of one week possible.

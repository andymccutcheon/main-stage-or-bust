# Implementation Plan
## Phase 0 — Specs (done): DESIGN.md, PRODUCT_SPEC.md, this plan.
## Phase 1 — Engine + tests (node, no deps)
1. `app/engine.js`: constants (venues, road table, costs), `createGame(opts)`, RNG (mulberry32 + Math.random wrapper), `drawOffers(state)`, `rollDice(n,rng)`, `hasPair(dice)`, `isAnthem(dice)`, `resolveShow(state,side,venue,stageDice,hypeSpend)`, `resolveWorkDie(state,side,die,action)`, `applyRoadEvent(state,roll)`, `buyCrew/restock/repair`, `weeklyUpkeep`, `finalScore/rank`, `rivalTurn(state,rng)`, `versusHeadliner(a,b)`.
2. `app/engine.test.js`: ~40 asserts via `node --test` covering: success/fail payouts, hype math + cap, work actions, songs/albums/anthem, road events, crew effects + manager wage, morale/van fail + rest week, offers gating (no Main Stage before wk10/fame45), final score + ranks, versus bonus, rival turn invariants, 12-week invariant fuzz (no NaN, caps respected).
3. `app/sim.js`: heuristic policy (pick higher-fame affordable offer; reroll if no die>=4; stage two highest; hype spend if short by <=3; work priority merch-if-stock>0>flyer>job; buy roadie wk>=4 if cash>=40, tech wk>=6 if cash>=45, manager wk>=5 if fame>=15) + 10k-season stats + gate checks (G2). Tune constants until gates pass; record results in BALANCE.md.
## Phase 2 — Web UI (`app/index.html`, `styles.css`, `ui.js`)
Screens: Setup -> Week (offers -> roll/reroll -> stage assign -> hype -> work dice -> resolution log) -> Shop -> Season end. Versus: two panels + shared offers. Coop: single sheet, 6-dice tray, "P1 rolled / P2 rolled" labels. Log + tour diary. No framework.
## Phase 3 — Print (`print/sheet.html`, `print/rules.html`)
Single-file each, inline CSS, print button + `@media print`. Sheet: all tracks as checkbox grids + 12-row log + offer/road tables mini.
## Phase 4 — Verification
`npm test` (engine tests + sim gates), `tests/smoke-season.mjs` scripted DOM-less season through engine (G3 proxy) + Playwright full-browser pass if playwright installed (else engine-level proof + manual checklist), print page checks, keyboard checklist, BALANCE.md + README.md + HANDOFF human-playtest list.
## Risks
Write-tool instability -> use small edits/bash heredocs. Node 18 only -> no deps, no fetch, no TS. Home-dir git repo -> do NOT commit unless asked; keep project self-contained.

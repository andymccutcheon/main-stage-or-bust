# REFINEMENT DIRECTIVE — Main Stage or Bust, visual tour experience
## Status: DIRECTIVE (handoff-grade) · Date: 2026-09-18 · Repo: github.com/andymccutcheon/main-stage-or-bust (`main`, Vercel auto-deploys)

This document is the single source of truth for the visual-game refinement. It
supersedes nothing: `VISUAL-DIRECTIVE.md` (v6, shipped) and `VISUAL-DIRECTIVE-2.md`
(v7, shipped) remain the historical record. Everything below is written so an
engineer with repo access can build end-to-end with zero ambiguity. Rules live in
`DESIGN.md`; balance evidence in `BALANCE.md`; build/run in `README.md`.

## 0. Doc map
- `DESIGN.md` — canonical game rules (12-week roll-and-write, §1–13).
- `BALANCE.md` — sim-verified numbers; update the v7 row protocol on any mechanics change.
- `PRODUCT_SPEC.md` — product/acceptance gates (G1–G5 engine/sims/smoke/print/keyboard).
- `VISUAL-DIRECTIVE.md` — v6 split-screen architecture + §9 skill-hunting contracts (still law).
- `VISUAL-DIRECTIVE-2.md` — v7 playtest response (layout/avatar/venues/flyers/stage).
- This file — where we are, what feedback said, where we go now, exact contracts.

## 1. Shipped state (do not rebuild; extend)
### 1.1 Commits on `main`
- `f2a8384` game build through v6 visual directive (engine, UI, print, AI proxy, sim).
- `eb3f88c` v6 visuals M1–M6: `app/visual/` (palette, sprites, map, stage, director,
  ASSETS.md), split layout, sticky rail, event wiring, 9 visual-mapping tests.
- `53836d6` v7: 30/70 layout + show-mode, 6 avatars, 16 venues + homecoming,
  hometown names, weekend-run framing, tiered flyer skins, sky cycle + spotlight.

### 1.2 Game (mechanics — change only per §6)
- 12 weeks; 5 dice (+1 gold with Manager); stage 2 dice + hype (2 hype = +1, max +2)
  vs venue Difficulty; 3 leftover dice → merch/flyer/day-job; pairs write songs
  (8 boxes, albums at 4 and 8: +5 fame/+10 fans/+1 show-hype each); road die weeks
  4/7/10 (Grind: from week 2); crew Roadie $30 / Tech $35 / Manager $25+$3/wk;
  morale/van fail states → forced rest/shop. Final = Fans + Fame.
- 16 venues + Main Stage (stats in §6). Versus/coop/rival modes intact.
- Sim (10k skilled heuristic): mean ~144, median 144, p10 113, finale reach ~25%,
  win rate ~76%, bankruptcy ~0%. Gates: reach 15–40%, bankrupt <15%, mean 110–180.

### 1.3 Visual system (extend per §4–5)
- `app/visual/palette.js` — 5 themes (orange/pink/lime/blue/red) + fixed sticker
  yellow; `getPalette()` reads `data-theme` + computed `--accent`. New palettes =
  new table rows only.
- `app/visual/sprites.js` — 16×16 string-map sprites, offscreen-cached at boot:
  van ×4 damage edits (one master), band ×4 roles (idle 2×2 grids + jump/slump/drive
  loops), crowd ×1 blob/4 shirts, 6 avatars, merch/pole/trophy/weather props.
  Anchors: wheels/feet row 14, shared ground line. Manifest: `app/visual/ASSETS.md`
  (every asset needs a row — the commissioned-art swap point).
- `app/visual/map.js` — `stopPoints`, `mapState(game, sideIdx)`, `vanVariant(hp)`,
  `drawMap(ctx, ms, pal, opts)` with literal layers (base → zones-as-DATA → props →
  actors → foreground). Avatar token + damage ring; P2 white ring.
- `app/visual/stage.js` — `stageState(game, sideIdx, rec)`, `drawStage(ctx, st, pal,
  t, opts)`. Tier shells T1/T2/T3/W, sky-cycle tint by week, encore spotlight on win,
  flat room on fail, marquee verdict, weather overlay. Crowd formula
  `min(64, 4 + floor(fans/4))` — also appears as the Fans numeral (never pixels-only).
- `app/visual/director.js` — owns the rAF loop (30fps cap, clamped delta ≤50ms,
  sleeps hidden/static), tweens (1.2s van drive), particles (≤160/layer,
  auto-remove; additive pyro, alpha smoke/dust), captions + canvas aria-labels,
  `showtime` rail class, theme observer. ONLY file touching DOM outside its canvases.
- Layout: grid `minmax(340px,3fr) 7fr`, page max 1600px; rail sticky with map canvas,
  stage canvas, `#visualCaption` (aria-live polite). Mobile <1024px: map strip
  (~180px) above, stage hidden, rail `order:-1`. Print: rail `display:none`.
- Wizard: mode → name → genre → hometown → van → **avatar** (random/van/bus/guitar/
  mohawk/skull/bolt) → launch; stored in `side.flavor` (genre/hometown/van/avatar).
- Flyers: tier skins `flyer-t1..t4` (t4 inverted), support act per genre, door count,
  season W–L, weather/homecoming/sellout stamps. AI path swaps headline/blurb only.

### 1.4 Verification status (all green at handoff)
- `npm test` = 44 unit tests (21 engine incl. homecoming, 7 narrative, 6 press,
  10 visual) + scripted smoke seasons (solo/coop/versus/rival + basement/grind) +
  10k sim gates. All pass.
- Headless-Chrome bot (`?selftest=full`): `SELFTEST:PASS`, zero JS console errors.
- Screenshots reviewed: week-1, week-7 ROUGH, full-season finale, lime theme,
  smoking-van/storm, main-stage WIN, open gates, avatar picker, hometown flyer,
  showtime spotlight.

## 2. Feedback log (what the player said, in order)
1. Split 50/50 → ~30/70: more room for graphics; left side a control panel. (SHIPPED v7.)
2. Venue repetition (Coffee Shop/VFW/College Radio on loop). Custom hometowns
   (e.g. Gainesville, FL) should matter: weekend tours for momentum, slumps that
   send you home to local rooms. (SHIPPED v7: 16 venues, hometown names, weekend
   framing, Home Crowd safety net.)
3. Flyers need more graphic complexity. (SHIPPED v7: tier skins + generated lines.)
4. Right side too low-fi; player avatar unreadable. Wants: pickable avatar (guitar,
   mohawk, bus…) moving on the map; per-show the map slides away for a static
   venue illustration. (SHIPPED v7: avatars, show-mode. Illustration fidelity: §5.)
5. Fidelity question: how to raise right-side fidelity — framework (Angular?) or
   what? ANSWERED: no framework (DOM frameworks don't touch canvas fidelity);
   ranked levers = (1) better art in the same pipeline, (2) 960×720 resolution,
   (3) light/depth, (4) DOM-overlay text, (5) PixiJS only if Canvas 2D is outgrown.
6. Style target: cozy top-down pixel diorama (farmhouse/cherry/koi reference):
   warm narrow palette, high prop density, tileset ground + bespoke landmarks, one
   sun direction. (Adopted as art direction, §5.)
7. No single-view cap: different visuals per round AND per phase (travel, venue,
   merch printing…). (Adopted as scene deck, §4.)

## 3. Locked direction (principles — decide ties with these)
- Left drives, right performs. Controls never migrate into the rail.
- Renderer is read-only: engine never knows visuals exist; director consumes event
  payloads only, no engine math, no duplicate rules.
- Offline, zero-dependency, no build step: plain HTML/CSS/JS, no frameworks, no
  bundler. Canvas 2D until a documented bottleneck says otherwise.
- Flavor never touches rules: hometown names, weekend framing, avatars, AI copy are
  display-only. The one exception (Home Crowd entry into offers) is gated,
  sim-verified, and documented in §6.
- One sun, one accent: five themes re-skin everything; sticker yellow is constant.
- Every asset has a manifest row; every mechanics change re-runs the sim gates;
  docs (`DESIGN.md`, `BALANCE.md`, `README.md`) update with the code.

## 4. Target experience (what to build next)
### 4.1 Scene deck (the headline feature)
One persistent view is abolished. The director owns a deck of scenes; exactly one
is staged at a time; the map persists as a live minimap badge (van dot, flags,
gates) in the rail corner so orientation is never lost. Reduced motion: hard cuts,
same information. Beat → scene mapping (events already emitted by `app/ui.js`):

| Event (payload) | Scene | Rail behavior |
|---|---|---|
| `weekStart`, plain week | Map hub (full, avatar drive tween ~1.2s) | map full, stage preview below |
| `weekStart`/`roadEvent` on road weeks | Road cinematic: avatar drives a scrolling strip; storm/breakdown variants | scene full, map → minimap |
| `offerPicked` {venueName, tier} | Venue vista: both offers as illustrated exteriors; pick lights up | scene full, map → minimap |
| `diceRolled` | Soundcheck: empty room, wedges, string-light glow, no crowd | scene full |
| `showResolved` {rec, weather} | Show: existing stage + verdict hold ~2.5s (already `showtime`) | map collapsed (existing) |
| `workDone` {action: merch} | Merch close-up: table + shirt stacks = stock; press thump per sale | scene full |
| `workDone` {action: flyer} / `songWritten` / `albumDone` / `anthem` | Flyer wall: pole accumulates posters; each song slaps a new one + confetti | scene full |
| `workDone` {action: job} | Day-job vignette: gas station/dock; wrench-pop on van +1 (die 6) | scene full |
| `shopBuy` {what} | Backstage: roadie/tech/manager portraits join the wall as hired | scene full |
| `seasonEnd` {rank} | Finale panorama: main-stage wide shot + rank treatment | scene full |

Build order: (a) router + minimap + transitions; (b) the three work vignettes
(soundcheck→show→work is the lived loop, repetition hurts most there); (c) Road,
Venue vista, Backstage, Finale. Each scene = backdrop + existing sprite/particle
vocabulary + ONE signature prop. Budget holds: <200 draw calls/frame, ≤160
particles/layer, 30fps cap, sleep-when-static (see §8).

### 4.2 Art direction (from the reference: warm diorama pixel)
- Palette: earthy family (moss greens, tilled browns, thatch ochre) + exactly two
  accent voices (blossom pink for finale/anthem moments, pond teal for hype/calm).
  Re-tone map/stage tables first — free, no new art.
- Construction: autotiled ground (worn-asphalt tour ground; reuse the published
  dual-grid mask routine unchanged, TL=1 TR=2 BL=4 BR=8, nearest-neighbor only) +
  hand-placed venue landmarks per stop. Props-per-tile density is the goal: no
  empty ground, no confusing overlaps.
- Light: one sun direction, soft shadows under tokens/eaves, outlines on structures
  only. Volumetric glows (string lights, spotlight, pyro) carry the "fidelity" read.
- Resolution: raise canvases to 960×720 (integer-scaled) when scenes land; re-tune
  sprite draw sizes once. Crisp text (marquee, stamps, stop labels) moves to
  DOM/SVG overlay positioned over canvas — never canvas fillText for words.
- Sourcing: commissioned single ground tileset + one prop pack first (backgrounds
  carry scenes); or generated art via the §9 skill contracts when an image-capable
  session exists. Either way: manifest rows in `ASSETS.md`, swap — not rewrite.

### 4.3 Avatar, venues, flyers, stage (shipped — extend, don't redo)
- Avatar: 6 options, wizard step, `side.flavor.avatar`, map token + damage ring,
  versus P2 white ring + away kits. New avatars = new 16×16 map + manifest row.
- Venues: 16 + Main Stage (full table §6). Hometown naming via
  `homeVenueName(venue, side)` in `app/narrative.js` (T1 ids only). Weekend-run
  header when both offers share a tier. Homecoming per §6 — the ONLY math exception.
- Flyers: `flyer-t1..t4` + opener/motto/door/W–L/stamps. AI still swaps headline +
  blurb only, 9s timeout, silent offline fallback.
- Stage: tier shells + week sky tint + encore spotlight + marquee + weather. New
  dressing must cost ≤3 draw calls per element or come with a measured budget note.

## 5. Exact contracts (import these verbatim)
### 5.1 DOM ids/classes (stable — tests and CSS hook here)
`#app` (game), `#visualRail` (+`.showtime`), `#mapCanvas`/`#stageCanvas`
(480×360 attrs; 960×720 after §4.2), `#visualCaption` (aria-live polite),
canvases `role="img"` with week-accurate `aria-label`s. Flyer: `#flyerOverlay`,
`.flyer.flyer-tN`, `.flyer-support`, `.flyer-door`, `.fstamp(.hot)`, `.stamp.win/.fail`.
Offer cards: `.card(.warped/.home)`. Wizard radio names: `wmode wgenre whome wvan wavatar diff`.

### 5.2 Event contract (`Vemit(type, payload)` in `app/ui.js` → `MSOBVisual.emit`)
`weekStart {game, sideIdx}` · `offerPicked {venueId, venueName, tier, game, sideIdx}` ·
`diceRolled {game, sideIdx, dice}` · `showResolved {game, sideIdx, rec, weather}` ·
`workDone {game, sideIdx, action}` · `shopBuy {game, sideIdx, what}` ·
`songWritten {game, sideIdx, songs, albums}` / `albumDone` / `anthem` ·
`roadEvent {game, sideIdx, roll, kind, label}` · `seasonEnd {game, rank}`.
Director derives ALL visuals from payloads. No engine imports in visual files.

### 5.3 Pure mapping functions (unit-tested — keep pure, keep tested)
- `mapState(game, sideIdx)` → `{week, stopIndex, vanHp, morale, fame, tier,
  gatesOpen, results[], fameTier, avatar}`.
- `stageState(game, sideIdx, rec)` → `{tier, venueName, crowdN, bounce, weather,
  merchStock, songs, moralePose, verdict, margin, vanHp, albums, anthem, away, week}`.
- `vanVariant(hp)` → pristine ≥5 / dented ≥3 / smoking ≥1 / wreck 0.
- `needsHomeCrowd(side)` → true iff morale ≤1 OR last two non-rest/shop results fail.
- `homeVenueName(venue, side)` (narrative) · crowd `min(64, 4 + floor(fans/4))`.
- Tests: `tests/visual.test.js` (10) + `app/engine.test.js` (21 incl. homecoming
  isolation: healthy bands never see `home` in 200 draws).

### 5.4 Sprite contract (v6 §9.2, still law)
16×16 string maps (`.` transparent), offscreen-cached at boot, never parsed
per-frame. One action family per sheet; body-only (FX in director layers);
wheels/feet locked to row 14; one scale profile per actor from idle; idle/bob as
2×2 grids (no single-row strips). Canonical-first edits (damage derives from the
master). `audit()` must return `[]`.

## 6. Mechanics reference (venues + homecoming)
| Venue | Tier | D | Cash | Fame | Fans+ | Entry |
|---|---|---|---|---|---|---|
| Coffee House | T1 | 8 | 4 | 2 | +1 | $0, +1 Hype |
| Laundromat | T1 | 8 | 5 | 2 | +1 | $0 |
| VFW Hall | T1 | 9 | 6 | 3 | +2 | $0 |
| House Show / Pizza Parlor | T1 | 10 | 8/9 | 4 | +3 | $0 |
| Home Crowd | T1 | 8 | 5 | 2 | +2 | $0, homecoming only |
| Record Store | T2 | 10 | 8 | 5 | +3 | $2 |
| Dive Bar / Bowling Alley | T2 | 11 | 10/11 | 5 | +4 | $2 |
| College Radio / Community College | T2 | 12 | 6/7 | 6 | +4/+5 | $2 |
| Rock Club / Drive-In | T3 | 14/13 | 14/15 | 8/7 | +6 | $4 |
| Festival Side Stage | T3 | 14 | 12 | 8 | +7 | $4 |
| County Fair | T3 | 14 | 13 | 8 | +8 | $4 |
| Main Stage | W | 17 | 20 | 12 | +10 | $6, wk10+ & fame≥45 & 20% |
Homecoming: `drawOffers` excludes `home` from the normal pool; if
`needsHomeCrowd(side)` and rng < 0.5, one slot becomes `home` (evaluated per side
in versus). If gates ever fail after a mechanics change: retune numbers/frequency
only — never widen the mechanic or touch economy math.

## 7. File inventory (repo root = project root)
- `app/engine.js` — rules engine (no DOM, no deps), exports venues/road/costs,
  `createGame/drawOffers/resolveShow/resolveWorkDie/applyRoadEvent/buyCrew/restock/
  mechanic/finalScore/rankFor/rivalTurn/needsHomeCrowd/validateSide`, seeded RNG.
- `app/ui.js` — wizard + week flow + shop + flyer + `Vemit` event taps + `railShow`
  hooks. Number keys stage/unstage dice; focus states intact.
- `app/narrative.js` — pure flavor: intros, `offerFlavor` (all 16+1 ids),
  show/road/work/song/album/anthem/hire/rival lines, flyer copy, `homeVenueName`.
- `app/press.js` + `api/flavor.js` — invisible AI: Muse Spark via OpenRouter,
  server-side key only, 9s timeout, silent fallback. Engine never reads AI output.
- `app/visual/*` — §1.3. `app/selftest.js` — headless bot (`?selftest=full|N`).
- `app/sim.js` — 10k-season heuristic + gate checks. `tests/smoke-season.js` —
  scripted 12-week seasons (solo/coop/versus/rival + basement/grind).
- `print/sheet.html`, `print/rules.html` — print-and-play (inline CSS, no deps).
- `server.cjs` — local static + `/api/flavor` (port 8080). `index.html` — Vercel root → `/app/`.
- Live: `https://main-stage-or-bust.vercel.app` (auto-deploys `main`).

## 8. Budgets and non-functional law
- Perf: <200 draw calls/frame (~185 worst case), 30fps cap, clamped delta, sleep
  hidden/static, sprite cache, pooled particles. Dev probe `?fps=1` (title mirror).
- Accessibility: focus-visible everywhere, aria-live caption + `#live` log region,
  full keyboard week (tab + number keys), contrast ≥4.5:1 body text, meaning never
  pixels-only (crowd↔Fans, flags↔log, gates↔caption).
- Motion: `prefers-reduced-motion` → instant swaps, static frames, captions update.
- Print: rail hidden; sheet 1 page + rules 2 pages; B/W-safe; no color-only rules.
- Load: <1s local; no external assets/fonts (Boogaloo self-hosted, OFL).

## 9. Verification protocol (run all; ship only on green)
1. `npm test` — 44 unit + smoke + 10k sim gates (reach/bankrupt/mean). After ANY
   mechanics change; on gate failure retune numbers, never widen mechanics.
2. Headless Chrome: `?selftest=full` must end `SELFTEST:PASS` with zero JS console
   errors (ignore macOS `CVDisplayLink`/`task_policy` system noise).
3. Screenshots reviewed: phase-representative states (spell them in the commit
   message or session note, e.g. avatar picker, hometown flyer, showtime
   spotlight, storm-fail, finale-win) + one theme variant.
4. Keyboard: one full week by keyboard only. Print: sheet + rules open, paginate
   right, zero console errors.
5. Docs ship with code: `DESIGN.md` (rules), `BALANCE.md` (append sim row +
   tuning note), `README.md` (player-facing), `ASSETS.md` (manifest rows),
   `.agent/state.md` + `.agent/journal/<date>.md` (handoff), session record for
   multi-day work.

## 10. Ops and conventions
- Node 18, no deps, no Playwright: verify via headless Chrome screenshots +
  `--dump-dom` title/caption checks; run server with `npm start` (:8080), stop it
  when done; always pass an explicit working directory to shell commands.
- Env: `OPENROUTER_API_KEY` (+optional `OPENROUTER_MODEL`, `SITE_URL`) in Vercel
  Production scope; any env change needs a Redeploy (vars bake at build time).
  Missing key = silent offline zine (by design, never an error state).
- Git: `main`, auto-deploys. Commits imperative one-liners; push verified units;
  batch pushes to avoid build spam on multi-phase work. No remote changes without
  asking. Local folder is `road-to-warp` (stale name for the `main-stage-or-bust`
  repo — rename optional, requires server restart).
- No frameworks/bundlers in the game. No sound, save/load, netplay, or economy
  changes without a new directive line and fresh sim gates.

## 11. Open decisions (explicitly NOT decided — propose, don't assume)
- Scene-deck transition language (slide vs cross-fade per scene; minimap size).
- Which venue gets the first bespoke landmark illustration (recommend: Home Crowd —
  emotional anchor — or Main Stage — aspirational anchor).
- Tileset sourcing: commissioned pack vs generated (image-capable session) vs
  hand-built procedural tiles as an interim.
- 960×720 timing: with the scene deck or before it.
- Flyer pacing if 12/week modals fatigue (standing optional toggle, unscoped).
- Known doc drift (pre-existing, flagged not fixed): `DESIGN.md` venue table vs
  `app/engine.js` — Rock Club D13/fame7 vs D14/fame8, College Radio cash 8 vs 6.
  Per PRODUCT_SPEC any divergence is P0: reconcile the table to the engine (the
  §6 table in this file is engine-verified) before any distribution build.

## 12. Definition of done for the next build
Router + minimap + transitions live; three work vignettes live; every §5 contract
green; `npm test` green; bot season clean; screenshots + theme variant reviewed;
keyboard + print passes; docs (rules/balance/readme/manifest/memory) updated;
pushed to `main` with the reviewed states named. Then playtest — not another pass.

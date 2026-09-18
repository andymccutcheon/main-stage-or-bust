# VISUAL DIRECTIVE — Split-Screen 16-Bit Tour Presentation
## Main Stage or Bust · v6 proposal · status: DIRECTIVE (not yet implemented)

> Reads with: DESIGN.md (rules), PRODUCT_SPEC.md (gates), BALANCE.md (tuning).
> Decisions locked by stakeholder: right panel = journey map AND venue scenes;
> art = procedural code-drawn pixel art (offline, zero-dependency).

## 0. One-line concept
**Left hand plays the season, right eye watches the tour.** Every mechanical
action on the left stages a visible beat on the right: the van drives a
12-stop candy-colored road, and each gig plays out on a parametric
16-bit stage whose crowd, lights, weather, and wreckage are pure functions
of game state. The renderer never touches rules; the engine never knows it
exists.

## 1. Layout system
- **≥1024px:** `grid-template-columns: minmax(480px, 7fr) 5fr`. Left column =
  existing game UI (unchanged flow). Right column = visual rail, `position:
  sticky; top: 16px; max-height: calc(100vh - 32px)`, internally stacked:
  map canvas (aspect ~4:3) above, stage canvas (aspect ~4:3) below, plus a
  one-line caption (`#visualCaption`, aria-live polite) narrating the beat
  ("Bertha limps into week 4 — Dive Bar or bust.").
- **<1024px:** single column; visual rail becomes a compact strip (map only,
  ~180px tall) pinned above the active panel. No side-by-side, no overlap,
  touch targets unchanged.
- **Print:** visual rail is `display: none` in print CSS. Paper game untouched.
- **Left column max-width stays 880px** for the whole grid; the rail takes
  the freed space (page max becomes ~1400px on wide screens).

## 2. Rendering architecture
- **Two `<canvas>` elements, one rAF loop:** `#mapCanvas` (journey, redraws
  on week/morale/van/fame change) and `#stageCanvas` (venue, redraws every
  frame during performance beats, static otherwise). Internal resolution
  480×360 each, CSS-scaled with `image-rendering: pixelated`.
- **Files (new `app/visual/`):**
  - `palette.js` — theme table. Reads the active CSS accent via
    `getComputedStyle` so all five palettes re-skin neon/sign/sky.
  - `ASSETS.md` — asset manifest per §9.7 (every sprite needs a row).
  - `sprites.js` — every sprite as a function drawing to offscreen canvas
    from string maps (`.` transparent). 16×16 base grid. Cached once.
  - `map.js` — road spline, stops, van marker, weather badges. Pure
    `drawMap(ctx, mapState)`.
  - `stage.js` — venue scene. Pure `drawStage(ctx, stageState, t)`.
  - `director.js` — subscribes to UI events, owns the rAF loop, tweens
    transitions, writes captions + canvas `aria-label`s. ONLY file that
    touches the DOM outside its canvases.
- **Event contract (UI emits, director listens; engine untouched):**
  `weekStart | offerPicked | diceRolled | showResolved | workDone |
  shopBuy | songWritten | albumDone | anthem | roadEvent | seasonEnd`.
  Each carries the already-computed side state + rec. Director derives ALL
  visuals from that payload — no duplicate math.
- **Performance budget:** sprite cache (no per-frame string parsing),
  <200 draw calls/frame, 30fps cap, loop sleeps when tab hidden or when
  both scenes are static. `prefers-reduced-motion` → jump-cut static frames,
  zero tweening.

## 3. Sprite catalog (all 16×16 unless noted, palette-swapped at draw)
| Sprite | Variants | Driven by |
|---|---|---|
| Van | pristine / dented / smoking / wreck (exhaust puffs increase) | `van` 6→0 |
| Band members ×4 (vox, guitar, bass, drums) | idle bob / jump / slump | show result, morale |
| Crowd blob | 4 shirt colors from theme | count = `min(64, 4 + floor(fans/4))` |
| Venue shells | basement / club / hall / main-stage (32×24 backdrops) | tier |
| Marquee sign | text blit: venue name, `WKn`, W/L stamp | week, venue, last rec |
| Weather | sun / cloud / storm / night stars | road roll, week |
| FX | confetti (album/anthem), pyro (main-stage win), dust (drive) | events |
| Props | merch table (stock level!), flyer pole (posters = songs), trophy | merch/songs/fame |
| Versus extras | P2 van (white), P2 kit color | side index |

## 4. Scene specifications
### 4A. Journey map (Candyland/Game-of-Life read)
S-curve road, 12 numbered stops labeled with the venue actually played
(backfilled as the season advances; future stops show `?`). Finale stop is
a gated Main Stage: gates closed + gray until fame≥45 & week≥10, then open
+ glowing. Van marker tweens along the spline on `weekStart` (~1.2s drive
with dust puffs + caption). Stop flags: gold star (win), gray X (fail),
red cross (rest/shop skip). Weather badge pinned over current stop on road
weeks. Fame aura: roadside houses gain lit windows per tier unlocked.
Versus: two vans race (P1 accent, P2 white); coop: one van, twice the dust.
### 4B. Venue scene (nightly payoff)
Parametric by tier, dressed by state:
- **T1 basement:** brick wall, string lights, PA stack, 4–20 crowd.
- **T2 club:** neon venue-name sign (theme accent), monitor wedges, 20–40.
- **T3 hall:** balcony row, lighting rig with sweeping beams, 40–56.
- **W main stage:** open sky (day) or pyro rig (win), wristband sea to 64.
Show beat (on `showResolved`): lights dip → 2.5s performance loop (band
bobs, crowd bounce amplitude = margin-scaled; fail = still crowd, slow
sway) → verdict: marquee stamps WIN (gold) / rough night (gray), confetti
if album/anthem that week, rain overlay if road storm. Morale ≤1 slumps
the band; van ≤2 parks a smoking van sprite stage-left. Merch table prop
reflects stock; flyer pole gains a poster per song written.
### 4C. Caption line
One present-tense sentence per beat, generated from existing narrative.js
copy plus location clause. Also mirrored into canvas `aria-label`s.

## 5. State-mapping contract (renderer is read-only)
`mapState(game, side)` → `{ week, stopIndex, vanHp, morale, fame, tier,
gatesOpen, results[] }`. `stageState(game, side, rec)` → `{ tier, venueName,
crowdN, bounce, weather, merchStock, songs, moralePose, verdict }`. Both are
unit-testable pure functions: crowd formula, stop index, gate predicate,
verdict mapping. The ONLY allowed randomness in visuals: particle seeds.

## 6. Theming, accessibility, modes
- Accent flows map neon → marquee → finale glow → P1 van. Sticker yellow
  stays fixed (posters, flyer callbacks). New palettes work with zero art
  changes (they only add table rows).
- Reduced motion: static frames, captions still update. All meaning exists
  in the log; canvases are `role="img"` with week-accurate labels.
- Contrast: scene is decorative; no gameplay info lives ONLY in pixels
  (crowd count also appears as Fans numeral — enforced by test).
- Versus: active side's kit colors on stage; map shows both vans.

## 7. Milestones & acceptance
- **M1** shell: split layout, sticky rail, two blank canvases, caption line.
- **M2** map: spline, stops, van tween on week change, win/fail flags.
- **M3** stage: 4 tier shells, band, crowd-from-fans, marquee.
- **M4** beats: performance loop, verdicts, weather, confetti/pyro, props.
- **M5** systems: theming, a11y labels, versus/coop, reduced motion.
- **M6** lock: snapshot tests (3 anchor states), perf audit, docs.
- **Accept gates:** (0) §9.2 QC gate at M3 (anchors, scale profile, edge-crosstalk);
  (1) full bot season renders zero console errors;
  (2) screenshots of week-1/VFW, week-7/fail-with-smoking-van, week-12/
  finale-win reviewed; (3) keyboard-only play unaffected; (4) print
  unchanged; (5) unit tests for both mapping functions green.

## 8. Risks & non-goals
- **Scope creep** (bespoke art per venue): contained by parametric tiers —
  9 venues, 4 shells, no exceptions in v6.
- **Renderer-driven logic**: forbidden by contract; director may not import
  engine math, only consume event payloads.
- **Non-goals:** sound, touch-drag map, save/load, multiplayer netplay,
  hand-authored sprites (revisit only if procedural proves charmless in M3
  review — the M3 screenshot gate is the explicit off-ramp).

## 9. Skill-hunting guidance (evaluated 2026-09-18)
Source: `/Users/andymccutcheon/skill-hunting/sprites/` — three families, all
read (entry SKILL.md files in full; large files via headings + contracts).
Verdict logic: cannot-execute-here skills still contribute enforceable
contracts; Apple-only APIs contribute patterns, never imports.

### 9.1 Verdict table
| Skill | Verdict | Why |
|---|---|---|
| agent-sprite-forge/generate2dsprite | ADOPT CONTRACTS, cannot execute | Requires built-in `image_gen` (absent). Sheet-shape, anchor, scale-profile, body/FX-separation, and QC rules govern ALL future art, whoever makes it. |
| agent-sprite-forge/generate2dmap | ADOPT LAYER CONTRACT, cannot execute | Requires `image_gen`. The 7-layer contract (base/props/actors/foreground/collision/zones) structures the procedural map anyway. |
| agent-sprite-forge/video2dsprite | SKIP | Grok-Build-only tools by its own gate; tells other agents to stop. |
| SpriteCook (all 8) | ADOPT WORKFLOWS, cannot execute | Requires SpriteCook MCP + credits (absent). Consistency, animation-prompt, and dual-grid renderer rules transfer directly. |
| SpriteKit-Pro + 4 loop/anim/particle/perf refs | ADOPT PATTERNS | Swift APIs unusable; delta-time, atlas-cache, state-machine, particle-budget, and evidence-based perf rules port to Canvas verbatim. |

### 9.2 Art production contract (from generate2dsprite Agent Rules)
Applies to procedural sprites NOW and generated sprites LATER:
- One action family per sheet; heroes get separate per-action grids, QC'd
  individually before any atlas assembly.
- Body sheets stay body-only: confetti, pyro, dust, and marquee flashes are
  separate FX layers composited at runtime (director.js owns layering).
- Feet/bottom anchors locked across every frame of an actor; van wheels
  share one ground line in all four damage variants.
- One scale profile per actor, derived from the accepted idle: crowd blobs,
  band members, and vans never rescale between states.
- No single-row strips for characters (drift risk); idle/bob = 2x2 grids.
- M3 screenshot gate IS the skill's QC gate: centered subjects, stable
  anchors, no edge-crosstalk — fail it and generations (or redraws) repeat.

### 9.3 Map layering contract (from generate2dmap layered-map-contract)
Implement map.js as literal layers, even though the base is procedural:
`base` (road spline + terrain, no actors/text) → `zones` (stop hit-areas
as DATA, never pixels) → `props` (signs, houses, finale gates, each with
`{x, y, sortY, occlusionClass}` metadata) → `actors` (vans, y-sorted) →
`foreground` (overhanging signposts, finale arch crown) → caption/HUD.
Anti-patterns adopted as law: never bake stop numbers, venue names, or
results into the base; never treat a sprite bbox as a hit-area; art updates
must update zone metadata and the §5 mapping tests together.

### 9.4 Tileset strategy (from SpriteCook tilesets + dual-grid)
- v6 map stays vector-spline (a 12-stop road needs no autotiling).
- IF terrain richness becomes a goal: generate ONE 15-piece top-down tileset
  (32px, transparent edges, single material prompt, e.g. `worn asphalt tour
  road`), vendor the PNG + manifest, and port the skill's dual-grid mask
  routine to Canvas unchanged (mask order TL=1, TR=2, BL=4, BR=8;
  frameByMask table as published). Do NOT reinterpret it as an 8-neighbor
  blob set. Nearest-neighbor scaling only.

### 9.5 Character/animation discipline (from SpriteCook consistency + animate)
- Canonical-first: model the van once, then derive dented/smoking/wreck by
  EDITING that master (damage layers), never redrawing — same silhouette,
  same wheels, same anchor.
- One motion per job: idle-bob, jump (win), slump (morale), drive-bounce are
  separate loops on the same base; describe each as what-moves/what-stays
  (e.g. "drummer's arms piston, torso stable, kit static").
- Crowd: 4 shirt-color variants of ONE blob, phase-offset — never 64 unique
  drawings. Bounce amplitude is the margin signal, not new art.

### 9.6 Loop, animation, particles, perf (from SpriteKit-Pro refs)
- rAF loop uses clamped delta (`min(raw, 50ms)`), first-frame/resume spike
  guard; sleeps when hidden AND when both scenes static.
- Sprite cache = preloaded atlas: parse string maps ONCE at boot, never
  inside the frame loop; no per-frame allocation in hot paths.
- Animation states are a tiny state machine per actor
  (`idle|jump|slump|drive`), transitions guarded (`if (s === cur) return`),
  cancellable by key (van drive vs idle).
- Particles: one-shot FX (confetti, pyro, dust) carry auto-remove counts;
  additive blending for pyro/glow, alpha for smoke/dust; pooled arrays,
  dead emitters removed, never left in the node list; budgets set from the
  M6 perf audit on the slowest available device, not from sample counts.
- Perf evidence: dev-only FPS/draw-call overlay (never shipped); measure
  frame time with all FX overlapping before claiming headroom.

### 9.7 Manifest discipline (from SpriteCook workflow-essentials)
`app/visual/ASSETS.md` logs every sprite/tileset: id, source (procedural
vX or vendored file + origin + license), scale profile, anchor, states.
No asset enters the game without a manifest row — this is what makes the
M3 off-ramp (procedural → commissioned/generated) a swap instead of a
rewrite.

### 9.8 What unlocks execution
- An `image_gen`-capable session activates generate2dsprite/generate2dmap
  as written (magenta-sheet pipeline + python post-processing).
- A SpriteCook MCP connection + credits activates tilesets, character
  animation, and prop packs per their polling contracts.
- Neither is required for v6: the directive above ships the whole visual
  game procedurally, with every contract ready to receive generated art.

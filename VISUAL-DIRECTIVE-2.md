# VISUAL DIRECTIVE 2 — Control Panel + Living Tour (v7 proposal)
## Status: DIRECTIVE (approved from playtest 2026-09-18) · Reads with: VISUAL-DIRECTIVE.md (v6, shipped), DESIGN.md, BALANCE.md

Playtest verdict: the split screen works, but the game column hogs space, venues
repeat, flyers are flat, the stage is low-fi, and nobody knows what the map token is.
This directive fixes all five with one principle: **left drives, right performs.**

## 0. One-line concept
**Left is the cockpit (30%), right is the show (70%).** The map token becomes YOUR
avatar, gigs get regional texture from your hometown, flyers look Xeroxed per tier,
and when the show starts the map slides away so the venue fills the rail.

## 1. Layout: 30/70 control panel
- `grid-template-columns: minmax(340px, 3fr) 7fr`, page max ~1600px. Left keeps
  every control and target size; dice already wrap. Left is dense, right breathes.
- Rail stays sticky; caption stays under the canvases.
- `<1024px` unchanged (map strip above, order -1). Print still hides the rail.
- **Show-mode:** on `showResolved`, director adds `showtime` to the rail: map
  collapses (max-height/opacity transition ~450ms), stage canvas grows to fill the
  rail. On flyer close / next `weekStart`, class removed, map slides back.
  Reduced motion: instant swap, no transition.

## 2. Avatar token (replaces the van dot)
- Setup wizard gains an **avatar step** (after van): pick 1 of 6 —
  `van` (Bertha classic), `bus` (school bus), `guitar`, `mohawk`, `skull`, `bolt`.
  Stored in `side.flavor.avatar`; pure flavor, zero mechanics.
- `sprites.js` adds 5 avatar maps (16×16, same anchor/ground-row contract, new
  manifest rows). Derived palette-swapped like the band.
- `mapState` carries `{ avatar, vanHp }`; the marker draws the avatar token with a
  damage ring (accent→yellow→red by vanHp). Van damage still lives in the Van stat
  and the stage-left van prop. Versus: P1 accent avatar, P2 white avatar.
- Stage keeps the van prop (the vehicle) — avatar is the traveler, van is the van.

## 3. Venue diversity + hometown texture (only mechanics-touching part)
Goals: kill repetition, make custom hometowns matter, reward/penalize momentum —
without breaking the sim gates (mean 110–180, reach 15–40%, bankrupt <15%).

- **+6 venues (2 per tier T1–T3), stats inside existing bands** so balance holds:
  T1 `Laundromat` (D8, safe floor), `Pizza Parlor` (D10, merch-friendly);
  T2 `Bowling Alley` (D11), `Community College` (D12);
  T3 `Drive-In` (D13), `County Fair` (D14). Names/flavor in engine + narrative.
- **Hometown naming (display only, `narrative.js`):** T1 venues render with the
  band's hometown when the side picked one ("Gainesville VFW", "Riverside House
  Show"). No math, pure belonging.
- **Weekend-run framing (display only):** when both offers share a tier, the UI
  heads the pair "Weekend run — <tier> rooms" with a momentum line. No math.
- **Homecoming (one small mechanic):** new T1 venue `Home Crowd` (D8, $5/2fame/+2,
  entry $0) enters the offer pool ONLY after 2 consecutive fails (or morale ≤1):
  the game offers a soft landing back home. Engine: `drawOffers` checks the tail
  of `side.results`; sim must re-pass gates or the numbers get retuned, not the
  mechanic widened. Versus: each side evaluated independently.

## 4. Flyer skins (DOM, screen-only)
- Per-tier skin classes `flyer-t1..t4`: distinct header rules, stamp sizes,
  background tints (still B/W-printable), plus: attendance line (from fans),
  date line (Week N of 12 + venue), support-act line (genre-flavored), tier mottos,
  weather/road rubber stamps when relevant (storm week, breakdown), W/L record strip.
- All new copy derives from existing `rec` + `narrative.js`; AI path untouched
  (still headline/blurb swap only).

## 5. Stage craft (sophistication without new deps)
- **Week sky cycle:** weeks 1–4 dusk amber wash, 5–8 deep night, 9–12 finale glow
  (warm horizon + brighter marquee). Pure tint math on existing backdrops.
- **Dressing per tier:** bunting strings (T1), poster wall (T2, posters = songs),
  truss spots with alternating sweep (T3, exists — add second color), arch fireworks
  ember drift on W wins (particle, budgeted).
- **Encore spotlight:** on win, a soft white cone follows the vox slot for the
  verdict hold; on fail the room stays flat gray. One gradient, no sprites.
- Budgets hold: still <200 calls, ≤160 particles/layer, 30fps, sleep-when-static.

## 6. Milestones & acceptance
- **P1** layout + show-mode. Accept: 30/70 at 1400px, map collapses/returns,
  reduced-motion instant, print/mobile unchanged.
- **P2** avatar. Accept: picker in wizard (all modes), token on map both vans in
  versus, manifest rows, zero engine changes.
- **P3** venues. Accept: 15-venue pool in offers, hometown names render, homecoming
  triggers after 2 fails, **sim gates re-pass** (else retune numbers only).
- **P4** flyers. Accept: 4 tier skins + new lines screenshot-reviewed.
- **P5** stage craft. Accept: sky cycle across weeks, spotlight on win, screenshots
  W-finale-win + storm-fail reviewed, draw-call estimate documented.
- Global: `npm test` green, bot season zero JS errors, keyboard flow untouched.

## 7. Non-goals
Sound, save/load, multiplayer, generated art, new resources/costs, tier-stat drift
beyond listed bands, touchingGrit/economy math. If homecoming distorts gates, cut
its frequency (eligibility), never buff its payout.

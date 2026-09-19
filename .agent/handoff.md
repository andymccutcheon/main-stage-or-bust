# Handoff — Main Stage or Bust (2026-09-18)

**You're picking up Main Stage or Bust — start here.**

**Project:** a 12-week DIY-band roll-and-write (web game + print-and-play), repo
`github.com/andymccutcheon/main-stage-or-bust`, `main` branch, Vercel auto-deploys.
Local folder is called `road-to-warp` (stale name, don't rename without asking).
Work from the repo root; memory lives in `.agent/`.

**Read in this order:** `REFINEMENT-DIRECTIVE.md` (the whole plan — shipped state,
contracts, scene deck, budgets), then `.agent/state.md`, then `DESIGN.md` §2/§6
(rules + venues). Everything else (`BALANCE.md`, v6/v7 directives, session notes)
is reference.

**Where it stands:** game + v6 visuals + v7 (30/70 layout, avatars, 16 venues +
Home Crowd safety net, flyer skins, stage craft) are all shipped, tested (44 unit,
smoke, 10k sim gates green), and live. Head is clean and pushed.

**Your build:** the scene deck (`REFINEMENT-DIRECTIVE.md` §4.1) — router + minimap
first, then the three work vignettes (merch, flyer wall, day job), then Road,
Venue vista, Backstage, Finale. Art direction (§4.2): warm diorama palette,
tileset ground + bespoke landmarks, 960×720 when scenes land.

**Law:** renderer is read-only (director consumes event payloads, no engine math);
flavor never touches rules (Home Crowd is the one exception — don't widen it);
every asset gets an `ASSETS.md` row; every mechanics change re-runs `npm test` +
sim gates; docs ship with code. No frameworks, no deps, no build step. Node 18.

**Verify like this:** `npm test` → headless `?selftest=full` must read
`SELFTEST:PASS` with zero JS console errors (ignore macOS CVDisplayLink noise) →
screenshot-review each new scene + one theme variant → one keyboard-only week →
print pages still paginate. Name the reviewed states in your commit/session note.

**Known landmine:** `DESIGN.md`'s venue table drifts from `app/engine.js`
(Rock D13→D14, College cash 8→6) — flagged P0 in the directive §11; reconcile to
the engine before any distribution build. And if the stage ever renders without
sprites, check the director's argument order to `drawStage(ctx, st, pal, t, opts)`
— that exact bug ate an hour once.

Good luck — play a week first, then build.

# MAIN STAGE OR BUST — Roll & Write Tour Diary (1–2 players)

Take your DIY band from VFW halls to the main stage in a 12-week season.
Solo (beat the ranks), Coop (one shared band), Versus (two bands, headliner bonus), or Solo vs the Computer. Plus full print-and-play.

## Play the video game
No build, no accounts, works offline. Either:
- Open `app/index.html` in any modern browser, or
- `npm start` → game at http://localhost:8080/app/

Onboarding runs as a short wizard: mode → band name → genre tiles → hometown → van → difficulty + start. The **? How to play** button (top right, every screen) opens the full rules modal.

Type: display face is self-hosted Boogaloo (`app/fonts/`, OFL licensed) with Arial Black/Impact fallback — offline-safe. Swap one `--font-display` variable to change it everywhere.

Palette: five accents (Safety Orange, Xerox Pink, Slime Lime, Copier Blue, Riot Red) via the header swatches — saved per browser, poster yellow stays put.

Keyboard: number keys stage/unstage dice · everything is also clickable/touchable.

## Play on paper
Open `print/sheet.html` + `print/rules.html` in a browser → Print → Letter/A4.
You need: 5 white d6 + 1 gold d6 (Manager only), a pencil. Black-and-white friendly.

## What's new in v1.1
- **Roadie's clipboard:** every week shows 6 steps with what to do and what it costs/earns your career.
- **Band identity:** pick a genre, hometown, and van name (or roll random) — the whole season's story addresses YOUR band.
- **Show-flyer recap** after every gig: result stamp, payouts, band-state warnings.
- **Hype Press (invisible):** every flyer headline is written by Muse Spark via OpenRouter through the game's own `/api/flavor` proxy — the key lives in the `OPENROUTER_API_KEY` env var, never in the browser. There is no toggle and no branding: flavor only (the dice are still the law), silent fallback to the offline house zine. Local dev: `OPENROUTER_API_KEY=sk-or-… npm start`.

## The week (both versions, same rules)
1. Road die (weeks 4/7/10) · 2. Pick 1 of 2 gig offers · 3. Roll (no rerolls — play what you roll)
4. Stage 2 dice (+Hype, max +2) vs venue Difficulty · 5. Work 3 leftover dice (merch/flyer/day job)
6. Pairs in leftovers write songs (4 = album) · 7. Payouts. Final = Fans + Fame + ⌊Cash/5⌋ + Albums×10.

## Project map
| File | What |
|---|---|
| `DESIGN.md` | Full game design (12-section spec) |
| `PRODUCT_SPEC.md` | Print + digital requirements, acceptance gates |
| `IMPLEMENTATION_PLAN.md` | Build phases as executed |
| `BALANCE.md` | Sim-verified balance report |
| `app/engine.js` | Shared rules engine (no DOM, no deps) — single source of truth |
| `app/ui.js` | Browser game UI |
| `app/narrative.js` | Offline story engine (pure, tested) |
| `app/press.js` | Client flavor hook (server-first, offline fallback) |
| `api/flavor.js` | Server flavor proxy (OpenRouter key in env) |
| `server.cjs` | Local dev server (static + `/api/flavor`) |
| `app/selftest.js` | Headless full-season browser bot (`?selftest=full`, `?selftest=N` pauses) |
| `app/engine.test.js` | 20 unit/integration tests (`node --test`) |
| `app/sim.js` | 10k-season Monte Carlo + balance gates |
| `tests/smoke-season.js` | Scripted 12-week seasons, all 4 modes + 2 extra difficulties |
| `print/sheet.html`, `print/rules.html` | Print-and-play (inline CSS, no deps) |

`npm test` = unit tests + smoke seasons + 10k sim gates.

## Live AI setup (Vercel)
Vercel Dashboard → project → Settings → Environment Variables:
- `OPENROUTER_API_KEY` = your `sk-or-…` key (required)
- `OPENROUTER_MODEL` = override, default `opencode/muse-spark-1.3-contributor-free` (optional)
- `SITE_URL` = your live URL, e.g. `https://main-stage-or-bust.vercel.app` (optional, sent as referrer)
Save → Redeploy. No key = the game silently runs the offline house zine.

## Verified (see BALANCE.md + screenshots in session notes)
- 20/20 engine tests; scripted seasons pass in solo/coop/versus/rival + basement/grind.
- 10k-season sim (3 seeds): win rate ~85%, mean score ~210, Main Stage played ~39%, bankruptcy ~0% — all gates pass.
- Real headless-Chrome playthrough: `SELFTEST:PASS` (full season, results screen), setup/week/results screenshotted and reviewed.
- All pages serve HTTP 200; print pages render to one sheet + two rules pages.

## Still needs humans (not automatable here)
- [ ] Click/touch full season in each mode; keyboard-only week.
- [ ] Print on real Letter + A4; pencil-usability of the sheet (esp. 60-box fame ladder).
- [ ] Feel checks: Van-0 spiral, coop D+1, versus Headliner swing, Grind pressure, week resolution time <3 min by week 3.
- [ ] Screen-reader pass (aria-live log + labels are in place, untested with AT).

## Tuning levers (if playtest says too easy/hard)
Easy: Main Stage replacement 20%→15%, T3 fame 7/8→6/7, skill every 5th star. Hard: T2 entries $2→$3, hype cap +2→+1/show, fame gate 45→40.

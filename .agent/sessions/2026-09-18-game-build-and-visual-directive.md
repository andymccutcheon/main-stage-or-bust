# Session: Main Stage or Bust — full game build → visual directive
Date: 2026-09-18 (work spanned Sep 16–18 local). Repo: `main-stage-or-bust` (github.com/andymccutcheon/main-stage-or-bust, public, Vercel-linked).

## What was built / changed (all committed + pushed, 10 commits)
- Full roll-and-write game **MAIN STAGE OR BUST** (renamed from Road to Warped mid-session): `app/engine.js` (shared rules engine), `app/ui.js` (game UI), `app/narrative.js`, `app/press.js` (client flavor hook), `api/flavor.js` (OpenRouter server proxy), `server.cjs` (dev server), `app/sim.js` (10k-season Monte Carlo), `tests/` (engine 20 + narrative 7 + press 6 = 33 tests), `print/sheet.html` + `print/rules.html`, `app/selftest.js` (headless full-season browser bot), `app/styles.css`, `index.html` (root redirect for Vercel).
- Balance history: v3 (D8–D17 table) → v4 (rerolls+Caffeine REMOVED, win 85%→75%, mean 210→189, no retune needed) → v5 (scoring cut to Fans+Fame, ranks 185/160/135/110/80, mean ~142, all 6 ranks hit).
- Native AI: Muse Spark 1.3 (`opencode/muse-spark-1.3-contributor-free`) via OpenRouter through `/api/flavor`; key in `OPENROUTER_API_KEY` env (Vercel). Invisible: no toggle, no branding, silent offline fallback. Rival opponent ("Stagedivers (CPU)") is pure probability tables — NO LLM. Renamed user-facing "Rival AI" → "Vs Computer".
- Design passes: onboarding wizard, flyer recap modal, help modal, stat tiles + tooltips, palette switcher (5 accents), Boogaloo display font (self-hosted `app/fonts/`, OFL included), soundcheck/stage/shop redesign (seg control REMOVED with rerolls; live SHOW-vs-DIF readout; computed work payouts).
- `VISUAL-DIRECTIVE.md` (131+ lines): split-screen directive (controls left, 16-bit map+stage canvases right, procedural art) + §9 skill-hunting guidance. Next session kicks off implementation M1.

## Key decisions — and why
- **No rerolls**: beginner approachability; sim proved balance improved without retune (fails now occur → morale/van systems matter).
- **Fans+Fame scoring**: two running totals, zero endgame math; ranks recalibrated from 8k sims.
- **AI flavor-only, server-side key**: browser must never see OpenRouter key; engine never reads AI output (determinism preserved).
- **Procedural art (user chose)**: offline-first, zero-dep stack preserved; skill-hunting skills can't execute here (no image_gen/MCP/Grok) so they contribute contracts only.
- **Rename to Main Stage or Bust**: shed borrowed Warped equity; cascade covered venue/ranks/copy/docs.
- **Docs as source of truth**: DESIGN.md, BALANCE.md, README.md, PRODUCT_SPEC.md updated with every mechanics change.

## What didn't work / gotchas
- `default.write` tool repeatedly aborted → use bash heredocs / `default.edit` for all file writes.
- Silent non-matching `str.replace` in python patches (bot broke once) → ALWAYS `assert count == 1` before replace.
- Shell cwd resets to `~/Documents/GitHub`, NOT the project → always pass `workdir`.
- `default.task` subagents abort in this env → read skills directly; image skills need gen-tools absent here.
- Stale day-one static server squatted on :8080 and shadowed server.cjs (identical 404 body) → `lsof -i :8080`, kill by PID.
- Rename sweep prefix-collision (`warpedW` inside `warpedWins`) broke sim gate → order replacements longest-first; gates caught it.
- Self-referencing CSS var (`--font-display` containing `var(--font-display)`) rendered *something* plausible — verify computed font, not eyeball.
- Headless Chrome `--dump-dom` + screenshot in one command timed out once → run separately.
- Modal opened scrolled to bottom: cause was focusing the bottom close button → focus dialog top instead.

## Patterns learned
- Sim gates (10k seasons, 3 seeds) catch balance AND rename regressions — run after every mechanics change.
- `?selftest=full|N` + `?showhelp` URL hooks enable real headless-Chrome E2E (no Playwright: needs Node 20+, we have 18).
- Screenshot every visual change; review before commit.
- Commit style: imperative one-liners; push after every verified unit (Vercel auto-deploys main).
- Vercel: zero-config static, root index.html redirects / → /app/.

## Open work / next steps (ranked)
1. **M1 visual build** per VISUAL-DIRECTIVE.md (layout shell + canvases + caption). (Next session's stated goal.)
2. User sets `OPENROUTER_API_KEY` in Vercel env + redeploys to light up live AI (falls back silently until then).
3. Human playtests that can't be simmed: van-0 spiral feel, coop D+1, versus Headliner swing, Grind pressure, sheet pencil-usability (60-box fame ladder), screen-reader pass.
4. Optional: rename project folder `road-to-warp` → match game (requires localhost server restart); directory rename untouched deliberately.
5. Optional: flyer-modal pacing toggle if 12/week feels interruptive ("skip flyers").

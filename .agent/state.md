# State — Main Stage or Bust (as of 2026-09-18 session close)
## Current State
- Game is complete, balanced (v5: 75% skilled win rate, mean ~142, Fans+Fame), and LIVE via Vercel auto-deploy from `main` (github.com/andymccutcheon/main-stage-or-bust).
- AI flavor (Muse Spark/OpenRouter) is code-complete but DARK until user sets `OPENROUTER_API_KEY` in Vercel env + redeploys; offline fallback active.
- Visual rail SHIPPED (M1–M6): split-screen 16-bit map + venue stage + caption (`app/visual/`: palette, sprites, map, stage, director, ASSETS.md). Full `npm test` green (42 unit tests incl. 9 visual-mapping, smoke seasons, 10k sim gates pass); headless-Chrome E2E `SELFTEST:PASS` with zero JS console errors; anchor screenshots reviewed (week-1, week-7 ROUGH, full-season finale, lime theme, smoking-van/storm + main-stage WIN + open-gates edge states).
- Working tree has the visual build uncommitted; localhost server running during verification (port 8080, stop when done).
## Open Work (ranked)
1. User: Vercel `OPENROUTER_API_KEY` + redeploy (lights up live AI + auto-deploys visuals).
2. Human playtests (van spiral, coop D+1, Headliner swing, Grind, sheet usability, screen reader, visual-rail feel).
3. Optional: folder rename (`road-to-warp` → match game), flyer-skip toggle.
## Standing constraints
- Write tool unreliable → bash heredocs / edit tool; assert every python replace (`count == 1`).
- Always pass `workdir` (shell resets to ~/Documents/GitHub); Task subagents abort; Node 18 (no Playwright).
- Verify visuals via headless-Chrome screenshots; run sim gates after mechanics changes; commit+push per verified unit.

# State — Main Stage or Bust (as of 2026-09-18 session close)
## Current State
- Game is complete, balanced (v5: 75% skilled win rate, mean ~142, Fans+Fame), and LIVE via Vercel auto-deploy from `main` (github.com/andymccutcheon/main-stage-or-bust).
- AI flavor (Muse Spark/OpenRouter) is code-complete but DARK until user sets `OPENROUTER_API_KEY` in Vercel env + redeploys; offline fallback active.
- Working tree clean; HEAD `1e59866`. Localhost server NOT running (stopped after testing); start with `npm start` (port 8080).
- `VISUAL-DIRECTIVE.md` (+§9 skills) is the approved plan; implementation NOT started.
## Open Work (ranked)
1. M1 visual build (split layout shell, canvases, caption) — next session goal.
2. User: Vercel `OPENROUTER_API_KEY` + redeploy.
3. Human playtests (van spiral, coop D+1, Headliner swing, Grind, sheet usability, screen reader).
4. Optional: folder rename, flyer-skip toggle.
## Standing constraints
- Write tool unreliable → bash heredocs / edit tool; assert every python replace (`count == 1`).
- Always pass `workdir` (shell resets to ~/Documents/GitHub); Task subagents abort; Node 18 (no Playwright).
- Verify visuals via headless-Chrome screenshots; run sim gates after mechanics changes; commit+push per verified unit.

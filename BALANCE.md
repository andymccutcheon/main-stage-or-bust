# Balance Report — v4 engine, no rerolls (sim-verified)

Policy: near-optimal heuristic (top-2 stage, exact hype spend, merch>flyer>job priority, timed crew buys; no rerolls since v4). Represents skilled play; casual humans should trend 10–20% lower.

## Results
| Seeds | N | Mean | Med | p10 | p90 | Win% | Main played | Main won* | Bankrupt | Mean fame |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10000 | 189.4 | 191 | 152 | 225 | 74.5 | 26.6% | 540 | 0% | 57.2 |

*Main-won counts seasons with >=1 Main Stage win (~20% of Main Stage plays).

Rank spread (N=10k): Headliner 293, Main Stage Bound 3549, Road Dogs 4697, Club Kings 1281, Local Opener 180. All ranks reachable, median = Road Dogs.

## Gates (PRODUCT_SPEC G2): ALL PASS
- Main-stage reach 15–40%: 27% PASS
- Bankruptcy <15%: ~0% PASS
- Mean 150–230: 189 PASS

## Key tuning decisions (v1->v3)
1. Best-2-of-5 averages ~10.2, so D4–D8 table won 100%. Moved to D8–D17 band.
2. Pairs-from-all-dice made songs free (~90%/wk). Songs now use leftover 3 dice (~44%/wk) — creates stage-vs-song tension.
3. Margin-based fans (bonus + max(1, margin)) replaced show-sized payouts that inflated scores to ~490.
4. Final score Fame x2 -> x1 (fame dominated at ~90/season).
5. Main Stage gated D17 + fame 45 + weeks 10+ + 20%: reachable ~39%, won ~29% of plays.
6. Crew costs raised (30/35/25) so buys compete with entry fees.
7. v4: rerolls + Caffeine removed (beginner approachability). No retune needed: win rate 85%→75%, mean 210→189, reach 39%→27% — all gates still pass, and fail weeks now occur often enough for the morale/van systems to matter. Mitigation is Hype spend + gold die + choice.

## Open for human playtest (cannot sim)
- Van-0 shop spiral feel; fail-state pacing now that fails are common; coop D+1 difficulty; versus Headliner bonus swing; Grind difficulty pressure; sheet resolution time.

# Balance Report — v3 engine (sim-verified)

Policy: near-optimal heuristic (keep-5s reroll, top-2 stage, exact hype spend, merch>flyer>job priority, timed crew buys). Represents skilled play; casual humans should trend 10–20% lower.

## Results
| Seeds | N | Mean | Med | p10 | p90 | Win% | Main played | Main won* | Bankrupt | Mean fame |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10000 | 210.0 | 211 | 173 | 246 | 85.3 | 39.2% | 1125 | 0% | 66.1 |
| 7 | 5000 | 209.9 | 211 | 173 | 246 | 85.3 | 38.7% | 551 | 0% | 66.1 |

*Main-won counts seasons with >=1 Main Stage win (~29% of Main Stage plays).

Rank spread (N=10k): Headliner 1498, Main Stage Bound 4975, Road Dogs 3123, Club Kings 382, Local Opener 22. All ranks reachable, median = Main Stage Bound (thematic target).

## Gates (PRODUCT_SPEC G2): ALL PASS
- Main-stage reach 15–40%: 39% PASS
- Bankruptcy <15%: ~0% PASS
- Mean 150–230: 210 PASS

## Key tuning decisions (v1->v3)
1. Best-2-of-5 averages ~10.2, so D4–D8 table won 100%. Moved to D8–D17 band.
2. Pairs-from-all-dice made songs free (~90%/wk). Songs now use leftover 3 dice (~44%/wk) — creates stage-vs-song tension.
3. Margin-based fans (bonus + max(1, margin)) replaced show-sized payouts that inflated scores to ~490.
4. Final score Fame x2 -> x1 (fame dominated at ~90/season).
5. Main Stage gated D17 + fame 45 + weeks 10+ + 20%: reachable ~39%, won ~29% of plays.
6. Crew costs raised (30/35/25) so buys compete with entry fees.

## Open for human playtest (cannot sim)
- Van-0 shop spiral feel; mercy-caffeine trigger rate; coop D+1 difficulty; versus Headliner bonus swing; Grind difficulty pressure; sheet resolution time.

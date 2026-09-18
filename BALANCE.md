# Balance Report — v5 engine: no rerolls, Fans+Fame scoring (sim-verified)

Policy: near-optimal heuristic (top-2 stage, exact hype spend, merch>flyer>job priority, timed crew buys; no rerolls since v4). Represents skilled play; casual humans should trend 10–20% lower.

## Results
| Seeds | N | Mean | Med | p10 | p90 | Win% | Main played | Main won* | Bankrupt | Mean fame |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 10000 | 141.4 | 142 | 110 | 172 | 74.6 | 26.6% | 540 | 0% | 57.2 |
| 21 | 8000 | 141.6 | 142 | 110 | 172 | 74.6 | 26.3% | 423 | 0% | 57.2 |
| 1 (v7 venues) | 10000 | 143.7 | 144 | 113 | 174 | 75.7 | 24.9% | 558 | 0% | 57.2 |

*Main-won counts seasons with >=1 Main Stage win (~20% of Main Stage plays).

Rank spread (new ranks, N=8k): Headliner 266, Bound 1609, Road Dogs 3116, Club Kings 2245, Opener 692, Basement 72. All six ranks reachable, median = Road Dogs.

## Gates (PRODUCT_SPEC G2): ALL PASS
- Main-stage reach 15–40%: 26% PASS
- Bankruptcy <15%: ~0% PASS
- Mean 110–180: 142 PASS

## Key tuning decisions (v1->v3)
1. Best-2-of-5 averages ~10.2, so D4–D8 table won 100%. Moved to D8–D17 band.
2. Pairs-from-all-dice made songs free (~90%/wk). Songs now use leftover 3 dice (~44%/wk) — creates stage-vs-song tension.
3. Margin-based fans (bonus + max(1, margin)) replaced show-sized payouts that inflated scores to ~490.
4. Final score Fame x2 -> x1 (fame dominated at ~90/season).
5. Main Stage gated D17 + fame 45 + weeks 10+ + 20%: reachable ~39%, won ~29% of plays.
6. Crew costs raised (30/35/25) so buys compete with entry fees.
7. v4: rerolls + Caffeine removed (beginner approachability).
8. v5: scoring cut to Fans + Fame (Cash/5 and Albums×10 dropped; albums still pay out immediately). Ranks recalibrated 185/160/135/110/80 — ideal spread, Headliner genuinely rare (~3% of skilled seasons). No retune needed: win rate 85%→75%, mean 210→189, reach 39%→27% — all gates still pass, and fail weeks now occur often enough for the morale/van systems to matter. Mitigation is Hype spend + gold die + choice.
9. v7: +6 venues (2/tier) inside existing stat bands + Home Crowd safety net (D8, only after 2 straight fails or morale ≤1). No retune needed: mean 141→144, reach 27%→25%, win rate ~76% — all gates still pass. Display-only: hometown venue names, weekend-run framing.

## Open for human playtest (cannot sim)
- Van-0 shop spiral feel; fail-state pacing now that fails are common; coop D+1 difficulty; versus Headliner bonus swing; Grind difficulty pressure; sheet resolution time.

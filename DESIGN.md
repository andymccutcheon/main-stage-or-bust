# MAIN STAGE OR BUST — Roll & Write (1–2 players)
*DIY punk band climb: VFW halls to the main stage. v1.0 lock.*

## 1. Core concept and player experience
You named your band in a garage. Twelve weeks later you are either playing the main stage or breaking up in a parking lot. Each week is one gig: pick from two offers, roll five dice (six with a manager), put two dice on stage and three dice to work (merch table, flyering, day job). Money keeps the van alive; fame unlocks bigger rooms; fans are the score. The tug-of-war: cashing out (merch, day job, cheap safe rooms) vs. swinging for fame (hard rooms, flyering, songwriting) before the season ends at week 12.

## 2. Core gameplay loop (one week, x12)
1. **Road check.** Weeks 4, 7, 10: roll 1d6 on the Road Table. Otherwise nothing.
2. **Get offers.** Draw 2 gig offers (see S3). Pick 1, pay its entry/travel cost. The other is discarded.
3. **Soundcheck roll.** Roll 5 white d6 (+1 gold d6 if Manager hired). Optional: spend Caffeine for rerolls (max 2 passes/week, 1 token each, reroll any subset).
4. **Songwriting check.** After staging (step 5), if your 3 leftover work dice contain a pair, you may check off 1 Song box (once per week max). Staging your best dice competes with keeping a pair — that tension is intentional.
5. **Play the show.** Place any 2 dice on stage. Optional Hype spend (2 Hype = +1 Show, max +2). Compare Show Hype vs venue Difficulty.
6. **Work the room.** Assign each of the 3 leftover dice to Merch, Flyer, or Day Job (see S4).
7. **Get paid / get hurt.** Apply success or fail payouts. Mark Skill stars, check album bonuses, repair via Roadie.
8. **Week end.** Discard offers, reset Hype cap, check Morale/Van fail states, advance week marker.

Forced rest: if Morale is 0 at week start, you skip steps 2–7: gain +$5, +3 Morale, +1 Caffeine.

## 3. Dice / random-input system
- 5x white d6 every week. 1x gold d6 while Manager is employed ($20 hire + $3/week wage, deducted at week start; fire for free anytime).
- 2 reroll passes per week max, each costs 1 Caffeine. Reroll any subset of all dice (gold included).
- Road Table (1d6, weeks 4/7/10): 1 Breakdown (-2 Van, or pay $8 to prevent), 2 Storm (-2 Hype, min 0), 3 Wild crowd (+3 Fans), 4 Merch frenzy (+$6), 5 Local press (+2 Fame), 6 Smooth miles (+1 Caffeine, +1 Morale, max caps).
- Offers: 2 venues drawn from a mixed pool = highest unlocked tier + one tier below (50/50 each card). The Main Stage enters the pool only in weeks 10+, Fame 45+, at 20% replacement chance. Rejected offer is discarded (no penalty).
- Why: 2 offers from a constrained pool = real choice (safe cash vs risky fame) without analysis paralysis; capped rerolls keep luck mitigable but not erasable.

## 4. Player decisions and mitigation
- Offer pick: safe money vs fame reach. Entry costs gate greed.
- Reroll timing: burn Caffeine early for a big room or save it (2 passes max).
- Stage dice: highest pair vs split (a 6 saved for merch can beat two 4s on stage, sometimes).
- Hype spend: convert banked Promo into guaranteed points, max +3/show prevents hoard-then-stomp.
- Work assignment: every leftover die matters (cash now / fans now / van later).
- Song vs cash: pairs tempt you to write instead of selling; albums pay late.
- Crew buys: Roadie (consistency), Tech (power), Manager (extra die at a weekly cost).
- Restock/repair timing with scarce cash.

## 5. Player sheet structure
Tour Log (12 rows: week/venue/D/result/fans/cash/fame) | Fame ladder 0–60 with tier gates (T2 @12, T3 @26, Main Stage pool @45) | Fans box | Cash box | Hype 0–10 | Morale 0–5 | Van 0–6 | Merch stock 0–12 | Caffeine 0–5 | Skill stars (every 3rd success = +1 Skill, max +3) | Songs: 8 boxes in 2 albums of 4 | Crew checkboxes (Roadie/Guitar Tech/Manager) | Week tracker 1–12.

## 6. Venues, scoring, victory
| Venue | Tier | D | Cash | Fame | Fans bonus | Entry |
|---|---|---|---|---|---|---|
| Coffee House | T1 | 8 | 4 | 2 | +1 | $0, +1 Caffeine |
| VFW Hall | T1 | 9 | 6 | 3 | +2 | $0 |
| House Show | T1 | 10 | 8 | 4 | +3 | $0 |
| Record Store | T2 | 10 | 8 | 5 | +3 | $2 |
| Dive Bar | T2 | 11 | 10 | 5 | +4 | $2 |
| College Radio | T2 | 12 | 8 | 6 | +4 | $2 |
| Rock Club | T3 | 13 | 14 | 7 | +6 | $4 |
| Festival Side Stage | T3 | 14 | 12 | 8 | +7 | $4 |
| Main Stage | W | 17 | 20 | 12 | +10 | $6 |

- Show Hype = sum of 2 stage dice + Skill (0–3) + Albums completed (0–2) + Tech (+1) + Hype spent (0–2).
- Success (Hype >= D): full Cash + Fame, Fans = venue bonus + max(1, Show − D margin), +1 Skill star (every 4th star = +1 Skill, max +3). Fail: half Cash rounded down, +0 Fame, +1 Fan, −1 Morale.
- Work dice: Merch die sells min(die, stock) shirts x $2 (Roadie +2 shirts/show free). Flyer: die>=4 gains that many Fans immediately; die>=5 also +1 Hype. Day Job: +$ equal to die; a 6 also repairs +1 Van. Mechanic anytime: $4 = +2 Van. Restock anytime: $1 per 2 shirts (round cost up).
- Song: one pair per week = 1 Song box. Album (4 boxes) = immediate +5 Fame +10 Fans, plus permanent +1 Show Hype each (max +2). Four-of-a-kind on the kept roll = Anthem: +5 Fans +3 Fame immediately (once/week).
- Final Score = Fans + Fame + floor(Cash / 5) + Albums x 10. (Fame x1, not x2: fame is the ladder, fans are the score. Changed after sim showed x2 let fame dominate.)
- Solo/coop ranks (validated in sim, 10k skilled-play seasons: p10=173, med=211, p90=246): <80 Basement Tapes, 80–119 Local Opener, 120–159 Club Kings, 160–199 Road Dogs, 200–239 Main Stage Bound, 240+ Main Stage Headliner. Median skilled season = Main Stage Bound by design; humans trend 10–20% below the heuristic.
- Versus: higher Final Score wins. Weekly twist: higher Show Hype headlines (+3 Fans +$2); loser opens (+1 Fame). Tie: both +1 Fan.

## 7. Solo implementation
Beat-the-rank game on one sheet vs the 12-week clock. Optional computer opponent ("The Stagedivers") for head-to-head practice: rival auto-picks the higher-tier offer, virtual success rate by table (T1 80%, T2 60%, T3 40%, Main 25%), gains venue averages on success / half cash on fail, +weekly fans 6 +/- 3. No upkeep beyond one log line.

## 8. Multiplayer implementation
- Coop (2p, one band): shared sheet, shared resources, 6 dice pool (each player rolls 3, gold added if Manager), joint calls, shared Caffeine. Difficulty +1 to all D (tested tuning lever). Both players must agree on Hype spend and purchases; tie-break: player with the birthday closest to tour start decides.
- Versus (2p, hot-seat): separate sheets, shared offer pair each week (either may take either venue, both may take the same), simultaneous or alternating rolls, compare Show Hype for Headliner bonus. Zero downtime beyond watching one 5-dice roll.
- Tradeoff: shared offers create interaction without take-that rules or extra components.

## 9. Components (physical)
1 sheet per band per season (double-sided: log front, rules back), 5 white d6 + 1 gold d6 per table, 2 pencils, optional 12 venue cards (or 2d6 offer table on sheet back). No tokens needed: Caffeine/Morale/Van/Merch/Hype are boxes to cross off. Dry-erase sleeves supported.

## 10. Balance considerations (sim-verified, see BALANCE.md)
- Best-2-of-5d6 raw: P(>=10)=65%, >=12=20%, >=14=0% (impossible). With keep-5s reroll: >=10=91%, >=12=43%. Difficulties sit in that band: T1 D8–10 (safe starters, poor pay), T2 D10–12 (real tension unbonused), T3 D13–14 (needs engine), Main Stage D17 (needs +5 engine minimum — dice max 12 — a deliberate gate: you cannot walk onto the main stage without skills+songs+crew).
- 10k-season heuristic (near-optimal reroll/stage/hype play): win rate 85%, mean score 210, Main Stage played 39%, won ~29% of those, bankruptcy 0%. Rank spread covers Local Opener to Headliner with median Main Stage Bound.
- Anti-dominant checks: merch turtling cannot pass Fame gates (T3 needs 26); fame rushing bleeds entry fees + breakdowns; Manager ($25+$3/wk) only pays if the gold die flips 2+ shows/season; Hype capped +2/show prevents hoard-then-stomp.
- Known soft spots for human playtest: Van-0 shop-week spiral, coop D+1 feel, versus Headliner swing. Economy is loose for winners by design (bankruptcy <1% skilled); Grind difficulty (start $15, road events from week 2) is the pressure valve.

## 11. Replayability
9 venues, mixed 2-card offers, road events, pair-driven songs, 3 crew builds (consistency/power/engine), 3 modes (solo/coop/versus) + computer opponent + rank chase. Season is 25–40 min solo, 40–60 min 2p.

## 12. Prototype and playtest priorities
P1: season Fame pacing (is the Main Stage reachable ~weeks 10–12 on good play, rare otherwise?). P2: bankruptcy rate on fame-rush vs turtle. P3: rank thresholds vs sim score distribution. P4: coop D+1 difficulty feel. P5: versus Headliner bonus swing. P6: sheet usability (can a player resolve a week in <3 min by week 3?). P7: Manager wage vs value. All P1–P3 must pass sim gates before release; P4–P7 flagged for human playtest.

## 13. Narrative layer & Hype Press (v1.1)
- Band identity (genre/hometown/van name, random defaults) personalizes all copy; no mechanical effect.
- Offline narrative engine (`app/narrative.js`, pure functions, tested): state-aware week intros, per-venue offer color, margin-scaled show reports, road/work/song/album/anthem/hire/rival lines, flyer headlines, end-of-season press quotes.
- Guided play: 6-step "Roadie's clipboard" stepper, each step stating the action AND its career consequence.
- Show-flyer recap modal after every gig: result stamp, deltas, state warnings. This is also where AI copy appears when enabled.
- Hype Press (AI default, `app/press.js` + `api/flavor.js`): Muse Spark 1.3 via OpenRouter through a server-side proxy — key in `OPENROUTER_API_KEY` env, never in the browser. Flavor-only JSON {headline, blurb}, 9s timeout, silent fallback to house zine, sends just band/venue/result words. The engine never reads AI output — rules stay deterministic. Tradeoff accepted: needs network + key on the server; default on, offline fallback.

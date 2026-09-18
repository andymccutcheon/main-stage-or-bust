'use strict';
/* Monte Carlo season sim with heuristic policy. `node sim.js [seeds] [seed0]` */
const E = require('./engine.js');

function playSeason(seed, opts) {
  opts = opts || {};
  const rng = E.mulberry32(seed);
  const game = E.createGame({ mode: 'solo', difficulty: opts.difficulty || 'club', bandNames: ['Sim'] });
  const s = game.sides[0];
  let finalePlayed = 0, finaleWon = 0, wins = 0, shows = 0;
  for (let w = 1; w <= 12; w++) {
    game.week = w;
    E.startWeekUpkeep(game);
    if (s.restNext) { E.forcedRest(game, s); continue; }
    if (s.shopNext) { E.forcedShop(game, s); continue; }
    if (game.grindRoad.includes(w)) E.applyRoadEvent(s, E.rollDie(rng), { payToPrevent: s.cash > 25 });
    const offers = E.drawOffers(game, 0, rng);
    // pick: best fame value affordable-ish
    const scored = offers.map(v => ({ v, score: v.fame * 2 + v.cash - v.entry * 1.5 }));
    scored.sort((a, b) => b.score - a.score);
    let venue = scored[0].v;
    if (s.cash < venue.entry && s.cash >= scored[1].v.entry) venue = scored[1].v;
    const dice = E.rollDice(s.crew.manager ? 6 : 5, rng);
    const bonus = s.skill + s.albums + (s.crew.tech ? 1 : 0);
    E.checkAnthem(s, dice, w);
    const sorted0 = dice.slice().sort((a, b) => b - a);
    const stage0 = [sorted0[0], sorted0[1]];
    const rest0 = sorted0.slice(2);
    E.checkSong(s, rest0, w);
    const sorted = sorted0, stage = stage0, rest = rest0;
    const short = (venue.D + game.coopBump) - (stage[0] + stage[1] + bonus);
    const spend = short > 0 ? Math.min(2, Math.floor(s.hype / 2), short) : 0;
    const rec = E.resolveShow(game, s, venue.id, stage, spend);
    shows++; if (rec.result === 'win') wins++;
    if (venue.id === 'warped') { finalePlayed++; if (rec.result === 'win') finaleWon++; }
    for (const d of rest) {
      if (s.merch > 0 && d >= 3) E.resolveWorkDie(s, d, 'merch');
      else if (d >= 4) E.resolveWorkDie(s, d, 'flyer');
      else E.resolveWorkDie(s, d, 'job');
    }
    // economy
    try { if (s.van <= 2 && s.cash >= 8) E.mechanic(s); } catch (e) {}
    try { if (s.merch <= 2 && s.cash >= 6) E.restock(s, 6); } catch (e) {}
    try { if (!s.crew.roadie && w >= 4 && s.cash >= 45) E.buyCrew(s, 'roadie'); } catch (e) {}
    try { if (!s.crew.tech && w >= 6 && s.cash >= 50) E.buyCrew(s, 'tech'); } catch (e) {}
    try { if (!s.crew.manager && w >= 5 && s.fame >= 15 && s.cash >= 40) E.buyCrew(s, 'manager'); } catch (e) {}
    const bad = E.validateSide(s);
    if (bad.length) throw new Error('invalid side wk' + w + ': ' + bad.join(','));
  }
  const score = E.finalScore(s);
  return { score, rank: E.rankFor(score), fame: s.fame, fans: s.fans, cash: s.cash, albums: s.albums, finalePlayed, finaleWon, winRate: shows ? wins / shows : 0, bankrupt: s.cash < 0 };
}

function main() {
  const N = parseInt(process.argv[2] || '10000', 10);
  const seed0 = parseInt(process.argv[3] || '1', 10);
  const scores = [], ranks = {};
  let finale = 0, finaleW = 0, bankrupt = 0, fameSum = 0, winSum = 0;
  for (let i = 0; i < N; i++) {
    const r = playSeason(seed0 + i);
    scores.push(r.score);
    ranks[r.rank] = (ranks[r.rank] || 0) + 1;
    if (r.finalePlayed) finale++;
    finaleW += r.finaleWon; fameSum += r.fame; winSum += r.winRate;
    if (r.bankrupt) bankrupt++;
  }
  scores.sort((a, b) => a - b);
  const mean = scores.reduce((a, b) => a + b, 0) / N;
  const med = scores[Math.floor(N / 2)];
  const p10 = scores[Math.floor(N * 0.1)], p90 = scores[Math.floor(N * 0.9)];
  console.log(JSON.stringify({ N, mean: +mean.toFixed(1), med, p10, p90, finaleReach: +(finale / N * 100).toFixed(1), finaleWins: finaleW, bankruptPct: +(bankrupt / N * 100).toFixed(1), meanFame: +(fameSum / N).toFixed(1), meanWinRate: +(winSum / N * 100).toFixed(1), ranks }, null, 1));
  const gates = {
    finaleReach_15_40: finale / N >= 0.15 && finale / N <= 0.40,
    bankrupt_lt15: bankrupt / N < 0.15,
    mean_110_180: mean >= 110 && mean <= 180,
  };
  console.log('GATES ' + JSON.stringify(gates));
  const fail = Object.values(gates).some(v => !v);
  if (fail) process.exitCode = 2;
}
if (require.main === module) main();
module.exports = { playSeason };

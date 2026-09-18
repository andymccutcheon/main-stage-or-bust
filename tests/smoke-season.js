'use strict';
// Scripted 12-week seasons through the ENGINE mirroring UI flow, all modes.
const assert = require('node:assert/strict');
const E = require('../app/engine.js');

function playSideWeek(g, si, rng, diceN) {
  const s = g.sides[si];
  if (s.restNext) { E.forcedRest(g, s); return null; }
  if (s.shopNext) { E.forcedShop(g, s); return null; }
  if (g.grindRoad.includes(g.week)) E.applyRoadEvent(s, E.rollDie(rng), { payToPrevent: s.cash > 25 });
  const offers = E.drawOffers(g, si, rng);
  offers.sort((a, b) => (b.fame * 2 + b.cash - b.entry) - (a.fame * 2 + a.cash - a.entry));
  const venue = (s.cash >= offers[0].entry ? offers[0] : offers[1]);
  const dice = E.rollDice(diceN || (s.crew.manager ? 6 : 5), rng);
  E.checkAnthem(s, dice, 999 + g.week);
  const sorted = dice.slice().sort((a, b) => b - a);
  const short = (venue.D + (g.coopBump || 0)) - (sorted[0] + sorted[1] + s.skill + s.albums + (s.crew.tech ? 1 : 0));
  const spend = short > 0 ? Math.min(2, Math.floor(s.hype / 2), short) : 0;
  const rec = E.resolveShow(g, s, venue.id, [sorted[0], sorted[1]], spend);
  const rest = sorted.slice(2);
  E.checkSong(s, rest, g.week);
  for (const d of rest) {
    if (s.merch > 0 && d >= 3) E.resolveWorkDie(s, d, 'merch');
    else if (d >= 4) E.resolveWorkDie(s, d, 'flyer');
    else E.resolveWorkDie(s, d, 'job');
  }
  try { if (!s.crew.roadie && g.week >= 4 && s.cash >= 45) E.buyCrew(s, 'roadie'); } catch (e) {}
  try { if (!s.crew.tech && g.week >= 6 && s.cash >= 50) E.buyCrew(s, 'tech'); } catch (e) {}
  try { if (!s.crew.manager && g.week >= 5 && s.fame >= 15 && s.cash >= 40) E.buyCrew(s, 'manager'); } catch (e) {}
  try { if (s.van <= 2 && s.cash >= 8) E.mechanic(s); } catch (e) {}
  try { if (s.merch <= 2 && s.cash >= 6) E.restock(s, 6); } catch (e) {}
  assert.deepEqual(E.validateSide(s), []);
  return rec;
}

function season(mode, seed, names) {
  const rng = E.mulberry32(seed);
  const g = E.createGame({ mode, bandNames: names });
  const rival = mode === 'rival' ? { fame: 0, fans: 0, cash: 20 } : null;
  if (mode === 'rival') g.mode = 'solo';
  for (let w = 1; w <= 12; w++) {
    g.week = w;
    E.startWeekUpkeep(g);
    if (mode === 'versus') {
      const r0 = playSideWeek(g, 0, rng);
      const r1 = playSideWeek(g, 1, rng);
      if (r0 && r1) E.applyHeadliner(g, 0, 1, r0.show, r1.show);
    } else if (mode === 'coop') {
      playSideWeek(g, 0, rng, g.sides[0].crew.manager ? 7 : 6);
    } else {
      playSideWeek(g, 0, rng);
      if (rival) E.rivalTurn(rival, w, rng);
    }
  }
  return { g, rival };
}

for (const [mode, names] of [['solo', ['A']], ['coop', ['A']], ['versus', ['A', 'B']], ['rival', ['A']]]) {
  const { g, rival } = season(mode, 42, names);
  for (const s of g.sides) {
    assert.equal(s.results.length, 12, `${mode}: 12 week records`);
    const sc = E.finalScore(s);
    assert.ok(sc > 0 && sc < 600, `${mode}: sane score ${sc}`);
    assert.ok(E.rankFor(sc).length > 3);
  }
  if (rival) assert.ok(rival.fans > 0, 'rival scored');
  console.log(`mode=${mode} scores=`, g.sides.map(s => `${s.name}:${E.finalScore(s)}`).join(' '), rival ? `rival:${rival.fans + rival.fame}` : '');
}
// grind + basement difficulties complete too
for (const d of ['basement', 'grind']) {
  const rng = E.mulberry32(5);
  const g = E.createGame({ mode: 'solo', difficulty: d, bandNames: ['X'] });
  for (let w = 1; w <= 12; w++) { g.week = w; E.startWeekUpkeep(g); playSideWeek(g, 0, rng); }
  console.log(`difficulty=${d} score=${E.finalScore(g.sides[0])}`);
}
console.log('SMOKE OK');

'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('./engine.js');

test('success payout: rock club', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  const r = E.resolveShow(g, s, 'dive', [5, 6], 0); // show=11 >= D11
  assert.equal(r.result, 'win');
  assert.equal(s.cash, 20 - 2 + 10);
  assert.equal(s.fame, 5);
  assert.equal(s.fans, 4 + 1); // bonus + margin(max 1)
  assert.equal(s.stars, 1);
});

test('fail payout halves cash, cuts morale', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  const r = E.resolveShow(g, s, 'rock', [1, 1], 0); // show=2 < 13
  assert.equal(r.result, 'fail');
  assert.equal(s.cash, 20 - 4 + 7);
  assert.equal(s.fame, 0);
  assert.equal(s.fans, 1);
  assert.equal(s.morale, 4);
});

test('hype spend adds show and drains pool', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0]; s.hype = 6;
  const r = E.resolveShow(g, s, 'dive', [4, 5], 2); // 9+0+0+0+2=11 >= 11
  assert.equal(r.result, 'win');
  assert.equal(s.hype, 2);
  assert.throws(() => E.resolveShow(g, s, 'dive', [3, 3], 4), /hype spend/);
});

test('skill + album + tech stack', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  s.skill = 2; s.albums = 1; s.crew.tech = true;
  const r = E.resolveShow(g, s, 'warped', [2, 2], 0); // 4+2+1+1=8 <17 fail
  assert.equal(r.result, 'fail');
  const s2 = E.createSide('x'); s2.skill = 3; s2.albums = 2; s2.crew.tech = true;
  const g2 = E.createGame({ mode: 'solo' }); g2.sides[0] = s2;
  const r2 = E.resolveShow(g2, s2, 'warped', [6, 6], 0); // 12+3+2+1=18 win
  assert.equal(r2.result, 'win');
});

test('skill grows every 3 stars, capped', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  for (let i = 0; i < 10; i++) E.resolveShow(g, s, 'coffee', [5, 5], 0); // 10>=D8
  assert.equal(s.skill, 2);
});

test('coffee house grants hype', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0]; s.hype = 0;
  E.resolveShow(g, s, 'coffee', [1, 1], 0);
  assert.equal(s.hype, 1);
});

test('merch work respects stock; roadie adds free shirts', () => {
  const s = E.createSide('m'); s.merch = 3;
  const r = E.resolveWorkDie(s, 6, 'merch');
  assert.equal(r.cash, 6); assert.equal(s.merch, 0); assert.equal(s.cash, 20 + 6);
  const s2 = E.createSide('m2'); s2.merch = 0; s2.crew.roadie = true;
  const r2 = E.resolveWorkDie(s2, 6, 'merch');
  assert.equal(r2.cash, 4); assert.equal(s2.merch, 0);
});

test('flyer thresholds; job repairs on 6', () => {
  const s = E.createSide('f');
  E.resolveWorkDie(s, 3, 'flyer'); assert.equal(s.fans, 0); assert.equal(s.hype, 0);
  E.resolveWorkDie(s, 4, 'flyer'); assert.equal(s.fans, 4);
  E.resolveWorkDie(s, 5, 'flyer'); assert.equal(s.fans, 9); assert.equal(s.hype, 1);
  const j = E.createSide('j'); j.van = 4;
  E.resolveWorkDie(j, 6, 'job'); assert.equal(j.cash, 26); assert.equal(j.van, 5);
});

test('songs: pair per week, album bonus, cap 8', () => {
  const s = E.createSide('s');
  assert.equal(E.checkSong(s, [1, 2, 3, 4, 5], 1), false);
  assert.equal(E.checkSong(s, [4, 4, 1, 2, 3], 1), 'song');
  assert.equal(E.checkSong(s, [5, 5, 1, 2, 3], 1), false); // once per week
  E.checkSong(s, [5, 5, 1, 2, 3], 2); E.checkSong(s, [6, 6, 1, 2, 3], 3);
  const r = E.checkSong(s, [2, 2, 1, 3, 4], 4);
  assert.equal(r, 'album'); assert.equal(s.albums, 1);
  assert.equal(s.fame, 5); assert.equal(s.fans, 10);
});

test('anthem once per week', () => {
  const s = E.createSide('a');
  assert.equal(E.checkAnthem(s, [6, 6, 6, 6, 2], 1), true);
  assert.equal(E.checkAnthem(s, [6, 6, 6, 6, 2], 1), false);
  assert.equal(s.fans, 5); assert.equal(s.fame, 3);
});

test('road events all apply', () => {
  const s = E.createSide('r');
  E.applyRoadEvent(s, 1, {}); assert.equal(s.van, 4);
  E.applyRoadEvent(s, 2, {}); assert.equal(s.hype, 0);
  E.applyRoadEvent(s, 3, {}); assert.equal(s.fans, 3);
  E.applyRoadEvent(s, 4, {}); assert.equal(s.cash, 26);
  E.applyRoadEvent(s, 5, {}); assert.equal(s.fame, 2);
  E.applyRoadEvent(s, 6, {}); assert.equal(s.cash, 29); assert.equal(s.morale, 5);
  const rich = E.createSide('rich'); rich.cash = 50;
  assert.equal(E.applyRoadEvent(rich, 1, { payToPrevent: true }), 'breakdown-avoided');
  assert.equal(rich.van, 6); assert.equal(rich.cash, 42);
});

test('crew purchases and errors', () => {
  const s = E.createSide('c'); s.cash = 100;
  E.buyCrew(s, 'roadie'); E.buyCrew(s, 'tech'); E.buyCrew(s, 'manager');
  assert.equal(s.cash, 100 - 30 - 35 - 25);
  assert.throws(() => E.buyCrew(s, 'roadie'), /already/);
  const poor = E.createSide('p');
  assert.throws(() => E.buyCrew(poor, 'tech'), /need/);
});

test('manager wage deducted weekly', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0]; s.cash = 50; s.crew.manager = true;
  E.startWeekUpkeep(g);
  assert.equal(s.cash, 47);
});

test('morale 0 forces rest; van 0 forces shop', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  s.morale = 1;
  E.resolveShow(g, s, 'warped', [1, 1], 0);
  assert.equal(s.restNext, true);
  E.forcedRest(g, s);
  assert.equal(s.morale, 3); assert.equal(s.cash, 20 - 6 + 10 + 5);
  const v = E.createSide('v'); v.van = 1;
  E.applyRoadEvent(v, 1, {});
  assert.equal(v.shopNext, true);
});

test('offers gate tiers and main stage', () => {
  const g = E.createGame({ mode: 'solo' });
  g.week = 3; g.sides[0].fame = 0;
  for (let i = 0; i < 50; i++) {
    for (const o of E.drawOffers(g, 0, E.mulberry32(i))) assert.ok(['coffee', 'vfw', 'house', 'laundry', 'pizza'].includes(o.id));
  }
  g.week = 11; g.sides[0].fame = 45;
  let sawWarped = false;
  for (let i = 0; i < 200; i++) {
    if (E.drawOffers(g, 0, E.mulberry32(1000 + i)).some(o => o.id === 'warped')) { sawWarped = true; break; }
  }
  assert.ok(sawWarped);
  g.week = 5; g.sides[0].fame = 60;
  for (let i = 0; i < 50; i++) {
    assert.ok(!E.drawOffers(g, 0, E.mulberry32(i)).some(o => o.id === 'warped'));
  }
});

test('home crowd only after struggle', () => {
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  assert.equal(E.needsHomeCrowd(s), false);
  s.results.push({ week: 1, venue: 'vfw', result: 'fail' });
  assert.equal(E.needsHomeCrowd(s), false);
  s.results.push({ week: 2, venue: 'house', result: 'fail' });
  assert.equal(E.needsHomeCrowd(s), true);
  s.morale = 5; s.results.push({ week: 3, venue: 'vfw', result: 'win' });
  assert.equal(E.needsHomeCrowd(s), false);
  s.morale = 1;
  assert.equal(E.needsHomeCrowd(s), true);
  // healthy band never sees it in 200 draws
  const h = E.createGame({ mode: 'solo' });
  let sawHome = false;
  for (let i = 0; i < 200; i++) {
    if (E.drawOffers(h, 0, E.mulberry32(i)).some(o => o.id === 'home')) { sawHome = true; break; }
  }
  assert.equal(sawHome, false);
});

test('final score and ranks', () => {
  const s = E.createSide('s'); s.fans = 100; s.fame = 30; s.cash = 23; s.albums = 1;
  assert.equal(E.finalScore(s), 130);
  assert.equal(E.rankFor(250), 'Main Stage Headliner');
  assert.equal(E.rankFor(10), 'Basement Tapes');
});

test('versus headliner bonuses', () => {
  const g = E.createGame({ mode: 'versus', bandNames: ['A', 'B'] });
  const w = E.applyHeadliner(g, 0, 1, 9, 7);
  assert.equal(w, 'A');
  assert.equal(g.sides[0].fans, 3); assert.equal(g.sides[0].cash, 22);
  assert.equal(g.sides[1].fame, 1);
});

test('rival turn invariants', () => {
  const rival = { fame: 0, fans: 0, cash: 20 };
  for (let i = 0; i < 100; i++) {
    const r = E.rivalTurn(rival, 5, E.mulberry32(i));
    assert.ok(r.venue); assert.ok(['win', 'fail'].includes(r.result));
  }
  assert.ok(rival.fans > 0 && rival.cash > 20);
});

test('12-week fuzz: caps hold, no NaN', () => {
  const rng = E.mulberry32(7);
  const g = E.createGame({ mode: 'solo' });
  const s = g.sides[0];
  for (let w = 1; w <= 12; w++) {
    g.week = w;
    E.startWeekUpkeep(g);
    if (s.restNext) { E.forcedRest(g, s); continue; }
    if (s.shopNext) { E.forcedShop(g, s); continue; }
    if ([4, 7, 10].includes(w)) E.applyRoadEvent(s, E.rollDie(rng), { payToPrevent: s.cash > 25 });
    const offers = E.drawOffers(g, 0, rng);
    const v = offers[0];
    const dice = E.rollDice(s.crew.manager ? 6 : 5, rng);
    E.checkSong(s, dice, w); E.checkAnthem(s, dice, w);
    const sorted = dice.slice().sort((a, b) => b - a);
    const spend = s.hype >= 4 ? 2 : 0;
    E.resolveShow(g, s, v.id, [sorted[0], sorted[1]], spend);
    const rest = sorted.slice(2);
    const acts = ['merch', 'flyer', 'job'];
    rest.forEach((d, i) => E.resolveWorkDie(s, d, acts[i % 3]));
    assert.deepEqual(E.validateSide(s), []);
  }
});

test('coop bump raises difficulty', () => {
  const g = E.createGame({ mode: 'coop', bandNames: ['A', 'B'] });
  assert.equal(g.coopBump, 1);
  const s = g.sides[0];
  const r = E.resolveShow(g, s, 'vfw', [2, 2], 0); // 4 < 5+1 fail
  assert.equal(r.result, 'fail');
});

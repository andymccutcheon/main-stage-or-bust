'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../app/engine.js');
const N = require('../app/narrative.js');

const mkSide = (over) => Object.assign(E.createSide('The Paper Cuts'), { flavor: { genre: 'emo', hometown: 'Gainesville', van: 'Bertha' } }, over);
const rng = (seed) => E.mulberry32(seed);

test('deterministic with seed', () => {
  const s = mkSide();
  assert.equal(N.weekIntro({ week: 3 }, s, rng(9)), N.weekIntro({ week: 3 }, s, rng(9)));
  assert.equal(N.showFlavor({ result: 'win', show: 12, D: 9 }, { name: 'X' }, s, rng(4)), N.showFlavor({ result: 'win', show: 12, D: 9 }, { name: 'X' }, s, rng(4)));
});

test('every venue + road roll + hire has flavor', () => {
  for (const v of E.VENUES) assert.ok(N.offerFlavor(v.id, rng(1)).length > 10, v.id);
  for (let roll = 1; roll <= 6; roll++) assert.ok(N.roadFlavor(roll, false, mkSide(), rng(2)).length > 10);
  assert.ok(N.roadFlavor(1, true, mkSide(), rng(2)).includes('$8'));
  for (const c of ['roadie', 'tech', 'manager']) assert.ok(N.hireFlavor(c, rng(3)).length > 5);
});

test('week intro reacts to state', () => {
  const w1 = N.weekIntro({ week: 1 }, mkSide(), rng(1));
  assert.match(w1, /Twelve weeks|First week/);
  assert.match(N.weekIntro({ week: 12 }, mkSide(), rng(1)), /Last week/);
  assert.match(N.weekIntro({ week: 5 }, mkSide({ morale: 1 }), rng(1)), /Morale/);
  assert.match(N.weekIntro({ week: 5 }, mkSide({ van: 1 }), rng(1)), /Bertha/);
  assert.match(N.weekIntro({ week: 5 }, mkSide({ cash: 2 }), rng(1)), /\$2/);
  assert.match(N.weekIntro({ week: 5 }, mkSide({ fame: 50 }), rng(1)), /shirt/i);
});

test('show flavor scales with margin', () => {
  const s = mkSide();
  const blowout = N.showFlavor({ result: 'win', show: 16, D: 9 }, { name: 'V' }, s, rng(1));
  const close = N.showFlavor({ result: 'fail', show: 8, D: 9 }, { name: 'V' }, s, rng(1));
  const wreck = N.showFlavor({ result: 'fail', show: 2, D: 12 }, { name: 'V' }, s, rng(1));
  assert.notEqual(blowout, close);
  assert.match(wreck, /Trainwreck|highway wins/);
});

test('work/song/album/anthem copy', () => {
  const s = mkSide();
  assert.ok(N.workFlavor('merch', 6, { cash: 12 }, s, rng(1)).length > 5);
  assert.ok(N.workFlavor('merch', 2, { cash: 0 }, s, rng(1)).length > 5);
  assert.ok(N.workFlavor('job', 6, {}, s, rng(1)).includes('Bertha'));
  assert.ok(N.songFlavor(1, rng(1)).includes('"'));
  assert.ok(N.albumFlavor().includes('ALBUM'));
  assert.ok(N.anthemFlavor(rng(1)).length > 10);
});

test('flyer copy schema + warnings', () => {
  const s = mkSide();
  const f = N.flyerCopy({ result: 'win', show: 12, D: 9 }, { name: 'VFW' }, s, rng(1));
  assert.ok(f.headline.length > 5 && f.headline.length < 90);
  assert.ok(f.blurb.length > 20);
  const w = N.stateWarnings(mkSide({ morale: 1, van: 1, cash: 0, songs: 3, fame: 44 }));
  assert.ok(w.length >= 4);
  assert.deepEqual(N.stateWarnings(mkSide({ morale: 5, van: 6, cash: 50, songs: 0, fame: 5 })), []);
});

test('press + rival + identity', () => {
  const s = mkSide();
  assert.ok(N.pressQuote(s, 'Road Dogs', rng(1)).includes('Road Dogs'));
  assert.ok(N.bandTag(s).includes('emo'));
  assert.ok(N.rivalFlavor({}, { result: 'win' }, { name: 'V' }, rng(1)).length > 5);
});

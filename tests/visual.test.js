'use strict';
const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const E = require('../app/engine.js');
global.VENUE_BY_ID = E.VENUE_BY_ID;
const Mp = require('../app/visual/map.js');
const St = require('../app/visual/stage.js');
const Spr = require('../app/visual/sprites.js');

describe('mapState (pure, §5)', () => {
  it('stop index = week-1 clamped 0..11', () => {
    const g = E.createGame({ mode: 'solo' });
    g.week = 1; assert.equal(Mp.mapState(g, 0).stopIndex, 0);
    g.week = 7; assert.equal(Mp.mapState(g, 0).stopIndex, 6);
    g.week = 12; assert.equal(Mp.mapState(g, 0).stopIndex, 11);
  });
  it('gate predicate: fame>=45 && week>=10', () => {
    const g = E.createGame({ mode: 'solo' });
    g.week = 9; g.sides[0].fame = 50;
    assert.equal(Mp.mapState(g, 0).gatesOpen, false);
    g.week = 10; g.sides[0].fame = 44;
    assert.equal(Mp.mapState(g, 0).gatesOpen, false);
    g.sides[0].fame = 45;
    assert.equal(Mp.mapState(g, 0).gatesOpen, true);
  });
  it('zones are DATA (12 hit-areas, never pixels)', () => {
    const pts = Mp.stopPoints(480, 360);
    assert.equal(pts.length, 12);
  });
});

describe('stageState (pure, §5)', () => {
  it('crowd formula min(64, 4+floor(fans/4))', () => {
    const g = E.createGame({ mode: 'solo' });
    g.sides[0].fans = 0;
    assert.equal(St.stageState(g, 0, null).crowdN, 4);
    g.sides[0].fans = 20;
    assert.equal(St.stageState(g, 0, null).crowdN, 9);
    g.sides[0].fans = 1000;
    assert.equal(St.stageState(g, 0, null).crowdN, 64);
  });
  it('verdict mapping win/fail/none', () => {
    const g = E.createGame({ mode: 'solo' });
    assert.equal(St.stageState(g, 0, { venue: 'vfw', result: 'win', show: 10, D: 9 }).verdict, 'win');
    assert.equal(St.stageState(g, 0, { venue: 'vfw', result: 'fail', show: 5, D: 9 }).verdict, 'fail');
    assert.equal(St.stageState(g, 0, null).verdict, 'none');
  });
  it('morale<=1 slumps band', () => {
    const g = E.createGame({ mode: 'solo' });
    g.sides[0].morale = 1;
    assert.equal(St.stageState(g, 0, null).moralePose, 'slump');
    g.sides[0].morale = 5;
    assert.equal(St.stageState(g, 0, null).moralePose, 'idle');
  });
});

describe('vans + versus', () => {
  it("vanVariant thresholds 6..0", () => {
    assert.equal(Mp.vanVariant(6), 'pristine');
    assert.equal(Mp.vanVariant(5), 'pristine');
    assert.equal(Mp.vanVariant(4), 'dented');
    assert.equal(Mp.vanVariant(3), 'dented');
    assert.equal(Mp.vanVariant(2), 'smoking');
    assert.equal(Mp.vanVariant(1), 'smoking');
    assert.equal(Mp.vanVariant(0), 'wreck');
  });
  it('versus side 2 gets away kit', () => {
    const g = E.createGame({ mode: 'versus', bandNames: ['A', 'B'] });
    assert.equal(St.stageState(g, 0, null).away, false);
    assert.equal(St.stageState(g, 1, null).away, true);
    assert.equal(St.stageState(E.createGame({ mode: 'solo' }), 0, null).away, false);
  });
});

describe('sprites QC (§9.2)', () => {
  it('anchors locked, 16x16 grids', () => {
    assert.deepEqual(Spr.audit(), []);
    assert.equal(Spr.SCALE.van, 3);
    assert.equal(Spr.GROUND_ROW, 14);
  });
});

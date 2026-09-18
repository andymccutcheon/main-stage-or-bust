'use strict';
/* MAIN STAGE OR BUST — shared rules engine (no DOM, no deps). v1.0. */

const VENUES = [
  { id: 'coffee',  name: 'Coffee House',        tier: 1, D: 8,  cash: 4,  fame: 2, fansBonus: 1, entry: 0, hype: true, blurb: 'Free lattes. Wired crowd. +1 Hype.' },
  { id: 'vfw',     name: 'VFW Hall',            tier: 1, D: 9,  cash: 6,  fame: 3, fansBonus: 2, entry: 0 },
  { id: 'house',   name: 'House Show',          tier: 1, D: 10,  cash: 8,  fame: 4, fansBonus: 3, entry: 0 },
  { id: 'record',  name: 'Record Store',        tier: 2, D: 10,  cash: 8,  fame: 5, fansBonus: 3, entry: 2 },
  { id: 'dive',    name: 'Dive Bar',            tier: 2, D: 11,  cash: 10, fame: 5, fansBonus: 4, entry: 2 },
  { id: 'college', name: 'College Radio',       tier: 2, D: 12,  cash: 6,  fame: 6, fansBonus: 4, entry: 2 },
  { id: 'laundry', name: 'Laundromat',          tier: 1, D: 8,  cash: 5,  fame: 2, fansBonus: 1, entry: 0, blurb: 'Spin cycle acoustics. Captive audience.' },
  { id: 'pizza',   name: 'Pizza Parlor',          tier: 1, D: 10, cash: 9,  fame: 4, fansBonus: 3, entry: 0, blurb: 'Free slices for the band. Greasy strings.' },
  { id: 'bowling', name: 'Bowling Alley',         tier: 2, D: 11, cash: 11, fame: 5, fansBonus: 4, entry: 2, blurb: 'League night crowd. Loud between frames.' },
  { id: 'community', name: 'Community College',  tier: 2, D: 12, cash: 7,  fame: 6, fansBonus: 5, entry: 2, blurb: 'Student union believers + one dean.' },
  { id: 'drivein', name: 'Drive-In',              tier: 3, D: 13, cash: 15, fame: 7, fansBonus: 6, entry: 4, blurb: 'Honk if you love us. They honk.' },
  { id: 'fair',    name: 'County Fair',           tier: 3, D: 14, cash: 13, fame: 8, fansBonus: 8, entry: 4, blurb: 'Fried everything. Main-stage adjacent.' },
  { id: 'home',    name: 'Home Crowd',            tier: 1, D: 8,  cash: 5,  fame: 2, fansBonus: 2, entry: 0, blurb: 'Friendly faces. Forgiving room.' },
  { id: 'rock',    name: 'Rock Club',           tier: 3, D: 14,  cash: 14, fame: 8, fansBonus: 6, entry: 4 },
  { id: 'fest',    name: 'Festival Side Stage', tier: 3, D: 14, cash: 12, fame: 8, fansBonus: 7, entry: 4 },
  { id: 'warped',  name: 'Main Stage',   tier: 4, D: 17, cash: 20, fame: 12, fansBonus: 10, entry: 6 },
];
const VENUE_BY_ID = Object.fromEntries(VENUES.map(v => [v.id, v]));
const CAPS = { hype: 10, morale: 5, van: 6, merch: 12, skill: 3 };
const COSTS = { roadie: 30, tech: 35, managerHire: 25, managerWage: 3, mechanic: 4 };
const RANKS = [
  [185, 'Main Stage Headliner'], [160, 'Main Stage Bound'], [135, 'Road Dogs'],
  [110, 'Club Kings'], [80, 'Local Opener'], [-Infinity, 'Basement Tapes'],
];
const ROAD_WEEKS = [4, 7, 10];
const SEASON_WEEKS = 12;

function mulberry32(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rollDie(rng) { return 1 + Math.floor((rng || Math.random)() * 6); }
function rollDice(n, rng) { const d = []; for (let i = 0; i < n; i++) d.push(rollDie(rng)); return d; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function tierOf(fame) { return fame >= 26 ? 3 : fame >= 12 ? 2 : 1; }
function venueById(id) { const v = VENUE_BY_ID[id]; if (!v) throw new Error('unknown venue ' + id); return v; }

function hasPair(dice) {
  const c = {};
  for (const d of dice) { c[d] = (c[d] || 0) + 1; if (c[d] >= 2) return true; }
  return false;
}
function isAnthem(dice) {
  const c = {};
  for (const d of dice) { c[d] = (c[d] || 0) + 1; if (c[d] >= 4) return true; }
  return false;
}

function createSide(name, difficulty) {
  const bonus = difficulty === 'basement';
  return {
    name: name || 'Your Band',
    cash: bonus ? 25 : 20, fans: 0, fame: 0,
    hype: 0, morale: 5, van: 6, merch: 6,
    stars: 0, skill: 0,
    songs: 0, albums: 0, songUsedWeek: 0, anthemWeek: 0,
    crew: { roadie: false, tech: false, manager: false },
    restNext: false, shopNext: false, results: [],
  };
}

function createGame(opts) {
  opts = opts || {};
  const mode = opts.mode || 'solo';
  const difficulty = opts.difficulty || 'club';
  const names = opts.bandNames || (mode === 'versus' ? ['Band A', 'Band B'] : ['Your Band']);
  const game = {
    mode, difficulty, week: 1, over: false,
    coopBump: mode === 'coop' ? 1 : 0,
    grindRoad: difficulty === 'grind' ? [2, 4, 7, 10] : ROAD_WEEKS,
    sides: mode === 'solo' ? [createSide(names[0], difficulty)] : names.map(n => createSide(n, difficulty)),
    offers: [], log: [],
  };
  if (difficulty === 'grind') game.sides.forEach(s => { s.cash = 15; });
  return game;
}

function offerPool(fame) {
  const t = tierOf(fame);
  const noHome = VENUES.filter(v => v.id !== 'home');
  if (t <= 1) return noHome.filter(v => v.tier === 1);
  return noHome.filter(v => v.tier === t || v.tier === t - 1);
}
function needsHomeCrowd(side) {
  // Soft landing: two straight fails at the tail, or morale in the ditch.
  const r = side.results || [];
  if (side.morale <= 1) return true;
  if (r.length < 2) return false;
  const tail = r.slice(-2).filter(x => x.venue !== 'REST' && x.venue !== 'SHOP');
  return tail.length === 2 && tail.every(x => x.result === 'fail');
}

function drawOffers(game, sideIdx, rng) {
  const side = game.sides[sideIdx || 0];
  const pool = offerPool(side.fame);
  const r = rng || Math.random;
  const pick = () => pool[Math.floor(r() * pool.length)];
  let a = pick(), b = pick();
  let guard = 0;
  while (b.id === a.id && guard++ < 10) b = pick();
  let offers = [a.id, b.id];
  if (needsHomeCrowd(side) && r() < 0.5) {
    offers[Math.floor(r() * 2)] = 'home';
  } else if (game.week >= 10 && side.fame >= 45 && r() < 0.2) {
    offers[Math.floor(r() * 2)] = 'warped';
  }
  game.offers = offers.slice();
  return offers.map(venueById);
}

function startWeekUpkeep(game) {
  const notes = [];
  for (const s of game.sides) {
    if (s.crew.manager) { s.cash -= COSTS.managerWage; notes.push(s.name + ' pays manager $' + COSTS.managerWage); }
    if (s.crew.roadie) { const before = s.van; s.van = clamp(s.van + 1, 0, CAPS.van); if (s.van !== before) notes.push(s.name + ' roadie patches van (+1)'); }
    s.songUsedWeek = 0; s.anthemWeek = 0;
  }
  return notes;
}

function forcedRest(game, side) {
  side.cash += 5;
  side.morale = clamp(side.morale + 3, 0, CAPS.morale);
  side.restNext = false;
  side.results.push({ week: game.week, venue: 'REST', result: 'rest' });
}
function forcedShop(game, side) {
  side.cash -= COSTS.mechanic;
  side.van = clamp(side.van + 3, 0, CAPS.van);
  side.shopNext = false;
  side.results.push({ week: game.week, venue: 'SHOP', result: 'shop' });
}

/* Songwriting uses the 3 leftover (work) dice only: staging the best dice
   competes with keeping a pair. Anthem uses all kept dice. */
function checkSong(side, dice, week) {
  if (side.songUsedWeek === week) return false;
  if (side.songs >= 8) return false;
  if (!hasPair(dice)) return false;
  side.songUsedWeek = week;
  side.songs += 1;
  if (side.songs === 4 || side.songs === 8) {
    side.albums = Math.min(2, side.albums + 1);
    side.fame += 5; side.fans += 10;
    return 'album';
  }
  return 'song';
}
function checkAnthem(side, dice, week) {
  if (side.anthemWeek === week) return false;
  if (!isAnthem(dice)) return false;
  side.anthemWeek = week;
  side.fans += 5; side.fame += 3;
  return true;
}

function resolveShow(game, side, venueId, stageDice, hypeSpend) {
  const venue = venueById(venueId);
  hypeSpend = hypeSpend || 0;
  if (stageDice.length !== 2) throw new Error('stage needs exactly 2 dice');
  if (hypeSpend < 0 || hypeSpend > 2) throw new Error('hype spend 0-2');
  if (hypeSpend * 2 > side.hype) throw new Error('not enough hype');
  side.hype -= hypeSpend * 2;
  const D = venue.D + (game.coopBump || 0);
  const show = stageDice[0] + stageDice[1] + side.skill + side.albums + (side.crew.tech ? 1 : 0) + hypeSpend;
  const success = show >= D;
  side.cash -= venue.entry;
  if (venue.hype) side.hype = clamp(side.hype + 1, 0, CAPS.hype);
  let fansGained, cashGained, fameGained;
  if (success) {
    cashGained = venue.cash; fameGained = venue.fame;
    fansGained = venue.fansBonus + Math.max(1, show - D);
    side.cash += cashGained; side.fame += fameGained; side.fans += fansGained;
    side.stars += 1;
    side.skill = Math.min(CAPS.skill, Math.floor(side.stars / 4));
  } else {
    cashGained = Math.floor(venue.cash / 2); fameGained = 0;
    fansGained = 1;
    side.cash += cashGained; side.fans += fansGained;
    side.morale = clamp(side.morale - 1, 0, CAPS.morale);
    if (side.morale === 0) side.restNext = true;
  }
  const rec = { week: game.week, venue: venue.id, result: success ? 'win' : 'fail', show, D, fans: fansGained, cash: cashGained, fame: fameGained };
  side.results.push(rec);
  return rec;
}

function resolveWorkDie(side, die, action) {
  if (action === 'merch') {
    const fromStock = Math.min(die, side.merch);
    side.merch -= fromStock;
    const free = side.crew.roadie ? 2 : 0;
    const cash = (fromStock + free) * 2;
    side.cash += cash;
    return { action, cash };
  }
  if (action === 'flyer') {
    let fans = 0, hype = 0;
    if (die >= 4) { fans = die; side.fans += die; }
    if (die >= 5) { hype = 1; side.hype = clamp(side.hype + 1, 0, CAPS.hype); }
    return { action, fans, hype };
  }
  if (action === 'job') {
    side.cash += die;
    let van = 0;
    if (die === 6) { van = 1; side.van = clamp(side.van + 1, 0, CAPS.van); }
    return { action, cash: die, van };
  }
  throw new Error('unknown work action ' + action);
}

function applyRoadEvent(side, roll, opts) {
  opts = opts || {};
  switch (roll) {
    case 1:
      if (opts.payToPrevent && side.cash >= 8) { side.cash -= 8; return 'breakdown-avoided'; }
      side.van = clamp(side.van - 2, 0, CAPS.van);
      if (side.van <= 0) side.shopNext = true;
      return 'breakdown';
    case 2: side.hype = clamp(side.hype - 2, 0, CAPS.hype); return 'storm';
    case 3: side.fans += 3; return 'crowd';
    case 4: side.cash += 6; return 'frenzy';
    case 5: side.fame += 2; return 'press';
    default: side.cash += 3; side.morale = clamp(side.morale + 1, 0, CAPS.morale); return 'smooth';
  }
}

function buyCrew(side, what) {
  if (what === 'roadie') {
    if (side.crew.roadie) throw new Error('already hired');
    if (side.cash < COSTS.roadie) throw new Error('need $30');
    side.cash -= COSTS.roadie; side.crew.roadie = true; return true;
  }
  if (what === 'tech') {
    if (side.crew.tech) throw new Error('already hired');
    if (side.cash < COSTS.tech) throw new Error('need $35');
    side.cash -= COSTS.tech; side.crew.tech = true; return true;
  }
  if (what === 'manager') {
    if (side.crew.manager) throw new Error('already hired');
    if (side.cash < COSTS.managerHire) throw new Error('need $25');
    side.cash -= COSTS.managerHire; side.crew.manager = true; return true;
  }
  throw new Error('unknown crew ' + what);
}
function restock(side, shirts) {
  const space = CAPS.merch - side.merch;
  const n = clamp(shirts, 0, space);
  const cost = Math.ceil(n / 2);
  if (side.cash < cost) throw new Error('need $' + cost);
  side.cash -= cost; side.merch += n;
  return { shirts: n, cost };
}
function mechanic(side) {
  if (side.cash < COSTS.mechanic) throw new Error('need $4');
  side.cash -= COSTS.mechanic;
  side.van = clamp(side.van + 2, 0, CAPS.van);
  return true;
}

function finalScore(side) {
  // Beginners' scoring: your two running totals, nothing else. Albums already
  // pay +10 fans/+5 fame the moment they complete; cash is purely instrumental.
  return side.fans + side.fame;
}
function rankFor(score) {
  for (const [min, name] of RANKS) if (score >= min) return name;
  return 'Basement Tapes';
}

function versusHeadliner(aShow, bShow) {
  if (aShow > bShow) return 0;
  if (bShow > aShow) return 1;
  return -1;
}
function applyHeadliner(game, idxA, idxB, showA, showB) {
  const w = versusHeadliner(showA, showB);
  if (w === -1) { game.sides[idxA].fans += 1; game.sides[idxB].fans += 1; return 'tie'; }
  game.sides[w === 0 ? idxA : idxB].fans += 3;
  game.sides[w === 0 ? idxA : idxB].cash += 2;
  const loser = w === 0 ? idxB : idxA;
  game.sides[loser].fame += 1;
  return w === 0 ? game.sides[idxA].name : game.sides[idxB].name;
}

const RIVAL_P = { 1: 0.85, 2: 0.65, 3: 0.45, 4: 0.3 };
function rivalTurn(rival, week, rng) {
  const r = rng || Math.random;
  const t = (week >= 10 && rival.fame >= 40) ? 4 : tierOf(rival.fame);
  const pool = t === 4 ? [VENUE_BY_ID.warped] : VENUES.filter(v => v.tier === t);
  const v = pool[Math.floor(r() * pool.length)];
  const ok = r() < RIVAL_P[v.tier];
  if (ok) { rival.cash += v.cash; rival.fame += v.fame; rival.fans += 6 + v.fansBonus; }
  else { rival.cash += Math.floor(v.cash / 2); rival.fans += 3; }
  return { venue: v.id, result: ok ? 'win' : 'fail' };
}

function validateSide(s) {
  const bad = [];
  for (const k of ['cash', 'fans', 'fame', 'hype', 'morale', 'van', 'merch', 'stars', 'skill', 'songs', 'albums']) {
    if (!Number.isFinite(s[k])) bad.push(k);
  }
  if (s.hype < 0 || s.hype > CAPS.hype) bad.push('hype-cap');
  if (s.morale < 0 || s.morale > CAPS.morale) bad.push('morale-cap');
  if (s.van < 0 || s.van > CAPS.van) bad.push('van-cap');
  if (s.merch < 0 || s.merch > CAPS.merch) bad.push('merch-cap');
  if (s.skill < 0 || s.skill > CAPS.skill) bad.push('skill-cap');
  if (s.songs < 0 || s.songs > 8) bad.push('songs-cap');
  if (s.albums < 0 || s.albums > 2) bad.push('albums-cap');
  return bad;
}

if (typeof module !== 'undefined') {
  module.exports = {
    VENUES, VENUE_BY_ID, CAPS, COSTS, RANKS, ROAD_WEEKS, SEASON_WEEKS,
    mulberry32, rollDie, rollDice, clamp, tierOf, venueById, hasPair, isAnthem, needsHomeCrowd,
    createSide, createGame, offerPool, drawOffers, startWeekUpkeep,
    forcedRest, forcedShop, checkSong, checkAnthem, resolveShow, resolveWorkDie,
    applyRoadEvent, buyCrew, restock, mechanic, finalScore, rankFor,
    versusHeadliner, applyHeadliner, rivalTurn, validateSide,
  };
}

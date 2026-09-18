'use strict';
/* MAIN STAGE OR BUST — browser UI. Uses engine globals from engine.js. No deps. */
const $ = (sel, el) => (el || document).querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function say(msg) { const l = $('#live'); if (l) l.textContent = msg; }

let U = null;
function newUI(game) {
  return {
    game, turnIdx: 0, weekOffers: [], venue: null,
    dice: [], clickMode: 'stage', passes: 0, stage: [], hypeSpend: 0,
    phase: 'offers', roadDone: false, roadRoll: null, lastShow: {},
    rival: game.mode === 'rival' ? { fame: 0, fans: 0, cash: 20 } : null,
    log: [], songDone: false, error: null,
  };
}
function curSide() { return U.game.sides[U.turnIdx]; }
function clog(msg, wk) {
  U.log.push({ w: wk ? U.game.week : null, msg });
  const box = $('#logbox');
  if (box) { box.insertAdjacentHTML('beforeend', `<div>${wk ? `<span class="wk">W${U.game.week}</span> ` : ''}${msg}</div>`); box.scrollTop = box.scrollHeight; }
}
function setError(msg) { U.error = msg; say(msg); const e = $('#errbox'); if (e) e.innerHTML = msg ? `<div class="notice" role="alert">${esc(msg)}</div>` : ''; }

/* ---------- setup wizard ---------- */
let W = null;
function wizSequence(mode) {
  const seq = ['mode', 'name', 'genre', 'home', 'van'];
  if (mode === 'versus') seq.push('name2', 'genre2', 'home2', 'van2');
  seq.push('launch');
  return seq;
}
function wizInit() {
  W = {
    step: 0, mode: 'solo', diff: 'club',
    a: { name: 'The Paper Cuts', genre: 'random', home: '', homePick: 'random', van: '', vanPick: 'random' },
    b: { name: 'The Stagedivers', genre: 'random', home: '', homePick: 'random', van: '', vanPick: 'random' },
  };
}
function wizSide() { const s = wizSequence(W.mode)[W.step]; return s.endsWith('2') ? W.b : W.a; }
function wizLabel() {
  const s = wizSequence(W.mode)[W.step];
  const bandNo = W.mode === 'versus' ? (s.endsWith('2') ? ' · Band Two' : ' · Band One') : '';
  const titles = { mode: 'Who hits the road?', name: 'Name the band', genre: 'Pick a sound', home: 'Where from?', van: 'Name the van', launch: 'Load the van' };
  const base = s.replace('2', '');
  return (titles[base] || base) + bandNo;
}
function tilePick(name, options, checked) {
  return `<div class="pick">` + options.map(([v, t, d]) =>
    `<label><input type="radio" name="${name}" value="${esc(v)}"${v === checked ? ' checked' : ''}><b>${esc(t)}</b>${d ? `<small>${esc(d)}</small>` : ''}</label>`).join('') + `</div>`;
}
function renderSetup() {
  if (!W) wizInit();
  const app = $('#app');
  const seq = wizSequence(W.mode), step = seq[W.step];
  const side = wizSide();
  const stepNo = W.step + 1;
  let body = '';
  if (step === 'mode') {
    body = tilePick('wmode', [['solo', 'Solo', 'One band vs the clock + rank'], ['coop', 'Coop (2p)', 'One band, shared dice, D+1'], ['versus', 'Versus (2p)', 'Two bands, same offers, headliner bonus'], ['rival', 'Vs Computer', 'Solo head-to-head vs The Stagedivers']], W.mode);
  } else if (step === 'name' || step === 'name2') {
    const id = step === 'name' ? 'bandA' : 'bandB';
    body = `<label class="f" for="${id}">Band name</label><input type="text" id="${id}" maxlength="24" value="${esc(side.name)}">`;
  } else if (step === 'genre' || step === 'genre2') {
    body = `<p class="dim">This flavors your whole season — your fans, your press, your mythology.</p>` +
      tilePick('wgenre', [['random', '🎲 Surprise me', 'Fate picks your sound']].concat(GENRES.map(g => [g, g, g === 'pop-punk' ? 'Hooky and fast' : g === 'hardcore' ? 'Loud and faster' : g === 'ska' ? 'Brass knuckles' : g === 'emo' ? 'Feelings, amplified' : g === 'metalcore' ? 'Breakdowns included' : 'Cool without trying'])), side.genre);
  } else if (step === 'home' || step === 'home2') {
    body = `<p class="dim">Every legend starts in a parking lot somewhere.</p>` +
      tilePick('whome', [['random', '🎲 Anywhere', 'The highway decides']].concat(HOMETOWNS.map(h => [h, h, ''])), side.homePick) +
      `<label class="f" for="whomeCustom">…or name your own town (wins ties)</label><input type="text" id="whomeCustom" maxlength="24" placeholder="e.g. Gainesville" value="${esc(side.home)}">`;
  } else if (step === 'van' || step === 'van2') {
    body = `<p class="dim">You will live in this vehicle. Choose wisely.</p>` +
      tilePick('wvan', [['random', '🎲 Whatever runs', 'Sight unseen']].concat(VAN_NAMES.map(v => [v, v, ''])), side.vanPick) +
      `<label class="f" for="wvanCustom">…or name your own van (wins ties)</label><input type="text" id="wvanCustom" maxlength="24" placeholder="e.g. Bertha" value="${esc(side.van)}">`;
  } else if (step === 'launch') {
    const sum = (s2) => `${esc(s2.name)} · ${esc(s2.genre === 'random' ? 'mystery genre' : s2.genre)}${s2.home ? ` from ${esc(s2.home)}` : ''}${s2.van ? ` · van ${esc(s2.van)}` : ''}`;
    body = `<div class="panel"><b>${sum(W.a)}</b>${W.mode === 'versus' ? `<br><b>${sum(W.b)}</b>` : ''}<br><small class="dim">Hometowns and vans left blank go random. Hit Back to change anything.</small></div>
    <fieldset><legend>Day-one difficulty</legend><div class="pick" id="diffPick">
      ${[['basement', 'Basement', 'Start +$5. Learning the ropes.'], ['club', 'Club circuit', 'Standard season.'], ['grind', 'The Grind', 'Start $15. Road events from week 2. No mercy.']].map(([v, t, d]) =>
        `<label><input type="radio" name="diff" value="${v}"${v === W.diff ? ' checked' : ''}><b>${t}</b><small>${d}</small></label>`).join('')}
    </div></fieldset>`;
  }
  const last = W.step === seq.length - 1;
  app.innerHTML = `<p class="hero-tag">Twelve weeks. Two offers a week. One stage. Take your DIY band from VFW halls to the main stage — if the van survives.</p>
  <p><span class="badge">Step ${stepNo} of ${seq.length}</span></p>
  <h2>${esc(wizLabel())}</h2>${body}
  <p><span class="shoprow">${W.step > 0 ? '<button class="ghost" id="wizBack">← Back</button>' : ''}
  ${last ? '<button class="primary" id="startBtn">Load the van →</button>' : '<button class="primary" id="wizNext">Continue →</button>'}</span></p>`;
  const saveStep = () => {
    const q = (n) => { const el = app.querySelector(`input[name=${n}]:checked`); return el ? el.value : null; };
    if (step === 'mode') { W.mode = q('wmode') || W.mode; }
    else if (step === 'name' || step === 'name2') { const inp = document.getElementById(step === 'name' ? 'bandA' : 'bandB'); side.name = ((inp && inp.value) || side.name).slice(0, 24); }
    else if (step === 'genre' || step === 'genre2') { side.genre = q('wgenre') || side.genre; }
    else if (step === 'home' || step === 'home2') { side.homePick = q('whome') || side.homePick; side.home = (document.getElementById('whomeCustom').value || '').slice(0, 24); }
    else if (step === 'van' || step === 'van2') { side.vanPick = q('wvan') || side.vanPick; side.van = (document.getElementById('wvanCustom').value || '').slice(0, 24); }
    else if (step === 'launch') { W.diff = q('diff') || W.diff; }
  };
  const wb = $('#wizBack');
  if (wb) wb.addEventListener('click', () => { saveStep(); W.step -= 1; renderSetup(); });
  const wn = $('#wizNext');
  if (wn) wn.addEventListener('click', () => { saveStep(); W.step += 1; renderSetup(); });
  const sb = $('#startBtn');
  if (sb) sb.addEventListener('click', () => {
    saveStep();
    const mode = W.mode, diff = W.diff;
    const pick = (s2) => ({
      genre: s2.genre === 'random' ? GENRES[Math.floor(Math.random() * GENRES.length)] : s2.genre,
      hometown: s2.home || HOMETOWNS[Math.floor(Math.random() * HOMETOWNS.length)],
      van: s2.van || VAN_NAMES[Math.floor(Math.random() * VAN_NAMES.length)],
    });
    const names = mode === 'versus' ? [(W.a.name || 'Band One').slice(0, 24), (W.b.name || 'Band Two').slice(0, 24)] : [(W.a.name || 'Your Band').slice(0, 24)];
    U = newUI(createGame({ mode: mode === 'rival' ? 'solo' : mode, bandNames: names, difficulty: diff }));
    if (mode === 'rival') { U.game.rivalMode = true; U.rival = { fame: 0, fans: 0, cash: 20 }; }
    U.game.sides.forEach((sd, i) => { sd.flavor = pick(i === 0 ? W.a : W.b); });
    W = null;
    startWeek(true);
  });
}
/* ---------- week / turn ---------- */
function startWeek(first) {
  const g = U.game;
  startWeekUpkeep(g).forEach(n => clog('🔧 ' + esc(n)));
  U.weekOffers = [];
  U.lastShow = {};
  U.turnIdx = 0;
  if (!first) clog(`— week ${g.week} —`, false);
  startTurn();
}
function startTurn() {
  const g = U.game, s = curSide();
  U.venue = null; U.dice = []; U.stage = []; U.hypeSpend = 0; U.passes = 0;
  U.phase = 'offers'; U.roadDone = false; U.roadRoll = null; U.songDone = false; U.clickMode = 'stage';
  setError(null);
  clog(`<i>${esc(weekIntro(g, s, Math.random))}</i>`);
  if (s.restNext) { forcedRest(g, s); clog(`😴 ${esc(s.name)} rest up (forced): +$5, +3 morale, +1 caffeine.`); return nextTurn(true); }
  if (s.shopNext) { forcedShop(g, s); clog(`🔧 ${esc(s.name)} stuck in the shop: -$4, van +3.`); return nextTurn(true); }
  renderGame();
}
function needRoad() { return U.game.grindRoad.includes(U.game.week) && !U.roadDone; }
function diceCount(s) { return (U.game.mode === 'coop' ? 6 : 5) + (s.crew.manager ? 1 : 0); }

/* ---------- shared render ---------- */
function statHtml(s, active) {
  const songs = '♪'.repeat(s.songs) + '·'.repeat(8 - s.songs);
  const tip = (label, value, text, hot) => `<span class="stat${hot ? ' hot' : ''}" tabindex="0" data-tip="${text}">${label}<b>${value}</b></span>`;
  return `<div class="panel${active ? ' solo' : ''}">
    <b>${esc(s.name)}</b> <small class="dim" tabindex="0" data-tip="Tiers gate your offers: clubs at 12 fame, big rooms at 26, Main Stage pool at 45+. Skill grows every 4th win (+1 show hype, max +3). Each finished album adds +1 show hype.">tier ${tierOf(s.fame)} · skill +${s.skill} · albums +${s.albums}</small>
    <div class="stats">
      ${tip('Cash', '$' + s.cash, 'Gas, entries, crew. Earn it at gigs, merch tables, day jobs. Broke is not game over — but everything gets harder.')}
      ${tip('Fans', s.fans, 'THE SCORE, mostly. Final = Fans + Fame + Cash÷5 + Albums×10. Win shows, flyer neighborhoods, finish albums.', true)}
      ${tip('Fame', s.fame, 'Unlocks bigger rooms: clubs at 12, big rooms at 26, Main Stage pool at 45+. Win shows and land press to climb.')}
      ${tip('Hype', s.hype, 'Banked energy. Spend 2 for +1 on any show (max +2). Earn it flyering with 5+ and surviving ugly weeks.')}
      ${tip('Morale', '♥'.repeat(s.morale) + '♡'.repeat(CAPS.morale - s.morale), 'Band spirit. Failed shows cost 1. At 0, next week is forced rest: +$5, +3 morale, +1 caffeine.')}
      ${tip('Van', '▮'.repeat(s.van) + '▯'.repeat(CAPS.van - s.van), 'The legs. Breakdowns damage it. At 0, next week is forced shop: −$4, van +3. Patch it with day-job 6s or the mechanic.')}
      ${tip('Merch', s.merch, 'Shirts are money. Each merch die sells min(die, stock) shirts × $2. Restock anytime: $1 per 2 shirts.')}
      ${tip('Caff', s.caffeine, 'Rerolls. 1 token rerolls any dice, max 2 passes per show week. Coffee Houses and smooth miles top it up.')}
    </div>
    <div class="songs" tabindex="0" data-tip="Pairs in leftover dice write songs (1 per week). 4 songs = an album: +5 fame, +10 fans, +1 show hype forever.">${songs}</div>
    <small class="dim crewline" tabindex="0" data-tip="Hired help. Roadie: +2 free merch sales per show, van +1 weekly. Guitar tech: +1 show hype. Manager: gold die for $3/week."><span>crew:</span>${['roadie', 'tech', 'manager'].map(c => `<span class="crewmate">${s.crew[c] ? '✅' : '⬜'} ${c}</span>`).join('<span class="crewdot" aria-hidden="true">·</span>')}</small>
  </div>`;
}
function shopHtml(s) {
  const b = (id, label, dis) => `<button data-shop="${id}"${dis ? ' disabled' : ''}>${label}</button>`;
  return `<div class="panel"><h3>Backstage deals</h3><div class="shoprow">
    ${b('roadie', `Roadie $30${s.crew.roadie ? ' ✓' : ''}`, s.crew.roadie || s.cash < COSTS.roadie)}
    ${b('tech', `Guitar tech $35${s.crew.tech ? ' ✓' : ''}`, s.crew.tech || s.cash < COSTS.tech)}
    ${b('manager', `Manager $25 + $3/wk${s.crew.manager ? ' ✓' : ''}`, s.crew.manager || s.cash < COSTS.managerHire)}
    ${b('restock2', `Press +2 shirts $1`, s.merch >= CAPS.merch || s.cash < 1)}
    ${b('mechanic', `Mechanic: van +2 $4`, s.van >= CAPS.van || s.cash < COSTS.mechanic)}
  </div><small class="dim">Roadie: +2 free merch sales/show, van +1/wk · Tech: +1 show hype · Manager: gold die, $3/wk wage.</small></div>`;
}
function stepperHtml() {
  const roadWeek = U.game.grindRoad.includes(U.game.week);
  let cur = 1;
  if (U.phase === 'play' && !U.diceRolled) cur = 2;
  else if (U.phase === 'play') cur = 3;
  else if (U.phase === 'work') cur = 4;
  if (needRoad()) cur = 0;
  const steps = [
    ['Hit the road', roadWeek ? 'Road die first: breakdowns eat van + cash.' : 'No toll this week — smooth miles.'],
    ['Book the gig', '2 offers. Big rooms pay fame, demand hotter shows.'],
    ['Soundcheck', 'Roll the dice. Caffeine rerolls rescue bad nights.'],
    ['Play the show', 'Stage 2 dice vs Difficulty. Win = fans + fame; fail = half pay, morale down.'],
    ['Work the room', 'Leftover dice become merch $, flyer fans, day-job repairs. Pairs write songs.'],
    ['Flyer & load out', 'Recap the night, check the band, next city.'],
  ];
  return `<ol class="stepper" aria-label="tonight's steps">` + steps.map(([t, d], i) => {
    const cls = (i < cur || (!roadWeek && i === 0)) ? 'done' : (i === cur ? 'now' : '');
    return `<li class="${cls}"><b>${i + 1}. ${t}</b><small>${d}</small></li>`;
  }).join('') + `</ol>`;
}
function offerCard(v) {
  return `<div class="card${v.id === 'warped' ? ' warped' : ''}">
    <h3>${esc(v.name)}${v.id === 'warped' ? ' ★' : ''}</h3>
    <ul><li>Difficulty ${v.D}</li><li>Pays $${v.cash} + ${v.fame} fame</li>
    <li>+${v.fansBonus} fans + margin</li><li>Entry $${v.entry}${v.caffeine ? ' · +1☕' : ''}</li></ul>
    <button data-offer="${v.id}">Play here</button></div>`;
}

function renderGame() {
  const g = U.game, s = curSide();
  const app = $('#app');
  const multi = g.sides.length > 1;
  let html = `<h2>Week ${g.week} of ${SEASON_WEEKS}</h2>
  <div id="errbox"></div>
  <p><span class="badge">${esc({ solo: 'solo', coop: 'coop · shared van', versus: 'versus' }[g.mode] || 'solo')}${g.rivalMode ? ' · vs rival AI' : ''}</span>
  <span class="badge">${esc(g.difficulty)}</span>
  ${multi ? `<span class="badge hot">${esc(s.name)} to play</span>` : ''}</p>`;
  html += stepperHtml();
  html += g.sides.map((x, i) => statHtml(x, multi && i === U.turnIdx)).join('');
  if (U.rival) html += `<div class="panel"><b>The Stagedivers (CPU)</b> <small class="dim">fans ${U.rival.fans} · fame ${U.rival.fame} · cash $${U.rival.cash}</small></div>`;

  if (needRoad()) {
    html += `<div class="panel"><h3>🛣️ Between cities…</h3><p class="dim">The road demands a toll. Roll 1d6.</p><button class="primary" id="roadBtn">Roll road die</button><span id="roadOut"></span></div>`;
  }
  if (U.phase === 'offers' && !needRoad()) {
    if (!U.weekOffers.length) {
      const fameBase = g.mode === 'versus' ? Math.max(g.sides[0].fame, g.sides[1].fame) : s.fame;
      const keep = g.sides[U.turnIdx].fame; g.sides[U.turnIdx].fame = fameBase;
      U.weekOffers = drawOffers(g, U.turnIdx).map(v => v.id);
      g.sides[U.turnIdx].fame = keep;
    }
    html += `<h3>Two offers. Pick your poison.</h3><div class="cards">${U.weekOffers.map(id => offerCard(venueById(id))).join('')}</div>`;
  }
  if (U.phase !== 'offers' && U.venue) {
    const v = venueById(U.venue);
    html += `<p><span class="badge hot">tonight: ${esc(v.name)} · D${v.D + (g.coopBump || 0)}</span></p>`;
  }
  if ((U.phase === 'play' && U.venue) || ((U.phase === 'work' || U.phase === 'done') && U.dice.length)) html += diceHtml(s);
  if (U.phase === 'work') html += workHtml(s);
  html += shopHtml(s);
  html += `<h3>Tour log</h3><div class="log" id="logbox" tabindex="0">${U.log.map(l => `<div>${l.w ? `<span class="wk">W${l.w}</span> ` : ''}${l.msg}</div>`).join('')}</div>`;
  html += `<p><button class="ghost" id="restartBtn">Abandon tour</button></p>`;
  app.innerHTML = html;
  const box = $('#logbox'); if (box) box.scrollTop = box.scrollHeight;
  wire(s);
}
function diceHtml(s) {
  const staged = U.stage, v = venueById(U.venue);
  const bonus = s.skill + s.albums + (s.crew.tech ? 1 : 0);
  const sum = staged.reduce((a, i) => a + U.dice[i].v, 0);
  const proj = U.dice.length && staged.length === 2 ? sum + bonus + U.hypeSpend : null;
  let html = `<div class="panel"><h3>🎲 ${U.phase === 'done' ? 'Show played' : 'Soundcheck'} ${U.passes ? `<small class="dim">(rerolls used ${U.passes}/2)</small>` : ''}</h3>`;
  if (U.phase === 'play') {
    html += `<div role="group" aria-label="click mode">
      <button class="ghost" data-mode="stage"${U.clickMode === 'stage' ? ' disabled' : ''}>Click = put on stage</button>
      <button class="ghost" data-mode="reroll"${U.clickMode === 'reroll' ? ' disabled' : ''}>Click = mark reroll</button></div>`;
  }
  html += `<div class="dice">` + U.dice.map((d, i) => {
    if (d.used) return `<button class="die slot" disabled title="used">${d.v}</button>`;
    if (staged.includes(i)) return `<button class="die" data-die="${i}" aria-pressed="true" title="on stage — click to remove">★${d.v}</button>`;
    if (U.phase !== 'play') return `<button class="die${d.gold ? ' gold' : ''}" disabled>${d.v}</button>`;
    const marked = !!d.mark;
    return `<button class="die${d.gold ? ' gold' : ''}" data-die="${i}" aria-pressed="${marked}" title="die ${d.v}${d.gold ? ' (gold)' : ''}">${d.v}</button>`;
  }).join('') + `</div>`;
  if (U.phase === 'play') {
    const marked = U.dice.filter(d => d.mark && !d.used && !U.stage.includes(U.dice.indexOf(d))).length;
    html += `<div class="shoprow">
      <button id="rollBtn"${U.diceRolled ? ' disabled' : ''}>${U.diceRolled ? 'Rolled' : 'Roll ' + diceCount(s) + ' dice'}</button>
      <button id="rerollBtn"${!U.diceRolled || marked === 0 || s.caffeine < 1 || U.passes >= 2 ? ' disabled' : ''}>Reroll ${marked} (1☕, ${U.passes}/2)</button>
    </div><small class="dim">Keys 1–${U.dice.length} act on dice · S = stage mode · K = reroll mode.</small>`;
    html += `<h3>On stage (need 2)</h3><div class="slots">` +
      [0, 1].map(k => `<button class="die slot" disabled>${staged[k] !== undefined ? U.dice[staged[k]].v : '–'}</button>`).join('') +
      `<span>+ skill/albums/tech ${bonus} + hype <button class="ghost" id="hypeMinus" aria-label="less hype">−</button> ${U.hypeSpend} <button class="ghost" id="hypePlus" aria-label="more hype">+</button> (2 hype each)</span></div>`;
    if (proj !== null) html += `<p>Projected show: <b>${proj}</b> vs D${v.D + (U.game.coopBump || 0)} ${proj >= v.D + (U.game.coopBump || 0) ? '✅' : '❌'}</p>`;
    html += `<p><button class="primary" id="playBtn"${staged.length === 2 ? '' : ' disabled'}>Play the show →</button></p>`;
  }
  html += `</div>`;
  return html;
}
function workHtml(s) {
  const leftovers = U.dice.map((d, i) => ({ d, i })).filter(({ d, i }) => !U.stage.includes(i) && !d.used);
  const vals = leftovers.map(({ d }) => d.v);
  let html = `<div class="panel"><h3>Work the room — ${leftovers.length} dice left</h3>`;
  if (!U.songDone && s.songs < 8 && hasPair(vals)) {
    const pairVal = vals.find((x, i) => vals.indexOf(x) !== i);
    html += `<p><button id="songBtn">✍️ Write song (pair of ${pairVal}) — ${s.songs + 1}/8</button></p>`;
  }
  html += leftovers.map(({ d, i }) => `<p>Die ${d.v}:
    <button data-work="${i}|merch"${s.merch <= 0 && !s.crew.roadie ? ' disabled' : ''}>Merch (+$)</button>
    <button data-work="${i}|flyer">Flyer (fans)</button>
    <button data-work="${i}|job">Day job ($)</button></p>`).join('');
  html += `<p><button class="primary" id="flyerBtn"${leftovers.length === 0 ? '' : ' disabled'}>Print the flyer →</button></p></div>`;
  return html;
}

function wire(s) {
  const g = U.game;
  const rerender = () => renderGame();
  const rb = $('#roadBtn');
  if (rb) rb.addEventListener('click', () => {
    const roll = rollDie(Math.random);
    U.roadRoll = roll;
    if (roll === 1 && s.cash >= 8) {
      $('#roadOut').innerHTML = ` 💥 Breakdown! <button id="payFix">Pay $8</button> <button id="eatFix">Take it (−2 van)</button>`;
      $('#payFix').addEventListener('click', () => { applyRoadEvent(s, 1, { payToPrevent: true }); clog(`🛣️ ${esc(s.name)} breakdown — paid $8, van saved. <i>${esc(roadFlavor(1, true, s, Math.random))}</i>`); U.roadDone = true; rerender(); });
      $('#eatFix').addEventListener('click', () => { applyRoadEvent(s, 1, {}); clog(`🛣️ ${esc(s.name)} breakdown — van −2. <i>${esc(roadFlavor(1, false, s, Math.random))}</i>`); U.roadDone = true; rerender(); });
      return;
    }
    const names = { 1: 'breakdown, van −2', 2: 'storm, hype −2', 3: 'wild crowd, +3 fans', 4: 'merch frenzy, +$6', 5: 'local press, +2 fame', 6: 'smooth miles, +1☕ +1 morale' };
    applyRoadEvent(s, roll, {});
    clog(`🛣️ ${esc(s.name)} road die ${roll}: ${names[roll]}. <i>${esc(roadFlavor(roll, false, s, Math.random))}</i>`);
    U.roadDone = true; rerender();
  });
  document.querySelectorAll('[data-offer]').forEach(b => b.addEventListener('click', () => {
    U.venue = b.getAttribute('data-offer');
    U.phase = 'play'; U.diceRolled = false;
    clog(`🎸 ${esc(s.name)} books <b>${esc(venueById(U.venue).name)}</b> (entry $${venueById(U.venue).entry}).`, true);
    clog(`<i>${esc(offerFlavor(U.venue, Math.random))}</i>`);
    rerender();
  }));
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { U.clickMode = b.getAttribute('data-mode'); rerender(); }));
  document.querySelectorAll('[data-die]').forEach(b => b.addEventListener('click', () => actOnDie(parseInt(b.getAttribute('data-die'), 10))));
  const rollBtn = $('#rollBtn');
  if (rollBtn) rollBtn.addEventListener('click', doRoll);
  const rr = $('#rerollBtn');
  if (rr) rr.addEventListener('click', () => {
    const idx = U.dice.map((d, i) => (d.mark && !U.stage.includes(i) && !d.used) ? i : -1).filter(i => i >= 0);
    if (!idx.length || s.caffeine < 1 || U.passes >= 2) return;
    s.caffeine -= 1; U.passes += 1;
    idx.forEach(i => { U.dice[i] = { v: rollDie(Math.random), gold: U.dice[i].gold, mark: false }; });
    clog(`☕ reroll (${idx.length} dice).`);
    rerender();
  });
  const hm = $('#hypeMinus'), hp = $('#hypePlus');
  if (hm) hm.addEventListener('click', () => { U.hypeSpend = Math.max(0, U.hypeSpend - 1); rerender(); });
  if (hp) hp.addEventListener('click', () => { U.hypeSpend = Math.min(2, Math.floor(s.hype / 2), U.hypeSpend + 1); rerender(); });
  const pb = $('#playBtn');
  if (pb) pb.addEventListener('click', () => {
    const stageDice = U.stage.map(i => U.dice[i].v);
    try {
      const rec = resolveShow(g, s, U.venue, stageDice, U.hypeSpend);
      U.lastShow[U.turnIdx] = rec.show;
      clog(`🎤 ${esc(s.name)} @ ${esc(venueById(U.venue).name)}: show ${rec.show} vs D${rec.D} — <b>${rec.result === 'win' ? 'KILLED IT' : 'trainwreck'}</b> (+${rec.fans} fans, +$${rec.cash}, +${rec.fame} fame).`, true);
      clog(`<i>${esc(showFlavor(rec, venueById(U.venue), s, Math.random))}</i>`);
      const allVals = U.dice.map(d => d.v);
      if (checkAnthem(s, allVals, 999 + g.week)) clog(`🔥 ${esc(anthemFlavor(Math.random))}`);
      U.phase = 'work';
    } catch (e) { setError(e.message); return; }
    rerender();
  });
  const sb = $('#songBtn');
  if (sb) sb.addEventListener('click', () => {
    const vals = U.dice.map((d, i) => (!U.stage.includes(i) && !d.used) ? d.v : null).filter(v => v !== null);
    const r = checkSong(s, vals, g.week);
    if (r) { U.songDone = true; clog(r === 'album' ? `💿 ${esc(albumFlavor())}` : `✍️ ${esc(songFlavor(s.songs, Math.random))} (${s.songs}/8).`); }
    rerender();
  });
  document.querySelectorAll('[data-work]').forEach(b => b.addEventListener('click', () => {
    const [i, act] = b.getAttribute('data-work').split('|');
    try {
      const r = resolveWorkDie(s, U.dice[+i].v, act);
      U.dice[+i].used = true;
      const txt = act === 'merch' ? `merch die ${U.dice[+i].v}: +$${r.cash}` : act === 'flyer' ? `flyer ${U.dice[+i].v}: +${r.fans} fans${r.hype ? ', +1 hype' : ''}` : `day job ${U.dice[+i].v}: +$${r.cash}${r.van ? ', van +1' : ''}`;
      clog(`⚒️ ${esc(s.name)} ${txt}. <i>${esc(workFlavor(act, U.dice[+i].v, r, s, Math.random))}</i>`);
    } catch (e) { setError(e.message); return; }
    rerender();
  }));
  const fb = $('#flyerBtn');
  if (fb) fb.addEventListener('click', () => openFlyer(s));
  document.querySelectorAll('[data-shop]').forEach(b => b.addEventListener('click', () => {
    const what = b.getAttribute('data-shop');
    try {
      if (what === 'roadie' || what === 'tech' || what === 'manager') { buyCrew(s, what); clog(`🤝 ${esc(s.name)} hires ${what}! <i>${esc(hireFlavor(what, Math.random))}</i>`); }
      else if (what === 'restock2') { const r = restock(s, 2); clog(`👕 pressed ${r.shirts} shirts (−$${r.cost}).`); }
      else if (what === 'mechanic') { mechanic(s); clog(`🔧 van +2 (−$4).`); }
    } catch (e) { setError(e.message); return; }
    rerender();
  }));
  const rs = $('#restartBtn');
  if (rs) rs.addEventListener('click', () => { U = null; renderSetup(); });
}
function openFlyer(s) {
  const g = U.game, v = venueById(U.venue);
  const rec = s.results[s.results.length - 1] || { result: 'fail', show: 0, D: v.D, fans: 0, cash: 0, fame: 0 };
  const copy = flyerCopy(rec, v, s, Math.random);
  const warns = stateWarnings(s);
  clog(`Flyer on every pole: <i>"${esc(copy.headline)}"</i>`, true);
  const label = g.sides.length > 1 && U.turnIdx === 0 ? 'Hand off →' : 'End week →';
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'flyerOverlay';
  ov.innerHTML = `<div class="flyer" role="dialog" aria-modal="true" aria-label="Show flyer for ${esc(s.name)}">
    <div class="flyer-kicker">Week ${g.week} · ${esc(v.name)} · Live</div>
    <div class="flyer-band">${esc(s.name)}</div>
    <div><span class="stamp ${rec.result}">${rec.result === 'win' ? 'Killed it' : 'Trainwreck'}</span></div>
    <p class="flyer-head" id="flyerHead">${esc(copy.headline)}</p>
    <p class="flyer-blurb" id="flyerBlurb">${esc(copy.blurb)}</p>
    <div class="flyer-deltas">+${rec.fans} fans · +$${rec.cash} · +${rec.fame} fame</div>
    <ul class="flyer-state">${warns.length ? warns.map(w => `<li>${esc(w)}</li>`).join('') : '<li>All systems loud. The van even starts.</li>'}</ul>
    <div class="shoprow">
      <button id="backBtn">Back to the van</button>
      <button class="primary" id="endWeekBtn">${label}</button>
    </div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.querySelector('#backBtn').addEventListener('click', close);
  ov.querySelector('#endWeekBtn').addEventListener('click', () => { close(); nextTurn(false); });
  const eb = ov.querySelector('#endWeekBtn'); if (eb) eb.focus();
  // Invisible upgrade: if the server has a fresher headline, swap it in silently.
  if (Press.on()) {
    Press.enhance('flyer', { band: s.name, genre: (s.flavor || {}).genre, week: g.week, venue: v.name, result: rec.result, show: rec.show, D: rec.D, fans: rec.fans, cash: rec.cash, fame: rec.fame }).then((c) => {
      if (!c || !document.body.contains(ov)) return;
      ov.querySelector('#flyerHead').textContent = c.headline;
      ov.querySelector('#flyerBlurb').textContent = c.blurb;
    });
  }
}
function actOnDie(i) {
  if (U.phase !== 'play' || !U.dice[i] || U.dice[i].used) return;
  if (U.clickMode === 'stage') {
    if (U.stage.includes(i)) U.stage = U.stage.filter(x => x !== i);
    else if (U.stage.length < 2) { U.stage.push(i); U.dice[i].mark = false; }
  } else {
    if (!U.stage.includes(i)) U.dice[i].mark = !U.dice[i].mark;
  }
  renderGame();
}
function doRoll() {
  const s = curSide();
  const n = diceCount(s);
  U.dice = rollDice(n, Math.random).map((v, i) => ({ v, gold: !!(s.crew.manager && i === n - 1), mark: false, used: false }));
  U.diceRolled = true;
  clog(`🎲 ${esc(s.name)} rolls ${U.dice.map(d => d.v).join(' ')}.`);
  renderGame();
}
function nextTurn(skipped) {
  const g = U.game;
  if (g.mode === 'versus' && U.turnIdx === 0) { U.turnIdx = 1; startTurn(); return; }
  if (g.mode === 'versus' && U.lastShow[0] !== undefined && U.lastShow[1] !== undefined) {
    const w = applyHeadliner(g, 0, 1, U.lastShow[0], U.lastShow[1]);
    clog(w === 'tie' ? `🤝 split bill — both +1 fan.` : `⭐ ${esc(w)} headlines! (+3 fans, +$2; opener +1 fame).`);
    U.lastShow = {};
  }
  if (g.rivalMode && !skipped) {
    const r = rivalTurn(U.rival, g.week, Math.random);
    clog(`🆚 Stagedivers ${r.result === 'win' ? 'kill' : 'bomb'} @ ${esc(venueById(r.venue).name)} (fans ${U.rival.fans}, fame ${U.rival.fame}). <i>${esc(rivalFlavor(U.rival, r, venueById(r.venue), Math.random))}</i>`);
  }
  if (g.week >= SEASON_WEEKS) return endSeason();
  g.week += 1; U.diceRolled = false;
  startWeek(false);
}
function diaryText() {
  const g = U.game;
  return g.sides.map(s => {
    const lines = s.results.map(r => `W${r.week} ${r.venue}: ${r.result}${r.show !== undefined ? ` (show ${r.show} vs D${r.D}, +${r.fans}f/+$${r.cash}/+${r.fame}fa)` : ''}`);
    return `${s.name} — score ${finalScore(s)} (${rankFor(finalScore(s))})\n` + lines.join('\n');
  }).join('\n\n');
}
function endSeason() {
  const g = U.game;
  const app = $('#app');
  const rows = g.sides.map(s => {
    const sc = finalScore(s);
    return { s, sc, rank: rankFor(sc) };
  }).sort((a, b) => b.sc - a.sc);
  let verdict = '';
  if (g.mode === 'versus') verdict = rows[0].sc === rows[1].sc ? `<p class="rank">Draw?!</p>` : `<p class="rank">${esc(rows[0].s.name)} take the crown</p>`;
  else verdict = `<p class="rank">${esc(rows[0].rank)}</p>`;
  let rivalHtml = '';
  if (U.rival) {
    const mine = rows[0].sc, theirs = U.rival.fans + U.rival.fame + Math.floor(U.rival.cash / 5);
    rivalHtml = `<div class="panel"><h3>Vs The Stagedivers</h3><p>You ${mine} — Them ${theirs}. <b>${mine >= theirs ? 'YOU HEADLINE. They open. Forever.' : 'They headline. Rematch?'}</b></p></div>`;
  }
  app.innerHTML = `<h2>Season over — 12 weeks, countless miles</h2>${verdict}${rivalHtml}
  <table class="score"><tr><th>Band</th><th>Fans</th><th>Fame</th><th>Cash/5</th><th>Albums×10</th><th>Total</th><th>Rank</th></tr>
  ${rows.map(({ s, sc, rank }) => `<tr><td>${esc(s.name)}</td><td>${s.fans}</td><td>${s.fame}</td><td>${Math.floor(s.cash / 5)}</td><td>${s.albums * 10}</td><td><b>${sc}</b></td><td>${esc(rank)}</td></tr>`).join('')}</table>
  <h3>Tour diary</h3><div class="log" style="max-height:none">${U.log.map(l => `<div>${l.w ? `<span class="wk">W${l.w}</span> ` : ''}${l.msg}</div>`).join('')}</div>
  <p><button class="primary" id="copyBtn">Copy diary</button> <button id="againBtn">New season</button></p>`;
  $('#copyBtn').addEventListener('click', async () => {
    const t = diaryText();
    try { await navigator.clipboard.writeText(t); say('Diary copied'); } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_e) {} ta.remove();
    }
  });
  $('#againBtn').addEventListener('click', () => { U = null; renderSetup(); });
  say('Season over. ' + rows.map(r => `${r.s.name} ${r.sc} ${r.rank}`).join('. '));
}
document.addEventListener('keydown', e => {
  if (!U || !$('#app')) return;
  if (/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) return;
  if (e.key >= '1' && e.key <= '9') { const i = +e.key - 1; if (U.dice[i]) actOnDie(i); }
  else if (e.key === 's' || e.key === 'S') { U.clickMode = 'stage'; renderGame(); }
  else if (e.key === 'k' || e.key === 'K') { U.clickMode = 'reroll'; renderGame(); }
});
function openHelp() {
  if (document.getElementById('helpOverlay')) return;
  const ov = document.createElement('div');
  ov.className = 'overlay'; ov.id = 'helpOverlay';
  const step = (n, t, d) => `<li data-n="${n}"><span><span class="hstep">${t}</span><span class="hbody">${d}</span></span></li>`;
  ov.innerHTML = `<div class="help-card" role="dialog" aria-modal="true" aria-label="How to play" tabindex="-1" id="helpCard">
    <h2 style="margin-top:0">How a week works</h2>
    <p class="hsub">One gig per week, twelve weeks per season. Each step takes under a minute once you've done it twice.</p>
    <ol class="steps">
      ${step('01', 'Hit the road', 'Road die on weeks 4, 7, 10 (Grind: from week 2). Breakdowns eat van and cash — the highway takes its cut first.')}
      ${step('02', 'Book the gig', 'Pick 1 of 2 offers and pay entry. Bigger rooms pay fame but demand hotter shows. Fame unlocks tiers: T2 at 12, T3 at 26, Main Stage pool at 45+ (week 10+).')}
      ${step('03', 'Soundcheck', 'Roll 5 dice (+1 gold with a Manager). Spend Caffeine to reroll: 1 token rerolls any dice, max 2 passes per week.')}
      ${step('04', 'Play the show', 'Stage any 2 dice; optionally spend Hype (2 hype = +1 show, max +2). Show = dice + skill + albums + tech + hype-spend. Beat the Difficulty to win full cash + fame, with fans = venue bonus + margin. Fail, and it is half cash, +1 fan, −1 morale.')}
      ${step('05', 'Work the room', 'Each leftover die becomes merch cash (min(die, stock) shirts × $2), flyer fans (4+ gains fans, 5+ gains hype), or day-job dollars (a 6 repairs the van). A pair in the leftovers writes a song — 4 songs make an album: +5 fame, +10 fans, +1 show hype forever.')}
      ${step('06', 'Flyer & load out', 'Recap the night on a show flyer, check the morale / van / cash warnings, and roll to the next city.')}
    </ol>
    <h3 class="hgroup">When it goes wrong</h3>
    <p class="fine">Morale at 0 forces a rest week (+$5, +3 morale, +1 caffeine). Van at 0 forces a shop week (−$4, van +3). Any other time: the mechanic costs $4 for van +2, and restocking shirts costs $1 per 2.</p>
    <h3 class="hgroup">Winning</h3>
    <p class="fine"><b>Final score</b> = Fans + Fame + floor(Cash ÷ 5) + Albums × 10. In versus, the higher show headlines (+3 fans +$2, opener +1 fame). Keyboard: 1–7 work the dice, S is stage mode, K is reroll mode.</p>
    <p><button class="primary" id="helpClose">Back to the show →</button></p></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.querySelector('#helpClose').addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  const card = ov.querySelector('#helpCard');
  card.scrollTop = 0;
  card.focus({ preventScroll: true });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('helpOverlay')) document.getElementById('helpOverlay').remove();
});
const helpBtn = document.getElementById('helpBtn');
if (helpBtn) helpBtn.addEventListener('click', openHelp);
const THEMES = ['orange', 'pink', 'lime', 'blue', 'red'];
function applyTheme(t) {
  if (THEMES.indexOf(t) < 0) t = 'orange';
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('msob-theme', t); } catch (e) {}
  document.querySelectorAll('.swatch').forEach((b) => {
    const on = b.getAttribute('data-theme') === t;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.classList.toggle('on', on);
  });
}
document.querySelectorAll('.swatch').forEach((b) => b.addEventListener('click', () => applyTheme(b.getAttribute('data-theme'))));
applyTheme(document.documentElement.getAttribute('data-theme') || 'orange');
renderSetup();
if (/showhelp/.test(location.search)) openHelp();

'use strict';
/* DIRECTOR — subscribes to UI events, owns rAF loop, tweens, captions + aria-labels.
   ONLY file that touches DOM outside its canvases. Renderer never touches rules. */
(function () {
  const W = 480, H = 360;
  let mapCtx = null, stageCtx = null, capEl = null;
  let pal = null;
  let lastT = 0, acc = 0, rafId = 0, running = false, staticFrames = 0;
  let reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  const S = {
    game: null, sideIdx: 0, rec: null,
    mapMs: { week: 1, stopIndex: 0, vanHp: 6, morale: 5, fame: 0, tier: 1, gatesOpen: false, results: [], fameTier: 0 },
    mapMs2: null,
    stageSt: { tier: 1, venueName: 'VFW Hall', crowdN: 4, bounce: 2, weather: 'clear', merchStock: 6, songs: 0, moralePose: 'idle', verdict: 'none', margin: 0, vanHp: 6, albums: 0, anthem: false },
    vanFrom: 0, vanTo: 0, vanTween: 1, vanT0: 0,
    beat: 'idle', beatT0: 0, weather: 'clear', seed: 1,
    mapFx: [], stageFx: [],
    caption: '',
  };
  function getPal() {
    try { pal = window.MSOBPalette.getPalette(); } catch (e) { pal = { accent: '#ff5a1f', sticker: '#ffd23f', skyTop: '#0e0e18', skyBot: '#1c1626', ink: '#f2ede3', dim: '#a8a196', road: '#3a352f', roadEdge: '#5a5348', grass: '#1e2a1c', house: '#2a2622', houseLit: '#ffd23f', star: '#ffd23f', fail: '#8a867e', rest: '#ff4438', vanBody: '#ff5a1f', vanP2: '#f2ede3', crowdShirts: ['#ff5a1f', '#ffd23f', '#7dd87d', '#3fa9ff'] }; }
    return pal;
  }
  function railShow(on) {
    try { const r = document.getElementById('visualRail'); if (r) r.classList.toggle('showtime', !!on); } catch (e) {}
  }
  function setCaption(text) {
    S.caption = text;
    if (capEl) capEl.textContent = text;
    try {
      const mc = document.getElementById('mapCanvas'), sc = document.getElementById('stageCanvas');
      if (mc) mc.setAttribute('aria-label', 'Tour map week ' + S.mapMs.week + '. ' + text);
      if (sc) sc.setAttribute('aria-label', 'Venue ' + S.stageSt.venueName + '. ' + text);
    } catch (e) { console.error('caption aria', e); }
  }
  function spawn(list, n, kind) {
    for (let i = 0; i < n && list.length < 160; i++) {
      list.push({ kind, x: 60 + Math.random() * 360, y: kind === 'dust' ? 300 + Math.random() * 30 : Math.random() * 200, vx: (Math.random() - 0.5) * 60, vy: kind === 'confetti' ? 40 + Math.random() * 60 : -20 - Math.random() * 40, life: 1.2 + Math.random(), age: 0, c: ['#ffd23f', '#ff5a1f', '#7dd87d', '#3fa9ff'][i % 4] });
    }
  }
  function emit(type, payload) {
    payload = payload || {};
    getPal();
    S.seed += 1;
    if (type === 'weekStart') {
      if (payload.game) {
        S.game = payload.game; S.sideIdx = payload.sideIdx || 0;
        try {
          S.mapMs = window.MSOBMap.mapState(payload.game, S.sideIdx);
          S.mapMs2 = (payload.game.sides && payload.game.sides.length > 1)
            ? window.MSOBMap.mapState(payload.game, S.sideIdx === 0 ? 1 : 0) : null;
        } catch (e) { console.error('mapState', e); }
        S.vanFrom = S.vanTo || 0; S.vanTo = S.mapMs.stopIndex;
        S.vanTween = reduced ? 1 : 0; S.vanT0 = performance.now();
        S.beat = 'drive';
        const vanName = ((payload.game.sides[S.sideIdx] || {}).flavor || {}).van || 'the van';
        setCaption(vanName + ' rolls into week ' + S.mapMs.week + ' — ' + (S.mapMs.gatesOpen ? 'Main Stage gates open.' : 'next stop or bust.'));
        if (!reduced) spawn(S.mapFx, payload.game.mode === 'coop' ? 24 : 12, 'dust');
      }
      railShow(false);
      wake();
    } else if (type === 'offerPicked') {
      try { S.stageSt.venueName = payload.venueName || S.stageSt.venueName; S.stageSt.tier = payload.tier || S.stageSt.tier; } catch (e) { console.error('offer', e); }
      setCaption('Books ' + (payload.venueName || 'the gig') + ' — week ' + S.mapMs.week + '.');
      railShow(false);
      wake();
    } else if (type === 'diceRolled') {
      setCaption('Soundcheck — dice hit the table.');
      wake();
    } else if (type === 'showResolved') {
      if (payload.rec) {
        S.rec = payload.rec;
        try { S.stageSt = window.MSOBStage.stageState(payload.game, S.sideIdx, payload.rec); } catch (e) { console.error('stageState', e); S.stageSt.verdict = payload.rec.result; }
        if (payload.weather) { S.weather = payload.weather; S.stageSt.weather = payload.weather; }
        S.beat = 'show'; S.beatT0 = performance.now();
        if (payload.rec.result === 'win' && (payload.album || payload.anthem)) spawn(S.stageFx, 80, 'confetti');
        if (S.stageSt.tier === 4 && payload.rec.result === 'win') spawn(S.stageFx, 40, 'pyro');
        if (S.weather === 'storm') S.stageSt.weather = 'storm';
        const v = payload.rec.result === 'win' ? 'kills it' : 'eats it';
        setCaption(S.stageSt.venueName + ' — the band ' + v + ' (show ' + payload.rec.show + ' vs D' + payload.rec.D + ').');
        railShow(true);
        S.mapMs.results.push({ week: S.mapMs.week, venue: payload.rec.venue, result: payload.rec.result });
      }
      wake();
    } else if (type === 'songWritten') { setCaption('New song in the book — ' + (payload.songs || '') + '/8.'); spawn(S.stageFx, 10, 'confetti'); wake(); }
    else if (type === 'albumDone') { S.stageSt.albums = payload.albums || 1; setCaption('Album done — fame jumps, hype forever.'); spawn(S.stageFx, 80, 'confetti'); wake(); }
    else if (type === 'anthem') { S.stageSt.anthem = true; setCaption('Anthem — four of a kind, crowd loses it.'); spawn(S.stageFx, 80, 'confetti'); wake(); }
    else if (type === 'roadEvent') {
      S.weather = payload.kind === 'storm' ? 'storm' : 'clear'; S.stageSt.weather = S.weather;
      setCaption('Road week — ' + (payload.label || 'the highway takes its cut.'));
      if (payload.kind === 'breakdown') spawn(S.mapFx, 16, 'dust');
      wake();
    } else if (type === 'shopBuy') { setCaption('Backstage deal — ' + (payload.what || 'geared up') + '.'); wake(); }
    else if (type === 'workDone') { wake(); }
    else if (type === 'seasonEnd') { setCaption('Season over — ' + (payload.rank || 'the diary is full.')); wake(); }
  }
  function drawFx(ctx, list, dt) {
    const keep = [];
    for (const pt of list) {
      pt.age += dt / 1000;
      if (pt.age >= pt.life) continue;
      pt.x += pt.vx * dt / 1000; pt.y += pt.vy * dt / 1000;
      const a = 1 - pt.age / pt.life;
      if (pt.kind === 'pyro') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.fillStyle = pt.c; ctx.fillRect(pt.x, pt.y, 4, 4); ctx.restore(); }
      else if (pt.kind === 'confetti') { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = pt.c; ctx.fillRect(pt.x, pt.y, 3, 5); ctx.restore(); }
      else { ctx.save(); ctx.globalAlpha = a * 0.6; ctx.fillStyle = '#8a867e'; ctx.fillRect(pt.x, pt.y, 5, 5); ctx.restore(); }
      keep.push(pt);
    }
    list.length = 0;
    for (const k of keep) list.push(k);
  }
  function draw(now) {
    rafId = 0;
    if (document.hidden) { running = false; return; }
    const dt = Math.min(50, now - (lastT || now));
    lastT = now;
    acc += dt;
    if (acc < 33 && running) { rafId = requestAnimationFrame(draw); return; }
    acc = 0;
    const p = getPal();
    let vanMix = 1;
    if (S.vanTween < 1) {
      S.vanTween = Math.min(1, (now - S.vanT0) / 1200);
      vanMix = S.vanTween;
      if (S.vanTween >= 1) S.beat = S.beat === 'drive' ? 'idle' : S.beat;
    }
    const Map = window.MSOBMap, Stage = window.MSOBStage;
    if (mapCtx && Map) {
      mapCtx.imageSmoothingEnabled = false;
      mapCtx.save(); mapCtx.clearRect(0, 0, W, H);
      try {
        const pts = Map.stopPoints(W, H);
        const a = Math.max(0, Math.min(11, Math.floor(S.vanFrom))), b = Math.max(0, Math.min(11, Math.round(S.vanTo)));
        const e = vanMix < 0.5 ? 2 * vanMix * vanMix : 1 - Math.pow(-2 * vanMix + 2, 2) / 2;
        const vanPos = { x: pts[a].x + (pts[b].x - pts[a].x) * e, y: pts[a].y + (pts[b].y - pts[a].y) * e };
        let p2Pos = null;
        if (S.mapMs2) {
          const b2 = Math.max(0, Math.min(11, Math.round(S.mapMs2.stopIndex)));
          p2Pos = { x: pts[b2].x + 30, y: pts[b2].y + 10 };
        }
        Map.drawMap(mapCtx, S.mapMs, p, { vanPos, p2Pos, p2VanHp: S.mapMs2 ? S.mapMs2.vanHp : undefined, p2Avatar: S.mapMs2 ? S.mapMs2.avatar : undefined, weather: S.weather });
      } catch (e) { console.error('drawMap', e); }
      drawFx(mapCtx, S.mapFx, dt);
      mapCtx.restore();
    }
    if (stageCtx && Stage) {
      stageCtx.imageSmoothingEnabled = false;
      stageCtx.save(); stageCtx.clearRect(0, 0, W, H);
      try { Stage.drawStage(stageCtx, S.stageSt, p, now, { weather: S.weather, seed: S.seed }); } catch (e) { console.error('drawStage', e); }
      drawFx(stageCtx, S.stageFx, dt);
      if (S.beat === 'show' && now - S.beatT0 > 2500 && !reduced) S.beat = 'idle';
      stageCtx.restore();
    }
    const active = S.vanTween < 1 || S.beat === 'show' || S.beat === 'drive' || S.mapFx.length > 0 || S.stageFx.length > 0;
    if (!active) {
      staticFrames += 1;
      if (staticFrames > 60) { running = false; staticFrames = 0; return; }
    } else staticFrames = 0;
    running = true;
    rafId = requestAnimationFrame(draw);
  }
  function wake() {
    lastT = 0; acc = 0;
    if (!running && !document.hidden) { running = true; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(draw); }
    else if (reduced) {
      try {
        if (mapCtx && window.MSOBMap) { mapCtx.imageSmoothingEnabled = false; window.MSOBMap.drawMap(mapCtx, S.mapMs, getPal(), { weather: S.weather }); }
        if (stageCtx && window.MSOBStage) { stageCtx.imageSmoothingEnabled = false; window.MSOBStage.drawStage(stageCtx, S.stageSt, getPal(), performance.now(), { weather: S.weather, seed: S.seed }); }
      } catch (e) { console.error('reduced draw', e); }
    }
  }
  function init() {
    const mc = document.getElementById('mapCanvas'), sc = document.getElementById('stageCanvas');
    capEl = document.getElementById('visualCaption');
    if (!mc || !sc) { console.error('visual canvases missing'); return; }
    mapCtx = mc.getContext('2d'); stageCtx = sc.getContext('2d');
    getPal();
    try {
      const mo = new MutationObserver(() => getPal());
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) {}
    try { document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); }); } catch (e) {}
    setCaption('Load the van — twelve weeks, one stage.');
    wake();
  }
  const api = { emit, init, _state: S };
  if (typeof module !== 'undefined') module.exports = api;
  else { window.MSOBVisual = api; document.addEventListener('DOMContentLoaded', init); }
})();

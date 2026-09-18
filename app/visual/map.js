'use strict';
/* MAP — road spline, stops, van marker, weather badges. Pure drawMap(ctx, mapState).
   Layers (literal §9.3): base (road+terrain, no actors/text) -> zones (DATA, never pixels)
   -> props (signs/houses/finale gates with {x,y,sortY,occlusionClass}) -> actors (vans y-sorted)
   -> foreground (arch crown) -> caption/HUD.
   Never bake stop numbers/venue names/results into base; art updates update zone metadata + mapping tests. */
(function () {
  function stopPoints(W, H) {
    // 12 stops, serpentine S-curve: 4 rows x 3, alternating direction. Candyland read.
    const rows = 4, cols = 3;
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      const dir = r % 2 === 0 ? 1 : -1;
      const cc = dir === 1 ? c : (cols - 1 - c);
      const x = W * 0.14 + (W * 0.72) * (cols === 1 ? 0.5 : cc / (cols - 1));
      const y = H * 0.14 + (H * 0.72) * (r / (rows - 1));
      pts.push({ x, y, idx: i });
    }
    return pts;
  }
  function mapState(game, sideIdx) {
    // Pure, unit-testable. No randomness.
    const s = game.sides[sideIdx || 0];
    const week = game.week || 1;
    const stopIndex = Math.min(11, Math.max(0, week - 1));
    const gatesOpen = s.fame >= 45 && week >= 10;
    const results = (s.results || []).map((r) => ({ week: r.week, venue: r.venue, result: r.result }));
    return {
      week, stopIndex, vanHp: s.van, morale: s.morale, fame: s.fame,
      tier: s.fame >= 26 ? 3 : s.fame >= 12 ? 2 : 1,
      gatesOpen, results,
      fameTier: s.fame >= 45 ? 3 : s.fame >= 26 ? 2 : s.fame >= 12 ? 1 : 0,
    };
  }
  function vanVariant(vanHp) {
    return vanHp >= 5 ? 'pristine' : vanHp >= 3 ? 'dented' : vanHp >= 1 ? 'smoking' : 'wreck';
  }
  function resultForWeek(results, weekNum) {
    for (const r of results) if (r.week === weekNum) return r;
    return null;
  }
  function drawMap(ctx, ms, pal, opts) {
    opts = opts || {};
    const W = 480, H = 360;
    const S = (window.MSOBSprites || {});
    // --- base: sky wash + terrain + road spline (no actors/text) ---
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.skyTop); g.addColorStop(1, pal.skyBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = pal.grass;
    ctx.fillRect(0, 0, W, H);
    // road
    const pts = stopPoints(W, H);
    ctx.strokeStyle = pal.roadEdge; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();
    ctx.strokeStyle = pal.road; ctx.lineWidth = 12;
    ctx.beginPath();
    pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();
    // center dashes
    ctx.fillStyle = pal.roadEdge;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      for (let t = 0.25; t < 1; t += 0.25) {
        ctx.fillRect(a.x + (b.x - a.x) * t - 2, a.y + (b.y - a.y) * t - 2, 4, 4);
      }
    }
    // --- zones: stop hit-areas as DATA (returned, never pixels) ---
    const zones = pts.map((p) => ({ idx: p.idx, x: p.x - 20, y: p.y - 20, w: 40, h: 40, cx: p.x, cy: p.y }));
    // --- props: houses (lit windows per tier), signs, finale gates ---
    const houses = [
      { x: 40, y: 40 }, { x: 400, y: 90 }, { x: 60, y: 200 }, { x: 400, y: 250 }, { x: 200, y: 320 },
    ];
    houses.forEach((h, hi) => {
      ctx.fillStyle = pal.house;
      ctx.fillRect(h.x, h.y, 24, 18);
      ctx.fillStyle = '#141414';
      ctx.fillRect(h.x + 4, h.y + 6, 16, 3);
      const lit = Math.min(houses.length, (ms.fameTier || 0) + (hi === 0 ? 1 : 0));
      ctx.fillStyle = hi < lit ? pal.houseLit : '#4a4741';
      ctx.fillRect(h.x + 5, h.y + 10, 5, 5);
      ctx.fillRect(h.x + 14, h.y + 10, 5, 5);
    });
    // stops
    pts.forEach((p, i) => {
      const weekNum = i + 1;
      const isCurrent = i === Math.round(ms.stopIndex + (opts.vanT || 0));
      const isPast = i < ms.week;
      const rec = resultForWeek(ms.results, weekNum);
      // stop disc
      ctx.fillStyle = '#141414';
      ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isCurrent ? pal.accent : (i < ms.week ? '#f2ede3' : '#4a4741');
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#141414';
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const label = (i === 11) ? '★' : String(weekNum);
      ctx.fillText(label, p.x, p.y + 1);
      // flags: gold star win, gray X fail, red cross rest/shop
      if (rec) {
        ctx.font = 'bold 13px monospace';
        if (rec.result === 'win') { ctx.fillStyle = pal.star; ctx.fillText('★', p.x + 16, p.y - 14); }
        else if (rec.result === 'fail') { ctx.fillStyle = pal.fail; ctx.fillText('×', p.x + 16, p.y - 14); }
        else { ctx.fillStyle = pal.rest; ctx.fillText('+', p.x + 16, p.y - 14); }
      }
      // finale gate on stop 12
      if (i === 11) {
        ctx.fillStyle = ms.gatesOpen ? pal.accent : '#4a4741';
        ctx.fillRect(p.x - 22, p.y - 30, 44, 8);
        if (ms.gatesOpen) {
          ctx.fillStyle = pal.sticker;
          ctx.fillRect(p.x - 22, p.y - 30, 44, 2);
        }
      }
      // weather badge over current stop on road weeks
      if (isCurrent && opts.weather && (ms.week === 4 || ms.week === 7 || ms.week === 10)) {
        const Spr = window.MSOBSprites;
        if (Spr && Spr.getSprite) {
          try {
            const icon = Spr.getSprite(pal, opts.weather === 'storm' ? 'storm' : opts.weather === 'cloud' ? 'cloud' : 'sun', {});
            if (icon) ctx.drawImage(icon, p.x + 12, p.y - 34, 24, 24);
          } catch (e) {}
        }
      }
    });
    // --- actors: vans y-sorted ---
    const actors = [];
    const vanPos = opts.vanPos || pts[Math.min(11, Math.max(0, Math.round(ms.stopIndex)))];
    actors.push({ y: vanPos.y, kind: 'p1', x: vanPos.x, yv: vanPos.y });
    if (opts.p2Pos) actors.push({ y: opts.p2Pos.y, kind: 'p2', x: opts.p2Pos.x, yv: opts.p2Pos.y });
    actors.sort((a, b) => a.y - b.y);
    actors.forEach((a) => {
      const Spr = window.MSOBSprites;
      if (!Spr || !Spr.getSprite) return;
      const hp = a.kind === 'p2' && opts.p2VanHp !== undefined ? opts.p2VanHp : ms.vanHp;
      const variant = vanVariant(hp);
      try {
        const img = Spr.getSprite(pal, 'van', { variant, p2: a.kind === 'p2' });
        if (img) ctx.drawImage(img, a.x - 24, a.y - 40, 48, 48);
        // dust puffs are FX layer (director), not baked
      } catch (e) {}
    });
    // --- foreground: finale arch crown ---
    const fin = pts[11];
    ctx.fillStyle = ms.gatesOpen ? pal.sticker : '#2a2622';
    ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(ms.gatesOpen ? 'MAIN STAGE OPEN' : 'MAIN STAGE', fin.x, fin.y + 28);
    return { zones, pts };
  }

  const api = { stopPoints, mapState, drawMap, resultForWeek, vanVariant };
  if (typeof module !== 'undefined') module.exports = api;
  else window.MSOBMap = api;
})();

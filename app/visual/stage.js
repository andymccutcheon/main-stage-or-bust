'use strict';
/* STAGE — venue scene. Pure drawStage(ctx, stageState, t).
   Parametric by tier, dressed by state. No randomness except particle seeds (director owns). */
(function () {
  function stageState(game, sideIdx, rec) {
    const s = game.sides[sideIdx || 0];
    const venueId = (rec && rec.venue) || (s.results.length ? s.results[s.results.length - 1].venue : 'vfw');
    let tier = 1, venueName = venueId;
    try {
      const V = (typeof VENUE_BY_ID !== 'undefined' ? VENUE_BY_ID : (typeof require !== 'undefined' ? require('../engine.js').VENUE_BY_ID : {}))[venueId];
      if (V) { tier = V.tier === 4 ? 4 : V.tier; venueName = V.name; }
    } catch (e) {}
    // crowd formula (unit-tested): min(64, 4 + floor(fans/4))
    const crowdN = Math.min(64, 4 + Math.floor((s.fans || 0) / 4));
    const margin = rec && rec.show !== undefined ? rec.show - rec.D : 0;
    const bounce = rec ? (rec.result === 'win' ? Math.min(6, 2 + Math.max(0, margin)) : 1) : 2;
    const verdict = rec ? rec.result : 'none';
    return {
      tier, venueName, crowdN, bounce, weather: 'clear',
      merchStock: s.merch, songs: s.songs,
      moralePose: (s.morale || 5) <= 1 ? 'slump' : 'idle',
      verdict, margin,
      vanHp: s.van, albums: s.albums, anthem: false,
      away: (game.mode === 'versus' && (sideIdx || 0) === 1),
      week: game.week || 1,
    };
  }
  function drawStage(ctx, st, pal, t, opts) {
    opts = opts || {};
    const W = 480, H = 360;
    const Spr = window.MSOBSprites;
    t = t || 0;
    // --- backdrop by tier ---
    if (st.tier === 4) {
      // W main stage: open sky day or pyro rig win
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#7db8e8'); g.addColorStop(0.6, pal.skyBot); g.addColorStop(1, '#141414');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f2ede3';
      ctx.fillRect(40, 60, 400, 60); // main arch
      ctx.fillStyle = '#141414';
      ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText('MAIN STAGE', W / 2, 98);
    } else if (st.tier === 3) {
      ctx.fillStyle = '#1a1418'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#2a2230'; ctx.fillRect(0, 40, W, 60); // balcony row
      for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#3a3040' : '#241e28'; ctx.fillRect(20 + i * 55, 50, 40, 30); }
      // sweeping beams (margin-scaled angle)
      ctx.save(); ctx.globalAlpha = 0.35;
      const sweep = Math.sin(t / 600) * 60;
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.moveTo(W / 2, 100); ctx.lineTo(W / 2 - 120 + sweep, H); ctx.lineTo(W / 2 - 60 + sweep, H); ctx.fill();
      ctx.beginPath(); ctx.moveTo(W / 2, 100); ctx.lineTo(W / 2 + 60 + sweep, H); ctx.lineTo(W / 2 + 120 + sweep, H); ctx.fill();
      ctx.restore();
    } else if (st.tier === 2) {
      ctx.fillStyle = '#14141c'; ctx.fillRect(0, 0, W, H);
      // neon venue-name sign (theme accent)
      ctx.fillStyle = pal.accent;
      ctx.fillRect(60, 50, W - 120, 44);
      ctx.fillStyle = '#141414';
      ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
      const nm = (st.venueName || 'CLUB').toUpperCase().slice(0, 18);
      ctx.fillText(nm, W / 2, 78);
      // monitor wedges
      ctx.fillStyle = '#2a2a2e';
      [[120, 220], [360, 220]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x + 20, y); ctx.lineTo(x + 12, y - 16); ctx.lineTo(x - 12, y - 16); ctx.fill(); });
    } else {
      // T1 basement: brick wall, string lights, PA stack
      ctx.fillStyle = '#241a16'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#2e221c';
      for (let y = 20; y < 160; y += 16) for (let x = (y % 32 ? 0 : 12); x < W; x += 32) ctx.fillRect(x, y, 28, 3);
      // string lights
      for (let i = 0; i < 12; i++) {
        const x = 20 + i * 38, y = 30 + Math.sin(i * 1.2) * 8;
        ctx.fillStyle = i % 3 === 0 ? pal.sticker : pal.accent;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
      // PA stack
      ctx.fillStyle = '#0c0c0c'; ctx.fillRect(20, 120, 50, 90);
      ctx.fillStyle = '#3a3a3e'; ctx.beginPath(); ctx.arc(45, 145, 12, 0, Math.PI * 2); ctx.arc(45, 185, 12, 0, Math.PI * 2); ctx.fill();
    }
    // week sky cycle: dusk 1-4, night 5-8, finale glow 9-12 (one tint wash)
    const wk = st.week || 1;
    ctx.fillStyle = wk <= 4 ? 'rgba(255,122,26,0.10)' : wk <= 8 ? 'rgba(20,20,60,0.14)' : 'rgba(255,210,63,0.10)';
    ctx.fillRect(0, 0, W, 230);
    // stage floor
    ctx.fillStyle = '#2a2622'; ctx.fillRect(0, 230, W, 60);
    ctx.fillStyle = '#3a352f'; ctx.fillRect(0, 230, W, 6);
    // --- band (4 members, pose from morale/result) ---
    if (Spr && Spr.getSprite) {
      const roles = ['vox', 'guitar', 'bass', 'drums'];
      const pose = st.moralePose === 'slump' ? 'slump' : (st.verdict === 'win' ? 'jump' : st.verdict === 'fail' ? 'slump' : 'idle');
      const frame = Math.floor(t / 500) % 4;
      // idle/bob 2x2 grid: frame cycles 0..3; jump/slump separate loops same base
      roles.forEach((role, i) => {
        try {
          const img = Spr.getSprite(pal, 'band-' + role, { pose: pose === 'idle' ? 'idle' : pose, frame: pose === 'idle' ? frame : (Math.floor(t / 300) % 2), p2: !!st.away });
          const bx = 110 + i * 90, by = 196;
          const bob = pose === 'jump' ? -Math.abs(Math.sin(t / 200 + i)) * 8 : pose === 'idle' ? Math.sin(t / 500 + i * 1.5) * 2 : 0;
          if (img) ctx.drawImage(img, bx, by + bob, 32, 32);
        } catch (e) {}
      });
      // smoking van stage-left if van<=2
      if ((st.vanHp || 6) <= 2) {
        try {
          const van = Spr.getSprite(pal, 'van', { variant: (st.vanHp || 0) <= 0 ? 'wreck' : 'smoking' });
          if (van) ctx.drawImage(van, 8, 190, 48, 48);
        } catch (e) {}
      }
      // merch table prop reflects stock; flyer pole posters = songs
      try {
        const merch = Spr.getSprite(pal, 'merch', {});
        if (merch) {
          ctx.drawImage(merch, W - 60, 200, 32, 32);
          ctx.fillStyle = '#141414'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
          ctx.fillText(String(st.merchStock || 0), W - 44, 218);
        }
        const pole = Spr.getSprite(pal, 'pole', {});
        if (pole) {
          ctx.drawImage(pole, 8, 120, 32, 64);
          ctx.fillStyle = pal.sticker;
          const posters = Math.min(8, st.songs || 0);
          for (let i = 0; i < posters; i++) ctx.fillRect(12, 124 + i * 6, 10, 5);
        }
        if ((st.albums || 0) > 0 || st.anthem) {
          const tr = Spr.getSprite(pal, 'trophy', {});
          if (tr) ctx.drawImage(tr, W / 2 - 16, 120, 32, 32);
        }
      } catch (e) {}
      // --- crowd: count from fans, bounce amplitude = margin signal ---
      const n = Math.min(64, st.crowdN || 4);
      const cols = 16, cw = 28, ch = 18;
      for (let i = 0; i < n; i++) {
        const cx = 16 + (i % cols) * cw, cy = 300 + Math.floor(i / cols) * ch;
        const amp = st.verdict === 'win' ? (st.bounce || 2) : st.verdict === 'fail' ? 1 : 2;
        const ph = Math.sin(t / 300 + i * 0.9) * amp;
        try {
          const blob = Spr.getSprite(pal, 'crowd', { colorIdx: i % 4 });
          if (blob) ctx.drawImage(blob, cx, cy + ph, 16, 16);
        } catch (e) {}
      }
    }
    // encore spotlight on win, flat room on fail
    if (st.verdict === 'win') {
      const g2 = ctx.createLinearGradient(0, 60, 0, 240);
      g2.addColorStop(0, 'rgba(255,255,240,0.28)'); g2.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.moveTo(110, 60); ctx.lineTo(200, 60); ctx.lineTo(260, 240); ctx.lineTo(40, 240); ctx.fill();
    } else if (st.verdict === 'fail') {
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(0, 0, W, 230);
    }
    // --- marquee verdict stamp ---
    if (st.verdict === 'win' || st.verdict === 'fail') {
      ctx.save();
      ctx.translate(W / 2, 130); ctx.rotate(-0.08);
      ctx.fillStyle = st.verdict === 'win' ? pal.sticker : '#4a4741';
      ctx.fillRect(-70, -20, 140, 36);
      ctx.strokeStyle = '#141414'; ctx.lineWidth = 3; ctx.strokeRect(-70, -20, 140, 36);
      ctx.fillStyle = '#141414'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
      ctx.fillText(st.verdict === 'win' ? 'WIN' : 'ROUGH', 0, 5);
      ctx.restore();
    }
    // rain overlay if storm (director sets weather)
    if ((opts.weather || st.weather) === 'storm') {
      ctx.save(); ctx.strokeStyle = 'rgba(120,180,255,0.5)'; ctx.lineWidth = 1;
      const seed = opts.seed || 1;
      for (let i = 0; i < 40; i++) {
        const x = (i * 37 + seed * 13) % W, y = (i * 53 + t / 20) % H;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 10); ctx.stroke();
      }
      ctx.restore();
    }
  }
  const api = { stageState, drawStage };
  if (typeof module !== 'undefined') module.exports = api;
  else window.MSOBStage = api;
})();

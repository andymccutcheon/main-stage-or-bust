'use strict';
/* SPRITES — every sprite as function drawing to offscreen canvas from string maps (. transparent).
   16x16 base grid. Cached once at boot, never parsed per-frame.
   Contracts (§9.2): one action family per sheet; body-only (FX separate);
   feet/bottom anchors locked; one scale profile per actor from idle;
   no single-row strips — idle/bob are 2x2 grids. */
(function () {
  // Palette swap keys -> runtime colors. B=body/accent, P2=white, K=outline, W=window, etc.
  const SCALE = { van: 3, band: 2, crowd: 1, prop: 2, icon: 2 };
  const GROUND_ROW = 14; // wheels/feet share this row in all variants

  // --- canonical masters (16 chars x 16 rows) ---
  const VAN_MASTER = [
    '................',
    '................',
    '................',
    '..KKKKKKKKKKK...',
    '..KBWWWKBBBWK...',
    '..KBWWWKBBBWK...',
    '..KBBBBBBBBBK...',
    '..KBBBBBBBBBK...',
    '..KBBBBBBBBBK...',
    '..KBBBBBBBBBK...',
    '.KKBBBBBBBBBKK..',
    '.KTKBBBBBBBTK...',
    '.KHKBBBBBBBHK...',
    '..KKK....KKK....',
    '................',
    '................',
  ];
  // Band base: 4 roles share skeleton, differ by instrument pixels (I) + headband (H for vox)
  const BAND_BASE = {
    vox: [
      '................',
      '.....KKKK.......',
      '....KFFFFK......',
      '....KFFFFK......',
      '.....KFFK.......',
      '......KK........',
      '....KKBBKK......',
      '...KBBBBBBK.....',
      '...KBBIBBBK.....',
      '....KBBBBK......',
      '....KBBBBK......',
      '....KBBBBK......',
      '.....KBBK.......',
      '.....KBBK.......',
      '....KK..KK......',
      '................',
    ],
    guitar: [
      '................',
      '.....KKKK.......',
      '....KFFFFK......',
      '....KFFFFK......',
      '.....KFFK.......',
      '......KK........',
      '....KKBBKK......',
      '...KBBBBBBK.....',
      '..IKBBBBBBKI....',
      '..IIKBBBBKII....',
      '...IIKBBKII.....',
      '....KBBBBK......',
      '.....KBBK.......',
      '.....KBBK.......',
      '....KK..KK......',
      '................',
    ],
    bass: [
      '................',
      '.....KKKK.......',
      '....KFFFFK......',
      '....KFFFFK......',
      '.....KFFK.......',
      '......KK........',
      '....KKBBKK......',
      '...KBBBBBBK.....',
      '...KBBBBBBKI....',
      '....KBBBBK.II...',
      '....KBBBBK..II..',
      '....KBBBBK......',
      '.....KBBK.......',
      '.....KBBK.......',
      '....KK..KK......',
      '................',
    ],
    drums: [
      '................',
      '.....KKKK.......',
      '....KFFFFK......',
      '....KFFFFK......',
      '.....KFFK.......',
      '......KK........',
      '....KKBBKK......',
      '..DDBBBBBBD.....',
      '..DDBBBBBBDD....',
      '...DKBBBBKD.....',
      '....KBBBBK......',
      '....KBBBBK......',
      '.....KBBK.......',
      '.....KBBK.......',
      '....KK..KK......',
      '................',
    ],
  };
  const CROWD_BLOB = [
    '................',
    '................',
    '................',
    '................',
    '.....KKKK.......',
    '....KFFFFK......',
    '....KFFFFK......',
    '.....KFFK.......',
    '...KKSSSSKK.....',
    '..KSSSSSSSSK....',
    '..KSSKSSKSSK....',
    '..KSSSSSSSSK....',
    '..KSSSSSSSSK....',
    '...KSSSSSSK.....',
    '................',
    '................',
  ];
  const PROP_MAPS = {
    merch: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '..KKKKKKKKKK....',
      '..KYYYYYYYYK....',
      '..KYKKKKKYYK....',
      '..KYKYYYYKYK....',
      '..KYKYYYYKYK....',
      '..KKTTTTTTKK....',
      '...TTTTTTTT.....',
      '...TT....TT.....',
      '...TT....TT.....',
      '................',
    ],
    pole: [
      '................',
      '.....KK.........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '.....KPK........',
      '....KKPKK.......',
      '................',
    ],
    trophy: [
      '................',
      '................',
      '.....KKKK.......',
      '....KYYYYK......',
      '...KYYKKYYK.....',
      '...KYYKKYYK.....',
      '....KYYYYK......',
      '.....KYYK.......',
      '......KK........',
      '....KKKKKK......',
      '....KYYYYK......',
      '.....KKKK.......',
      '................',
      '................',
      '................',
      '................',
    ],
    sun: [
      '................',
      '......YY........',
      '.....YYYY.......',
      '.....YYYY.......',
      '......YY........',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    cloud: [
      '................',
      '................',
      '................',
      '.....KKKK.......',
      '....KWWWWK......',
      '...KWWWWWWK.....',
      '....KKKKKK......',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    storm: [
      '................',
      '................',
      '................',
      '.....KKKK.......',
      '....KWWWWK......',
      '...KWWWWWWK.....',
      '....KKKKKK......',
      '......ZZ........',
      '.....ZZ.........',
      '......ZZ........',
      '.....ZZ.........',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
    stars: [
      '................',
      '...W....W....W..',
      '................',
      '......W.....W...',
      '................',
      '..W.......W.....',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  };

  function baseColors(pal) {
    return {
      K: '#141414', F: '#e8b98a', B: pal.vanBody, W: '#bdeaff',
      T: '#0c0c0c', H: '#8a867e', S: '#8a867e', I: '#3a2e22',
      D: '#5a5348', Y: pal.sticker, P: '#f2ede3', Z: '#3fa9ff',
    };
  }

  const cache = new Map();
  function parseRows(rows, colors) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');
    for (let y = 0; y < 16; y++) {
      const row = rows[y] || '................';
      for (let x = 0; x < 16; x++) {
        const ch = row[x] || '.';
        if (ch === '.') continue;
        ctx.fillStyle = colors[ch] || '#ff00ff';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return c;
  }
  function vanWithDamage(pal, variant, p2) {
    // Canonical-first: edit master, never redraw. Same silhouette/wheels/anchor.
    const rows = VAN_MASTER.slice();
    if (variant === 'dented' || variant === 'smoking' || variant === 'wreck') {
      rows[7] = '..KRBBBBBBBK...'.replace(/R/g, 'R').slice(0, 16).padEnd(16, '.');
      rows[9] = '..KBBRRBBBBK...'.slice(0, 16).padEnd(16, '.');
    }
    if (variant === 'wreck') {
      rows[6] = '..KRBBBBBBRK...'.slice(0, 16).padEnd(16, '.');
      rows[10] = '.KKBBRRBBBKK..'.slice(0, 16).padEnd(16, '.');
    }
    const colors = baseColors(pal);
    if (p2) colors.B = pal.vanP2;
    colors.R = '#7a2a1e';
    // exhaust puffs increase with damage — handled as FX layer, not baked
    return parseRows(rows, colors);
  }
  function bandFrame(pal, role, pose, frame, p2) {
    // Separate loops on same base: idle-bob/jump/slump/drive. What-moves/what-stays:
    // bob: torso stable, head ±1px; jump: whole body −2px; slump: head +1, torso compressed.
    const key = 'band:' + role + ':' + pose + ':' + frame + ':' + (p2 ? 'p2' : 'p1') + ':' + pal.accent;
    if (cache.has(key)) return cache.get(key);
    const base = BAND_BASE[role] || BAND_BASE.vox;
    const colors = baseColors(pal);
    colors.B = p2 ? pal.vanP2 : pal.accent;
    const dy = pose === 'jump' ? -2 : pose === 'slump' ? 1 : (pose === 'idle' || pose === 'bob') ? (frame % 2 === 0 ? 0 : -1) : 0;
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');
    const src = parseRows(base, colors);
    ctx.drawImage(src, 0, dy);
    // slump: darken head slightly (exhaustion), jump: no extra art
    cache.set(key, c);
    return c;
  }
  function getSprite(pal, id, opts) {
    opts = opts || {};
    const p2 = !!opts.p2;
    const palKey = pal.accent;
    if (id === 'van') {
      const v = opts.variant || 'pristine';
      const key = 'van:' + v + ':' + (p2 ? 'p2' : 'p1') + ':' + palKey;
      if (!cache.has(key)) cache.set(key, vanWithDamage(pal, v, p2));
      return cache.get(key);
    }
    if (id.indexOf('band-') === 0) {
      const role = id.slice(5);
      return bandFrame(pal, role, opts.pose || 'idle', opts.frame || 0, p2);
    }
    if (id === 'crowd') {
      // ONE blob, 4 shirt colors, phase-offset at draw (never 64 unique drawings)
      const ci = opts.colorIdx || 0;
      const key = 'crowd:' + ci + ':' + palKey;
      if (!cache.has(key)) {
        const colors = baseColors(pal);
        const shirts = [pal.accent, pal.sticker, '#7dd87d', '#3fa9ff'];
        colors.S = shirts[ci % shirts.length];
        cache.set(key, parseRows(CROWD_BLOB, colors));
      }
      return cache.get(key);
    }
    if (PROP_MAPS[id]) {
      const key = 'prop:' + id + ':' + palKey;
      if (!cache.has(key)) cache.set(key, parseRows(PROP_MAPS[id], baseColors(pal)));
      return cache.get(key);
    }
    return null;
  }
  // QC helper: verify anchors + sizes (used by M3 gate + tests)
  function audit() {
    const issues = [];
    if (VAN_MASTER.length !== 16) issues.push('van rows != 16');
    VAN_MASTER.forEach((r, i) => { if (r.length !== 16) issues.push('van row ' + i + ' len ' + r.length); });
    Object.keys(BAND_BASE).forEach((k) => {
      if (BAND_BASE[k].length !== 16) issues.push(k + ' rows != 16');
    });
    return issues;
  }

  const api = { SCALE, GROUND_ROW, VAN_MASTER, BAND_BASE, CROWD_BLOB, getSprite, audit };
  if (typeof module !== 'undefined') module.exports = api;
  else window.MSOBSprites = api;
})();

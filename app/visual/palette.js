'use strict';
/* VISUAL palette — theme table. Reads active CSS accent so all five palettes re-skin neon/sign/sky.
   Pure + DOM-read only. No engine imports. */
(function () {
  const THEMES = {
    orange: { accent: '#ff5a1f', ink: '#161310' },
    pink:   { accent: '#ff3d8b', ink: '#1c0e14' },
    lime:   { accent: '#9dff2e', ink: '#131a08' },
    blue:   { accent: '#3fa9ff', ink: '#0d141b' },
    red:    { accent: '#ff4438', ink: '#1c0d0b' },
  };
  const STICKER = '#ffd23f';
  function currentTheme() {
    try {
      const t = document.documentElement.getAttribute('data-theme');
      if (t && THEMES[t]) return t;
    } catch (e) {}
    return 'orange';
  }
  function cssAccent() {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent');
      if (v && v.trim()) return v.trim();
    } catch (e) {}
    return THEMES[currentTheme()].accent;
  }
  function getPalette() {
    const theme = currentTheme();
    const base = THEMES[theme] || THEMES.orange;
    const accent = cssAccent();
    // Sky shifts subtly per theme but stays night-readable; sticker stays fixed.
    const skies = {
      orange: ['#0e0e18', '#1c1626'],
      pink:   ['#120e1c', '#241428'],
      lime:   ['#0c1410', '#16241a'],
      blue:   ['#0b1220', '#14253a'],
      red:    ['#160d0d', '#281414'],
    };
    const sky = skies[theme] || skies.orange;
    return {
      theme, accent, accentInk: base.ink, sticker: STICKER,
      skyTop: sky[0], skyBot: sky[1],
      ink: '#f2ede3', dim: '#a8a196', paper: '#131313',
      road: '#3a352f', roadEdge: '#5a5348',
      grass: '#1e2a1c', house: '#2a2622', houseLit: '#ffd23f',
      star: '#ffd23f', fail: '#8a867e', rest: '#ff4438',
      vanBody: accent, vanP2: '#f2ede3',
      crowdShirts: [accent, STICKER, '#7dd87d', '#3fa9ff'],
    };
  }
  if (typeof module !== 'undefined') module.exports = { THEMES, STICKER, currentTheme, cssAccent, getPalette };
  else { window.MSOBPalette = { THEMES, STICKER, currentTheme, cssAccent, getPalette }; }
})();

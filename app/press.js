'use strict';
/* MAIN STAGE OR BUST — client flavor hook. AI is the default: the game asks
   its own server (POST /api/flavor, key held in env) for headlines. The server
   may be absent (local files, no key) — any failure returns null and the
   offline house zine stays. Flavor ONLY: mechanics never read AI output. */
const Press = {
  KEY: 'msob-press-v1',
  cfg: { mode: 'ai' },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) { const o = JSON.parse(raw); if (o.mode === 'ai' || o.mode === 'offline') this.cfg.mode = o.mode; }
    } catch (e) {}
    return this.cfg;
  },
  save(cfg) {
    if (cfg && (cfg.mode === 'ai' || cfg.mode === 'offline')) this.cfg.mode = cfg.mode;
    try { localStorage.setItem(this.KEY, JSON.stringify({ mode: this.cfg.mode })); } catch (e) {}
    return this.cfg;
  },
  serverAvailable() {
    try { return typeof location !== 'undefined' && /^https?:/.test(location.protocol || ''); } catch (e) { return false; }
  },
  on() { return this.cfg.mode === 'ai' && this.serverAvailable(); },
  async enhance(kind, ctx) {
    if (!this.on()) return null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9500);
    try {
      const res = await fetch('/api/flavor', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, ctx }),
      });
      if (!res.ok) return null;
      const o = await res.json();
      if (typeof o.headline !== 'string' || typeof o.blurb !== 'string') return null;
      return { headline: o.headline.slice(0, 70), blurb: o.blurb.slice(0, 220), ai: true };
    } catch (e) { return null; }
    finally { clearTimeout(t); }
  },
};
if (typeof module !== 'undefined') module.exports = Press;

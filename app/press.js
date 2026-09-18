'use strict';
/* MAIN STAGE OR BUST — client flavor hook. Always server-first when a server
   is reachable (same-origin POST /api/flavor, key held in env); any failure
   returns null and the offline house zine stays. Flavor ONLY: mechanics never
   read this output, and the player is never told which pen wrote the flyer. */
const Press = {
  serverAvailable() {
    try { return typeof location !== 'undefined' && /^https?:/.test(location.protocol || ''); } catch (e) { return false; }
  },
  on() { return this.serverAvailable(); },
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

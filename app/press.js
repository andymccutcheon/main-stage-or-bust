'use strict';
/* MAIN STAGE OR BUST — optional AI flavor ("Hype Press"). BYOK, flavor ONLY.
   The engine never reads AI output. Any failure -> null -> offline copy stays. */
const Press = {
  KEY: 'rtw-press-v1',
  cfg: { mode: 'offline', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o-mini', key: '' },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) this.cfg = Object.assign(this.cfg, JSON.parse(raw));
    } catch (e) { /* private mode etc: stay offline */ }
    return this.cfg;
  },
  save(cfg) {
    this.cfg = Object.assign(this.cfg, cfg);
    try { localStorage.setItem(this.KEY, JSON.stringify({ mode: this.cfg.mode, endpoint: this.cfg.endpoint, model: this.cfg.model, key: this.cfg.key ? '***' : '' })); } catch (e) {}
    // NOTE: API key is kept in memory only, never persisted. Re-enter per session.
    return this.cfg;
  },
  on() { return this.cfg.mode === 'ai' && !!this.cfg.key; },
  async enhance(kind, ctx) {
    if (!this.on()) return null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    try {
      const sys = 'You write punk-zine show flyer copy. Reply with ONLY a JSON object {"headline": string (max 70 chars), "blurb": string (max 220 chars)}. No markdown, no other text. No real people, no slurs, keep it road-mythology, not factual claims.';
      const user = kind === 'flyer'
        ? `Band "${ctx.band}" (${ctx.genre || 'rock'}). Week ${ctx.week} at ${ctx.venue}: ${ctx.result} (show ${ctx.show} vs difficulty ${ctx.D}, +${ctx.fans} fans, +$${ctx.cash}, +${ctx.fame} fame). Write the flyer recap.`
        : `Band "${ctx.band}" (${ctx.genre || 'rock'}), week ${ctx.week} of 12, fame ${ctx.fame}, morale ${ctx.morale}/5. One hype sentence about the road ahead.`;
      const res = await fetch(this.cfg.endpoint.replace(/\/$/, '') + '/chat/completions', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.cfg.key },
        body: JSON.stringify({ model: this.cfg.model, temperature: 0.9, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const obj = JSON.parse(((data.choices || [])[0] || {}).message?.content || '{}');
      if (typeof obj.headline !== 'string' || typeof obj.blurb !== 'string') return null;
      return { headline: obj.headline.slice(0, 70), blurb: obj.blurb.slice(0, 220), ai: true };
    } catch (e) { return null; }
    finally { clearTimeout(t); }
  },
};
if (typeof module !== 'undefined') module.exports = Press;

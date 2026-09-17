'use strict';
/* MAIN STAGE OR BUST — server-side flavor proxy.
   Holds the OpenRouter key (env OPENROUTER_API_KEY) so browsers never see it.
   Vercel: POST /api/flavor {kind, ctx} -> {headline, blurb}. Any failure -> 5xx
   and the client silently falls back to the offline house zine. */
const MODEL_DEFAULT = 'opencode/muse-spark-1.3-contributor-free';
const ENDPOINT_DEFAULT = 'https://openrouter.ai/api/v1';

function cleanCtx(ctx) {
  ctx = ctx || {};
  const s = (v, n) => String(v == null ? '' : v).slice(0, n);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  return {
    band: s(ctx.band, 40), genre: s(ctx.genre, 24), venue: s(ctx.venue, 40),
    result: ctx.result === 'win' ? 'win' : 'fail',
    week: Math.min(99, parseInt(ctx.week, 10) || 1),
    show: num(ctx.show), D: num(ctx.D), fans: num(ctx.fans),
    cash: num(ctx.cash), fame: num(ctx.fame),
  };
}

function buildMessages(kind, c) {
  const sys = 'You write punk-zine show flyer copy. Reply with ONLY a JSON object {"headline": string (max 70 chars), "blurb": string (max 220 chars)}. No markdown, no other text. No real people, no slurs, road-mythology, not factual claims.';
  const user = kind === 'week'
    ? `Band "${c.band}" (${c.genre || 'rock'}), week ${c.week} of 12, fame ${c.fame}, morale ${c.morale}/5. One hype sentence about the road ahead.`
    : `Band "${c.band}" (${c.genre || 'rock'}). Week ${c.week} at ${c.venue}: ${c.result} (show ${c.show} vs difficulty ${c.D}, +${c.fans} fans, +$${c.cash}, +${c.fame} fame). Write the flyer recap.`;
  return [{ role: 'system', content: sys }, { role: 'user', content: user }];
}

function parseFlavor(data) {
  try {
    const text = ((data.choices || [])[0] || {}).message?.content;
    if (typeof text !== 'string') return null;
    const obj = JSON.parse(text);
    if (typeof obj.headline !== 'string' || typeof obj.blurb !== 'string') return null;
    if (!obj.headline.trim() || !obj.blurb.trim()) return null;
    return { headline: obj.headline.slice(0, 70), blurb: obj.blurb.slice(0, 220) };
  } catch (e) { return null; }
}

async function getFlavor(kind, ctx, opts) {
  opts = opts || {};
  const apiKey = opts.apiKey;
  if (!apiKey) throw new Error('missing api key');
  const fetchImpl = opts.fetchImpl || fetch;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 9000);
  try {
    const res = await fetchImpl((opts.endpoint || ENDPOINT_DEFAULT).replace(/\/$/, '') + '/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
        'HTTP-Referer': opts.siteUrl || '',
        'X-Title': 'Main Stage or Bust',
      },
      body: JSON.stringify({
        model: opts.model || MODEL_DEFAULT,
        temperature: 0.9, max_tokens: 150,
        response_format: { type: 'json_object' },
        messages: buildMessages(kind, ctx),
      }),
    });
    if (!res.ok) throw new Error('openrouter ' + res.status);
    return parseFlavor(await res.json());
  } finally { clearTimeout(t); }
}

async function handler(req, res) {
  try {
    if (!req || req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(501).json({ error: 'AI not configured' });
    const body = req.body || {};
    const out = await getFlavor(body.kind === 'week' ? 'week' : 'flyer', cleanCtx(body.ctx), {
      apiKey, model: process.env.OPENROUTER_MODEL || MODEL_DEFAULT,
      siteUrl: process.env.SITE_URL || '',
    });
    if (!out) return res.status(502).json({ error: 'bad AI output' });
    return res.status(200).json(out);
  } catch (e) { return res.status(502).json({ error: 'AI failed' }); }
}

module.exports = handler;
module.exports.getFlavor = getFlavor;
module.exports.parseFlavor = parseFlavor;
module.exports.buildMessages = buildMessages;
module.exports.cleanCtx = cleanCtx;
module.exports.MODEL_DEFAULT = MODEL_DEFAULT;

'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const F = require('../api/flavor.js');

const goodFetch = (content) => async () => ({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });
const J = (h, b) => JSON.stringify({ headline: h, blurb: b });

test('cleanCtx caps + defaults hostile input', () => {
  const c = F.cleanCtx({ band: 'x'.repeat(99), result: 'maybe', week: 'zzz', show: 'NaN', extra: '<script>' });
  assert.equal(c.band.length, 40);
  assert.equal(c.result, 'fail');
  assert.equal(c.week, 1);
  assert.equal(c.show, 0);
  assert.ok(!('extra' in c));
});

test('buildMessages demands JSON-only copy', () => {
  const [sys, user] = F.buildMessages('flyer', F.cleanCtx({ band: 'A', venue: 'V', result: 'win', show: 9, D: 8, fans: 2, cash: 4, fame: 1, week: 3 }));
  assert.match(sys.content, /ONLY a JSON object/);
  assert.match(user.content, /Band "A"/);
});

test('parseFlavor validates + caps', () => {
  const ok = F.parseFlavor({ choices: [{ message: { content: J('H'.repeat(100), 'B'.repeat(300)) } }] });
  assert.equal(ok.headline.length, 70);
  assert.equal(ok.blurb.length, 220);
  assert.equal(F.parseFlavor({ choices: [{ message: { content: J('', '') } }] }), null);
  assert.equal(F.parseFlavor({ choices: [{ message: { content: '{"nope":1}' } }] }), null);
  assert.equal(F.parseFlavor({ choices: [{ message: { content: 'not json' } }] }), null);
  assert.equal(F.parseFlavor({}), null);
});

test('getFlavor posts to OpenRouter with key + default model', async () => {
  let seen = null;
  const fake = async (url, opts) => { seen = { url, opts }; return goodFetch(J('Hi', 'There'))(); };
  const out = await F.getFlavor('flyer', { band: 'A' }, { apiKey: 'sk-test', fetchImpl: fake });
  assert.deepEqual(out, { headline: 'Hi', blurb: 'There' });
  assert.match(seen.url, /openrouter\.ai\/api\/v1\/chat\/completions/);
  assert.equal(seen.opts.headers.Authorization, 'Bearer sk-test');
  const body = JSON.parse(seen.opts.body);
  assert.equal(body.model, F.MODEL_DEFAULT);
  assert.equal(body.response_format.type, 'json_object');
});

test('getFlavor honors model override, throws without key / on HTTP error', async () => {
  await assert.rejects(() => F.getFlavor('flyer', {}, {}), /missing api key/);
  await assert.rejects(() => F.getFlavor('flyer', {}, { apiKey: 'k', fetchImpl: async () => ({ ok: false, status: 401 }) }), /401/);
  await assert.rejects(() => F.getFlavor('flyer', {}, { apiKey: 'k', fetchImpl: async () => { throw new Error('down'); } }), /down/);
  let seen = null;
  await F.getFlavor('flyer', {}, { apiKey: 'k', model: 'other/model', fetchImpl: async (u, o) => { seen = o; return goodFetch(J('a', 'b'))(); } });
  assert.equal(JSON.parse(seen.body).model, 'other/model');
});

test('handler: method guard, missing key, happy path, bad AI output', async () => {
  const run = (req, env) => {
    const old = process.env.OPENROUTER_API_KEY;
    if (env === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = env;
    return new Promise((resolve) => {
      F(req, { status: (code) => ({ json: (obj) => {
        if (old === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = old;
        resolve({ code, obj });
      } }) });
    });
  };
  assert.equal((await run({ method: 'GET' }, 'k')).code, 405);
  assert.equal((await run({ method: 'POST', body: {} })).code, 501);
  const realFetch = global.fetch;
  global.fetch = goodFetch(J('H', 'B'));
  try {
    const ok = await run({ method: 'POST', body: { kind: 'flyer', ctx: { band: 'A' } } }, 'k');
    assert.equal(ok.code, 200);
    assert.deepEqual(ok.obj, { headline: 'H', blurb: 'B' });
    global.fetch = goodFetch('garbage');
    assert.equal((await run({ method: 'POST', body: {} }, 'k')).code, 502);
  } finally { global.fetch = realFetch; }
});

'use strict';
/* Local dev server: static files + /api/flavor proxy (uses OPENROUTER_API_KEY
   from env when present, otherwise the endpoint 501s and the game runs the
   offline house zine). Usage: OPENROUTER_API_KEY=sk-or-... npm start */
const http = require('http');
const fs = require('fs');
const path = require('path');
const flavor = require('./api/flavor.js');
const CT = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.ttf': 'font/ttf', '.json': 'application/json' };

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/flavor' && req.method === 'POST') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      let body = {};
      try { body = JSON.parse(raw || '{}'); } catch (e) {}
      flavor({ body, method: 'POST' }, {
        status: (code) => ({ json: (obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); } }),
      });
    });
    return;
  }
  let f = path.join(process.cwd(), decodeURIComponent(u.pathname));
  if (u.pathname.endsWith('/')) f = path.join(f, 'index.html');
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': CT[path.extname(f)] || 'text/html' });
    res.end(d);
  });
}).listen(8080, () => console.log('MAIN STAGE OR BUST game: http://localhost:8080/app/ | print: http://localhost:8080/print/sheet.html'));

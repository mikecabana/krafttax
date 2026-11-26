// Local preview: serves index.html and runs api/waitlist.js against an
// in-memory fake of the Upstash REST API. Not used in production.
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = process.env.PORT || 3000;
const set = new Set();

const readBody = async (req) => {
  let s = '';
  for await (const c of req) s += c;
  return s;
};

if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
  process.env.KV_REST_API_URL = `http://localhost:${PORT}/__redis`;
  process.env.KV_REST_API_TOKEN = 'dev';
}
const { default: handler } = await import('./api/waitlist.js');

http.createServer(async (req, res) => {
  if (req.url === '/__redis/pipeline') {
    const cmds = JSON.parse(await readBody(req));
    const out = cmds.map(([op, , v]) => {
      if (op === 'SADD') { const had = set.has(v); set.add(v); return { result: had ? 0 : 1 }; }
      if (op === 'SCARD') return { result: set.size };
      return { result: 1 };
    });
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(out));
  }
  if (req.url === '/api/waitlist') {
    req.body = await readBody(req);
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    return handler(req, res);
  }
  const types = { html: 'text/html; charset=utf-8', png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain; charset=utf-8', xml: 'application/xml' };
  const name = new URL(req.url, 'http://x').pathname.slice(1) || 'index.html';
  if (!/^[\w-]+\.(html|png|svg|txt|xml)$/.test(name)) { res.statusCode = 404; return res.end('Not found'); }
  try {
    const file = await readFile(new URL(`./${name}`, import.meta.url));
    res.setHeader('Content-Type', types[name.split('.').pop()]);
    res.end(file);
  } catch { res.statusCode = 404; res.end('Not found'); }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));

// Local preview: serves the site and stands in for the Google Sheet with an
// in-memory list. Not used in production.
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = process.env.PORT || 3000;
const emails = new Set();
const types = { html: 'text/html; charset=utf-8', png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain; charset=utf-8', xml: 'application/xml' };

http.createServer(async (req, res) => {
  if (req.url === '/__sheet') {
    let raw = '';
    for await (const c of req) raw += c;
    const { email = '' } = JSON.parse(raw || '{}');
    const already = emails.has(email);
    emails.add(email);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, already, count: emails.size }));
  }
  const name = new URL(req.url, 'http://x').pathname.slice(1) || 'index.html';
  if (!/^[\w-]+\.(html|png|svg|txt|xml)$/.test(name)) { res.statusCode = 404; return res.end('Not found'); }
  try {
    let file = await readFile(new URL(`./${name}`, import.meta.url));
    if (name === 'index.html') file = file.toString().replace('PASTE_APPS_SCRIPT_URL_HERE', '/__sheet');
    res.setHeader('Content-Type', types[name.split('.').pop()]);
    res.end(file);
  } catch { res.statusCode = 404; res.end('Not found'); }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));

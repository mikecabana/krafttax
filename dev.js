// Local preview: serves the site and stands in for the Google Form by logging
// signups to the console. Not used in production.
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = process.env.PORT || 3000;
const rows = [];
const types = { html: 'text/html; charset=utf-8', png: 'image/png', svg: 'image/svg+xml', txt: 'text/plain; charset=utf-8', xml: 'application/xml' };

http.createServer(async (req, res) => {
  if (req.url === '/__form') {
    let raw = '';
    for await (const c of req) raw += c;
    rows.push(Object.fromEntries(new URLSearchParams(raw)));
    console.log('signup', rows.at(-1));
    return res.end('ok');
  }
  const name = new URL(req.url, 'http://x').pathname.slice(1) || 'index.html';
  if (!/^[\w-]+\.(html|png|svg|txt|xml)$/.test(name)) { res.statusCode = 404; return res.end('Not found'); }
  try {
    let file = await readFile(new URL(`./${name}`, import.meta.url));
    if (name === 'index.html') file = file.toString().replace('PASTE_GOOGLE_FORM_RESPONSE_URL_HERE', '/__form');
    res.setHeader('Content-Type', types[name.split('.').pop()]);
    res.end(file);
  } catch { res.statusCode = 404; res.end('Not found'); }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));

// POST /api/waitlist  { email, lang }
// Stores emails in a Redis set via the Upstash REST API (no dependencies).
// Env: KV_REST_API_URL + KV_REST_API_TOKEN (Vercel Marketplace Upstash integration)
//   or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let body = req.body ?? {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Honeypot: bots fill the hidden field. Pretend it worked.
  if (body.website) return res.status(200).json({ ok: true });

  const email = String(body.email ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  const lang = body.lang === 'fr' ? 'fr' : 'en';

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.error('waitlist: Redis env vars are not set');
    return res.status(500).json({ error: 'not_configured' });
  }

  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['SADD', 'waitlist', email],
        ['HSETNX', 'waitlist:meta', email, JSON.stringify({ at: new Date().toISOString(), lang })],
        ['SCARD', 'waitlist'],
      ]),
    });
    const out = await r.json();
    if (!r.ok || !Array.isArray(out) || out.some((x) => x.error)) {
      throw new Error(`redis ${r.status}: ${JSON.stringify(out)}`);
    }
    return res.status(200).json({ ok: true, already: out[0].result === 0, count: out[2].result });
  } catch (err) {
    console.error('waitlist: store failed', err);
    return res.status(502).json({ error: 'store_failed' });
  }
}

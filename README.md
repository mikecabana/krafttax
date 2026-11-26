# krafttax

Wait list page asking one question: *Would you pay to send a box of Kraft Dinner to Soraya Martinez Ferrada?*

If enough people sign up, the full app gets built.

## What's here

- `index.html`: the whole page (inline CSS and JS, EN/FR toggle). No backend.
- `apps-script/Code.gs`: Google Apps Script that appends each signup to a Google Sheet.
- `dev.js`: local preview server with a fake in-memory list.

## Run locally

```sh
npm run dev   # http://localhost:3000
```

## Connect the Google Sheet

1. Create a Google Sheet. Open Extensions > Apps Script.
2. Replace the editor contents with `apps-script/Code.gs` and save.
3. Deploy > New deployment > type "Web app". Set "Execute as" to **Me** and
   "Who has access" to **Anyone**. Authorize when asked.
4. Copy the web app URL (it ends in `/exec`) and paste it into `index.html` in place of
   `PASTE_APPS_SCRIPT_URL_HERE`.

Signups land in the first tab as rows: timestamp, email, language. Duplicates are skipped.
If you edit the script later, publish it with Deploy > Manage deployments > edit > New version;
the URL stays the same.

## Deploy

It is a static site: any host works (Cloudflare Pages, Vercel, GitHub Pages).
No build command; the output directory is the repo root.

## Sharing and discovery

- `og.png` (1200x630) and `apple-touch-icon.png` are rendered from `design/og.html` and `favicon.svg`
  with `node design/render.cjs` (needs Playwright).
- `index.html` carries Open Graph and Twitter tags plus JSON-LD (`WebSite`, `WebPage`, `FAQPage`).
  The FAQ JSON-LD mirrors the visible FAQ; keep the two in sync.
- `robots.txt`, `sitemap.xml` and `llms.txt` are served from the root.
- `?lang=fr` opens the page in French.

The site URL is hardcoded as `https://krafttax.vercel.app`. If the real domain differs,
replace it in `index.html`, `robots.txt`, `sitemap.xml` and `llms.txt`.

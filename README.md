# krafttax

Wait list page asking one question: *Would you pay to send a box of Kraft Dinner to Soraya Martinez Ferrada?*

If enough people sign up, the full app gets built.

## What's here

- `index.html`: the whole page (inline CSS and JS, EN/FR toggle). No backend.
- `dev.js`: local preview server that logs signups to the console.

## Run locally

```sh
npm run dev   # http://localhost:3000
```

## Connect the Google Form

Signups are submitted to a Google Form, which writes them to a Google Sheet.
Visitors never see the form itself.

1. Create a Google Form with three short-answer questions: "Email", "Language" and "Price".
2. Responses > Link to Sheets, and pick the sheet.
3. Settings: do not require sign-in, do not limit to one response.
4. In `index.html`, set `FORM_URL` to `https://docs.google.com/forms/d/e/<form id>/formResponse`
   and `FIELD_EMAIL` / `FIELD_LANG` / `FIELD_PRICE` to the questions' `entry.<number>` names
   (visible in the form's public page source, or via "Get pre-filled link").

Google returns nothing readable to the page, so duplicates are not detected:
de-duplicate in the sheet when counting.

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

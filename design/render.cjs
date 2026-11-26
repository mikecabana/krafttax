// Renders og.png and apple-touch-icon.png into the repo root.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(__dirname, 'og.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(root, 'og.png') });
  await p.setViewportSize({ width: 180, height: 180 });
  const svg = fs.readFileSync(path.join(root, 'favicon.svg'), 'utf8').replace('rx="12"', 'rx="0"');
  await p.setContent(`<body style="margin:0">${svg.replace('<svg ', '<svg width="180" height="180" ')}`);
  await p.screenshot({ path: path.join(root, 'apple-touch-icon.png') });
  await b.close();
})();

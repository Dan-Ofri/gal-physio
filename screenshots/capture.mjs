import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// The section list, the viewports (mobile first) and the output names live in
// one place, shared with the pruner and check:tidy.
import { sections, viewports, shotName } from '../scripts/screenshots-layout.mjs';
import { pruneScreenshots } from '../scripts/prune-screenshots.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Clear out investigation folders nobody has touched in 30 days, so this
// directory stays the size of the twelve files below. Prints what it removed.
pruneScreenshots();

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// Point at a preview/dev server on another port with:  BASE_URL=... node capture.mjs
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321/';

const page = await browser.newPage();

for (const { key, width, height, deviceScaleFactor } of viewports) {
  await page.setViewport({ width, height, deviceScaleFactor });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });

  // Walk the whole page first, then wait for every image to finish decoding.
  // Without this the lazy images below the fold have not loaded by the time
  // their section is captured, and the shot shows an empty white card — the
  // screenshots look like a layout bug that is not there.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? null
          : new Promise((r) => {
              img.onload = img.onerror = r;
            })
      )
    )
  );
  // Settle the scroll-reveal sections so nothing is caught mid-fade.
  await page.evaluate(() =>
    document.querySelectorAll('.reveal-init').forEach((el) => el.classList.add('reveal-in'))
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 800));

  for (const { name, selector } of sections) {
    try {
      const el = await page.$(selector);
      if (el) {
        const absoluteY = await page.evaluate(
          (node) => node.getBoundingClientRect().top + window.scrollY,
          el
        );
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), absoluteY);
        await new Promise((r) => setTimeout(r, 500));
        const outPath = join(__dirname, shotName(key, name));
        await page.screenshot({ path: outPath });
        console.log(`✓ ${key}-${name}`);
      }
    } catch (e) {
      console.error(`✗ ${key}-${name}: ${e.message}`);
    }
  }
}

await browser.close();
console.log('Done.');

import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sections = [
  { name: 'hero', selector: 'body' },
  { name: 'services', selector: '#services' },
  { name: 'about', selector: '#about' },
  { name: 'testimonials', selector: '#testimonials' },
  { name: 'contact', selector: '#contact' },
  { name: 'footer', selector: 'footer[aria-label]' },
];

// Mobile-first: most visitors are on a phone (see CLAUDE.md), so mobile is captured
// by default alongside desktop, not as an opt-in extra.
const viewports = [
  { key: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 }, // iPhone 12/13/14-class
  { key: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

for (const { key, width, height, deviceScaleFactor } of viewports) {
  await page.setViewport({ width, height, deviceScaleFactor });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1500));

  for (const { name, selector } of sections) {
    try {
      const el = await page.$(selector);
      if (el) {
        const absoluteY = await page.evaluate(
          (node) => node.getBoundingClientRect().top + window.scrollY,
          el
        );
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), absoluteY);
        await new Promise((r) => setTimeout(r, 700));
        const outPath = join(__dirname, `${key}-${name}.png`);
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

import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle0' });
const els = await page.$$('section');
for (const s of els) {
  const label = await s.evaluate((n) => n.getAttribute('aria-label') || '');
  if (label.includes('ציטוט')) {
    const y = await s.evaluate((n) => n.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((yp) => window.scrollTo({ top: yp, behavior: 'instant' }), y);
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: 'screenshots/quote.png' });
    console.log('captured');
    break;
  }
}
await browser.close();

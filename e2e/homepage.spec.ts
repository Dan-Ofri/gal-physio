import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads with correct title, lang and no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);

    await expect(page).toHaveTitle(/גל עופרי/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    expect(consoleErrors).toEqual([]);
  });

  test('renders every marketing section', async ({ page }) => {
    await page.goto('/');

    for (const selector of ['#hero', '#about', '#services', '#testimonials', '#contact']) {
      await expect(page.locator(selector)).toBeVisible();
    }
    await expect(page.locator('footer[aria-label]')).toBeAttached();
  });

  test('skip link moves focus to main content', async ({ page, browserName }) => {
    // WebKit only puts links in the Tab order with "Full Keyboard Access"
    // enabled (off by default on macOS/iOS Safari) — a browser-vendor
    // default, not a site bug, and irrelevant on a touch-first mobile
    // device. Desktop Chrome covers the keyboard-Tab path.
    test.skip(browserName === 'webkit', 'Safari does not Tab to links by default');

    await page.goto('/');
    const skipLink = page.getByRole('link', { name: 'דלג לתוכן הראשי' });

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    await skipLink.click();
    await expect(page.locator('#main-content')).toBeFocused();
  });

  // Regression: the testimonials carousel's clipped content used to count
  // towards <html>'s scrollable overflow, so scrolling down to the reviews made
  // the whole document 801px wide at a 390px viewport. The page could then be
  // swiped sideways off its own content into a blank screen. Every ancestor of
  // the scroller reported the right width — only the root did not — so this has
  // to be asserted on the document element, and it only appears once the section
  // has actually been scrolled to.
  test('the document never becomes horizontally scrollable', async ({ page }) => {
    await page.goto('/');

    // Prime every section first. While a section is still mid-reveal it carries
    // a `transform`, and that transform contains the carousel's overflow — the
    // document only grows once the transition ends and `transform` goes back to
    // `none`. Measuring straight after a scroll therefore reported a clean 390px
    // and made this test silently vacuous.
    //
    // Walk the sections themselves rather than scrolling by pixel offsets: under
    // parallel workers the stepped scrolls coalesce before the reveal observer
    // samples them, so a mid-page section could be skipped entirely and never
    // reveal at all. Waiting on each section's own transform is deterministic.
    const sections = page.locator('main section');
    for (let i = 0; i < (await sections.count()); i++) {
      const section = sections.nth(i);
      await section.scrollIntoViewIfNeeded();
      await expect(section, 'section never finished revealing').toHaveCSS('transform', 'none', {
        timeout: 15_000,
      });
    }

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    for (let y = 0; y <= pageHeight; y += 400) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);

      const { scrollWidth, clientWidth, panned } = await page.evaluate(() => {
        // In RTL the overflow sits to the left, so the page pans to a negative
        // scrollX. Ask the browser to go both ways and see if it moves at all.
        window.scrollTo({ left: -600, top: window.scrollY, behavior: 'instant' });
        const left = window.scrollX;
        window.scrollTo({ left: 600, top: window.scrollY, behavior: 'instant' });
        const right = window.scrollX;
        window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' });
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          panned: Math.max(Math.abs(left), Math.abs(right)),
        };
      });

      expect(scrollWidth, `document overflows horizontally at scrollY=${y}`).toBeLessThanOrEqual(
        clientWidth
      );
      expect(panned, `page pans sideways at scrollY=${y}`).toBeLessThanOrEqual(2);
    }
  });

  test('the testimonials carousel still scrolls and snaps', async ({ page }) => {
    await page.goto('/');
    const scroller = page.locator('#testimonials [role="group"]').first();
    await scroller.scrollIntoViewIfNeeded();

    const isCarousel = await scroller.evaluate(
      (el) => getComputedStyle(el).overflowX !== 'visible'
    );
    test.skip(!isCarousel, 'plain grid at this viewport, nothing to scroll');

    const moved = await scroller.evaluate((el) => {
      el.scrollLeft = -250;
      const after = el.scrollLeft;
      el.scrollLeft = 0;
      return Math.abs(after);
    });
    expect(moved, 'carousel did not scroll').toBeGreaterThan(50);
  });

  // Regression: the dot observer selected `article[id^="testimonial-card-"]`.
  // When the cards became `<div role="listitem">` to fix a list-role audit, the
  // selector matched nothing, so the observer watched nothing and every dot
  // stayed grey and 8px wide forever. Nothing threw, so only looking caught it.
  test('the pagination dot follows the card on screen', async ({ page }) => {
    await page.goto('/');
    const scroller = page.locator('#testimonials [role="group"]').first();
    await scroller.scrollIntoViewIfNeeded();

    const isCarousel = await scroller.evaluate(
      (el) => getComputedStyle(el).overflowX !== 'visible'
    );
    test.skip(!isCarousel, 'plain grid at this viewport, no dots to sync');

    const activeIndex = async () =>
      page.evaluate(() =>
        [...document.querySelectorAll('.testimonial-dot')].findIndex(
          (d) => (d as HTMLElement).dataset.active === 'true'
        )
      );

    await expect.poll(activeIndex, { message: 'no dot active on the first card' }).toBe(0);

    const step = await scroller.evaluate((el) => {
      const card = el.querySelector('[id^="testimonial-card-"]') as HTMLElement;
      return card.getBoundingClientRect().width + 20;
    });
    await scroller.evaluate((el, s) => (el.scrollLeft = -s), step);
    await expect
      .poll(activeIndex, { message: 'the dot did not follow to the second card' })
      .toBe(1);
  });
});

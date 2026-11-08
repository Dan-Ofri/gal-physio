import { test, expect } from '@playwright/test';

// The footer's legal line: copyright, and the credits for the photographer and the builder.
// The photographer's name is the business name written in the photos' own metadata
// ("© 2026 Yasmin Photography"); changing it needs her say, so it is pinned here.
test.describe('footer legal line', () => {
  test('carries the copyright notice and both credits', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('#site-footer');
    const year = new Date().getFullYear();
    await expect(footer).toContainText(`© ${year} גל עופרי. כל הזכויות שמורות.`);
    await expect(footer).toContainText('צילום: Yasmin Photography');
    await expect(footer).toContainText('בניית האתר: דן עופרי');
  });

  test('is on every page that has the footer', async ({ page }) => {
    for (const path of ['/faq/', '/privacy/', '/accessibility/', '/cancellation/']) {
      await page.goto(path);
      await expect(page.locator('#site-footer')).toContainText('כל הזכויות שמורות.');
    }
  });

  // From a 320px phone to a wide desktop: the credit line wraps instead of pushing the page sideways,
  // and it never sits under the sticky call bar or outside the viewport.
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    test(`fits at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const legal = page.locator('#site-footer').getByText('כל הזכויות שמורות.');
      await legal.scrollIntoViewIfNeeded();
      const credits = page.locator('#site-footer').getByText('בניית האתר: דן עופרי');
      for (const el of [legal, credits]) {
        const box = (await el.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

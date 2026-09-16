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
});

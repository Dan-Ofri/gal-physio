import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SITE } from '../src/data/site';

// The suite's default storage state has the banner already answered (see
// playwright.config.ts). Here it starts unanswered, like a first visit.
test.use({ storageState: { cookies: [], origins: [] } });

const GTAG = /googletagmanager\.com\/gtag\/js/;

// Google is stubbed, so the suite never touches the network: what is asserted is
// whether the page asks for the tag, and what it puts on the dataLayer.
async function stubGoogle(page: Page) {
  const requests: string[] = [];
  await page.route(GTAG, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: '' });
  });
  return requests;
}

const banner = (page: Page) => page.locator('#consent-banner');
const events = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [])
      .map((entry) => Array.from(entry))
      .filter((entry) => entry[0] === 'event')
  );

test.describe('analytics consent', () => {
  test('first visit: the banner appears and nothing from Google is requested', async ({ page }) => {
    const requests = await stubGoogle(page);
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await page.waitForTimeout(500);
    expect(requests).toEqual([]);
    expect((await page.context().cookies()).filter((c) => c.name.startsWith('_ga'))).toEqual([]);
  });

  test('accepting loads the tag once, remembers the answer and does not ask again', async ({
    page,
  }) => {
    const requests = await stubGoogle(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'אישור' }).click();
    await expect(banner(page)).toBeHidden();
    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toContain(`id=${SITE.analyticsId}`);
    expect(await page.evaluate(() => localStorage.getItem('gal-consent'))).toBe('granted');

    await page.reload();
    await page.waitForTimeout(1500);
    await expect(banner(page)).toBeHidden();
    await expect.poll(() => requests.length).toBe(2);
  });

  test('declining loads nothing, now or on the next visit', async ({ page }) => {
    const requests = await stubGoogle(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'לא תודה' }).click();
    await expect(banner(page)).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('gal-consent'))).toBe('denied');

    await page.reload();
    await page.waitForTimeout(1500);
    await expect(banner(page)).toBeHidden();
    expect(requests).toEqual([]);
    expect(await events(page)).toEqual([]);
  });

  test('"הגדרות עוגיות" in the footer reopens it, and withdrawing consent clears the cookies', async ({
    page,
    context,
    baseURL,
  }) => {
    await stubGoogle(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'אישור' }).click();
    await expect(banner(page)).toBeHidden();
    // What gtag.js would have written.
    await context.addCookies([{ name: '_ga', value: 'GA1.1.1.1', url: baseURL! }]);

    const settings = page.locator('footer').getByRole('button', { name: 'הגדרות עוגיות' });
    await settings.scrollIntoViewIfNeeded();
    await settings.click();
    await expect(banner(page)).toBeVisible();
    await banner(page).getByRole('button', { name: 'לא תודה' }).click();
    await expect(banner(page)).toBeHidden();

    expect(await page.evaluate(() => localStorage.getItem('gal-consent'))).toBe('denied');
    expect((await context.cookies()).filter((c) => c.name.startsWith('_ga'))).toEqual([]);
    // Focus goes back to the button that opened it.
    await expect(settings).toBeFocused();
  });

  test('the privacy page carries the same control', async ({ page }) => {
    await page.goto('/privacy/');
    await page.getByRole('main').getByRole('button', { name: 'הגדרות עוגיות' }).click();
    await expect(banner(page)).toBeVisible();
  });

  test('after consent, a tap on the phone or WhatsApp link is counted, with where it was', async ({
    page,
  }) => {
    await stubGoogle(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'אישור' }).click();
    await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));

    const phone = page.locator(`#contact a[href="tel:${SITE.phoneE164}"]:visible`).first();
    await phone.scrollIntoViewIfNeeded();
    await phone.click();
    // Whichever WhatsApp link this viewport shows: the sticky bar on a phone,
    // the header or contact section on a desktop.
    await page.locator('a[href^="https://wa.me/"]:visible').first().click();

    const sent = await events(page);
    expect(sent.map((entry) => entry[1])).toEqual(['phone_click', 'whatsapp_click']);
    expect(sent[0][2]).toEqual({ link_location: 'contact' });
    expect(sent[1][2]).toEqual({ link_location: expect.stringMatching(/^[a-z_-]+$/) });
  });

  test('a delivered contact form counts as one lead and carries nothing from the form', async ({
    page,
  }) => {
    await stubGoogle(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'אישור' }).click();
    await page.route('https://api.web3forms.com/submit', (route) => {
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
      if (route.request().method() === 'OPTIONS')
        return route.fulfill({ status: 204, headers: cors });
      return route.fulfill({
        status: 200,
        headers: cors,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
    await page.locator('#contact-name').fill('בדיקה');
    await page.locator('#contact-phone').fill('0501234567');
    await page.locator('#submit-btn').click();
    await expect(page.locator('#form-success')).toBeVisible();
    expect(await events(page)).toEqual([['event', 'generate_lead', { method: 'contact_form' }]]);
  });

  test('without consent nothing is counted', async ({ page }) => {
    await stubGoogle(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'לא תודה' }).click();
    await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
    await page.locator(`a[href="tel:${SITE.phoneE164}"]:visible`).first().click();
    expect(await events(page)).toEqual([]);
  });

  test('it stays small and clear of the sticky call bar', async ({ page, viewport }) => {
    await stubGoogle(page);
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    // Past the 220ms fade-in.
    await page.waitForTimeout(400);
    const box = (await banner(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport!.height);

    const bar = page.locator('#quick-contact-bar');
    if (await bar.isVisible()) {
      // A phone: the bar is on screen, and the banner sits above it.
      const barBox = (await bar.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(barBox.y);
      // At most about a fifth of the screen.
      expect(box.height).toBeLessThan(viewport!.height * 0.22);
    } else {
      expect(box.width).toBeLessThan(480);
    }
  });

  test('it has no automatic WCAG 2.1 AA violations', async ({ page }) => {
    await stubGoogle(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('#consent-banner')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('it does not take focus, and both answers are reachable by keyboard', async ({ page }) => {
    await stubGoogle(page);
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    expect(
      await page.evaluate(() => document.activeElement?.closest('#consent-banner'))
    ).toBeNull();
    await banner(page).getByRole('button', { name: 'אישור' }).focus();
    await page.keyboard.press('Tab');
    await expect(banner(page).getByRole('button', { name: 'לא תודה' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(banner(page)).toBeHidden();
  });
});

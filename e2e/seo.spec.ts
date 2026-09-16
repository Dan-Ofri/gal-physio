import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  test('homepage has canonical, OG and Twitter tags with an absolute image URL', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /^https?:\/\//);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', /.+/);

    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    );
  });

  test('homepage ships valid LocalBusiness structured data', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(raw).toBeTruthy();

    const json = JSON.parse(raw!);
    expect(json['@type']).toContain('LocalBusiness');
    expect(json.telephone).toMatch(/^\+/);
    expect(json.address?.addressCountry).toBeTruthy();
    // priceRange is intentionally omitted until Gal confirms one — see CLAUDE.md.
    expect(json.priceRange).toBeUndefined();
  });

  test('favicon and manifest links resolve', async ({ page, request }) => {
    await page.goto('/');

    for (const selector of [
      'link[rel="icon"][type="image/svg+xml"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="manifest"]',
    ]) {
      const href = await page.locator(selector).first().getAttribute('href');
      expect(href, `missing href for ${selector}`).toBeTruthy();
      const res = await request.get(href!);
      expect(res.ok(), `${selector} -> ${href} returned ${res.status()}`).toBeTruthy();
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('nav link scrolls to the matching section', async ({ page }) => {
    await page.goto('/');
    const isMobile = (page.viewportSize()?.width ?? 0) < 1024;

    if (isMobile) {
      await page.getByRole('button', { name: 'פתח תפריט ניווט' }).click();
      await expect(page.locator('#mobile-menu')).toHaveAttribute('data-open', 'true');
      await page.locator('#mobile-menu nav').getByRole('link', { name: 'אודות' }).click();
    } else {
      await page
        .getByRole('navigation', { name: 'ניווט ראשי' })
        .getByRole('link', { name: 'אודות' })
        .click();
    }

    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('mobile menu opens, traps focus context and closes on Escape', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'desktop has no hamburger menu');
    await page.goto('/');

    const toggle = page.getByRole('button', { name: 'פתח תפריט ניווט' });
    await toggle.click();

    const menu = page.locator('#mobile-menu');
    await expect(menu).toHaveAttribute('data-open', 'true');
    await expect(page.locator('#main-content')).toHaveAttribute('inert', '');

    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('data-open', 'false');
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '');
  });
});

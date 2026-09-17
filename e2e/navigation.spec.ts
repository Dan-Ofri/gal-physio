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
    // The site footer and the sticky action bar are body children too, not
    // descendants of <main> — both were previously left focusable behind the
    // aria-modal dialog, so assert the whole backdrop, not just <main>.
    await expect(page.locator('#site-footer')).toHaveAttribute('inert', '');
    await expect(page.locator('header#site-header')).toHaveAttribute('inert', '');

    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('data-open', 'false');
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '');
    await expect(page.locator('#site-footer')).not.toHaveAttribute('inert', '');
    await expect(page.locator('header#site-header')).not.toHaveAttribute('inert', '');
  });

  test('everything behind the open menu is inert', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'desktop has no hamburger menu');
    await page.goto('/');
    await page.getByRole('button', { name: 'פתח תפריט ניווט' }).click();
    await expect(page.locator('#mobile-menu')).toHaveAttribute('data-open', 'true');

    // The invariant, rather than a list of known elements: every top-level
    // sibling of the dialog must be inert. Naming them individually is what
    // failed before — `querySelector('footer')` matched the sr-only <footer>
    // inside Quote's blockquote, and the sticky action bar was never covered
    // at all, so Tab walked out of an aria-modal dialog into both.
    await expect(
      page.locator('body > *:not(#mobile-menu):not(script):not([inert])'),
      'a sibling of the open dialog is still reachable'
    ).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toHaveAttribute('data-open', 'false');
    await expect(
      page.locator('body > *[inert]'),
      'inert was left behind after closing the menu'
    ).toHaveCount(0);
  });
});

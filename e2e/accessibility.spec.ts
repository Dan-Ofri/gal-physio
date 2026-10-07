import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// eslint-plugin-jsx-a11y (run at lint time) only checks the static .astro
// markup. This runs axe-core against the rendered DOM to catch computed
// issues static analysis can't see: color contrast, focus order, ARIA tree.
const pages = ['/', '/privacy', '/accessibility', '/cancellation', '/faq'];

for (const path of pages) {
  test(`${path} has no automatic WCAG 2.1 AA violations`, async ({ page }) => {
    // Reduced motion snaps the scroll-reveal/fade-up animations straight to
    // their end state (see global.css), so contrast is measured on the
    // settled page rather than mid-fade, where opacity < 1 would read as a
    // false-positive contrast failure.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    // axe tags each rule with the WCAG version that introduced it, so 'wcag2aa'
    // alone stops at 2.0 - the suite ran that way, under a 2.1 title, until
    // Oct 2026. The 2.1 tags add the criteria that version brought in, mostly
    // for phones (orientation, text spacing, input purpose).
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

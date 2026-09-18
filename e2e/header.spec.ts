import { test, expect } from '@playwright/test';

// Header-specific guards. Each behaviour here shipped broken once and was
// caught only by measuring what the browser renders rather than by reading the
// source, so these assert computed output, and they run on every engine: the
// glass in particular depends on vendor prefixing that the minifier can
// silently collapse, which a Chromium-only suite cannot see.
test.describe('Header', () => {
  test('the scroll-spy marks the section the reader is actually in', async ({ page }) => {
    await page.goto('/');

    const marker = () =>
      page.evaluate(
        () =>
          document
            .querySelector('#site-header nav a[aria-current="true"]')
            ?.getAttribute('href')
            ?.slice(1) ?? 'none'
      );
    // 'instant' throughout: :root sets scroll-behavior:smooth, and WebKit
    // animates a long jump for long enough that a read lands mid-flight.
    const scrollTo = (y: number) =>
      page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y);

    // Nothing is marked while the hero owns the screen.
    await scrollTo(0);
    await expect
      .poll(marker, { message: 'a section is marked while still on the hero', timeout: 4000 })
      .toBe('none');

    // Park each section's top just above the detection line in turn. Asserting
    // against real section positions rather than fractions of the page keeps
    // this meaningful when layout differs between engines.
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll('#site-header nav a[href^="#"]')]
        .map((a) => (a as HTMLAnchorElement).hash.slice(1))
        .filter((id) => document.getElementById(id))
        .sort(
          (x, y) =>
            document.getElementById(x)!.getBoundingClientRect().top -
            document.getElementById(y)!.getBoundingClientRect().top
        )
    );
    expect(ids.length, 'no nav links point at sections').toBeGreaterThan(1);

    for (const id of ids) {
      const top = await page.evaluate(
        (i) => document.getElementById(i)!.getBoundingClientRect().top + window.scrollY,
        id
      );
      await scrollTo(top - 100);
      // Poll instead of sleeping. WebKit sometimes reports the scroll as done
      // before the new position is observable, so a fixed wait made this race:
      // the marker was correct, the test just read it too early.
      await expect
        .poll(marker, {
          message: `#${id} fills the screen but is not the marked section`,
          timeout: 4000,
        })
        .toBe(id);
    }

    // At the foot of the page the footer fills the detection area; the last
    // section has to stay lit rather than the marker going blank, which is
    // what the earlier band-based observer did.
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    );
    await expect
      .poll(marker, { message: 'marker went blank at the foot of the page', timeout: 4000 })
      .toBe(ids[ids.length - 1]);
  });

  test('the frosted glass survives minification in this browser', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#site-header');

    // At rest the header must not paint a solid band: that is what clipped the
    // hero's colour wash into a hard seam across the full width.
    expect(
      await header.evaluate((el) => getComputedStyle(el).backgroundColor),
      'header is opaque at rest'
    ).toMatch(/rgba?\(.*[,/]\s*0\)|transparent|\/ 0\)/);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(header).toHaveClass(/is-scrolled/);

    // Poll rather than sleep: the blur is transitioned, and how long the
    // scroll, the rAF and the transition take together varies by engine.
    // The regression this guards is the build collapsing the prefixed and
    // unprefixed spellings into one and dropping whichever came first, so the
    // blur silently stopped rendering. Whichever spelling this engine reads,
    // one of them has to resolve to a real blur.
    await expect
      .poll(
        () =>
          header.evaluate((el) => {
            const cs = getComputedStyle(el) as CSSStyleDeclaration & {
              webkitBackdropFilter?: string;
            };
            return [cs.backdropFilter, cs.webkitBackdropFilter].filter(Boolean).join(' | ');
          }),
        { message: 'no non-zero backdrop-filter resolved on this engine', timeout: 5000 }
      )
      .toMatch(/blur\(\s*[1-9]/);
  });

  test('the mobile menu can be opened and dismissed from the keyboard', async ({
    page,
    isMobile,
    browserName,
  }) => {
    test.skip(!isMobile, 'desktop has no hamburger menu');
    await page.goto('/');

    const toggle = page.getByRole('button', { name: 'פתח תפריט ניווט' });
    const menu = page.locator('#mobile-menu');

    // Safari does not move Tab focus to links or buttons unless the user turns
    // on Full Keyboard Access, so the raw Tab order is only asserted on the
    // engines where tabbing reaches them at all. The behaviour being guarded —
    // Enter opens, focus enters the dialog, Escape closes and restores focus —
    // is asserted everywhere.
    if (browserName !== 'webkit') {
      await page.keyboard.press('Tab');
      await expect(
        page.locator('a[href="#main-content"]'),
        'skip link is not the first stop'
      ).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(toggle, 'the hamburger is not the second stop').toBeFocused();
    } else {
      await toggle.focus();
    }

    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('data-open', 'true');
    // Focus must land inside the dialog, on its close button — not on the logo
    // link, which is what `menu.querySelector('a')` used to match.
    await expect(page.locator('#nav-close-btn'), 'focus did not enter the dialog').toBeFocused();

    if (browserName !== 'webkit') {
      // Tab must not escape the dialog: walk further than it has controls.
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        expect(
          await page.evaluate(() => !!document.activeElement?.closest('#mobile-menu')),
          `focus left the open dialog after ${i + 1} tabs`
        ).toBe(true);
      }
    }

    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('data-open', 'false');
    await expect(toggle, 'focus was not returned to the toggle').toBeFocused();
  });

  test('every header control keeps a visible focus ring', async ({ page, isMobile }) => {
    await page.goto('/');
    const controls = isMobile
      ? ['#nav-toggle', '#nav-cal-btn']
      : ['#site-header nav a', '#site-header a[href^="tel:"]'];

    for (const sel of controls) {
      const el = page.locator(sel).first();
      await el.focus();
      const outline = await el.evaluate((n) => {
        const cs = getComputedStyle(n);
        return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) || 0 };
      });
      expect(outline.style, `${sel} has outline-style:none`).not.toBe('none');
      expect(outline.width, `${sel} focus outline is 0px wide`).toBeGreaterThan(0);
    }
  });
});

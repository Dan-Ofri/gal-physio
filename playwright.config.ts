import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    // Not `on-first-retry`: that keeps the retry's trace and throws the first
    // attempt away, and the first attempt is the one that ran under whatever
    // conditions caused the failure. Chasing the contact-form failure of
    // 2026-09-19 cost that attempt's network log, which is where the answer
    // was.
    trace: 'retain-on-failure',
  },
  // Mobile first: most visitors arrive on a phone (see CLAUDE.md), so the
  // mobile project runs first and is the one to check when something fails.
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    // Firefox and desktop WebKit run the header spec only. They are here for
    // the glass in particular: `backdrop-filter` is the one property on this
    // site whose vendor prefixing the minifier can silently collapse, and a
    // Chromium-only suite cannot see that — Firefox takes only the unprefixed
    // spelling, Safari below 18 only the -webkit- one. Pointing them at the
    // whole suite instead costs a contact-form failure on most local runs: a
    // different test each time, passing when that file runs on its own, i.e.
    // worker contention at 100 tests rather than a defect. Widening these two
    // means fixing that first.
    {
      name: 'Desktop Firefox',
      testMatch: /header\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Desktop Safari',
      testMatch: /header\.spec\.ts/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // Test the production build, not the dev server — dev's HMR/watcher adds
    // overhead and isn't representative of what ships.
    // `astro preview` auto-detects an AI-agent shell and daemonizes itself
    // (returning immediately), which Playwright's webServer reads as a
    // crash. ASTRO_PREVIEW_BACKGROUND opts out so it stays in the
    // foreground, as webServer requires.
    // PW_SKIP_BUILD lets a caller that has already run `astro build` (CI does,
    // as its own step, so a build failure reports as a build failure rather than
    // as a webServer that exited early) start the preview without rebuilding.
    command: process.env.PW_SKIP_BUILD ? 'npm run preview' : 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    // Only reuse a server we can verify is the production build. A stray
    // `npm run dev` on this port otherwise hijacks the whole suite: the tests
    // silently run against the dev server instead of `astro build`, which both
    // skips what actually ships and makes the run flaky under parallel workers.
    // Set PW_REUSE_SERVER=1 to opt back in when you know what is listening.
    reuseExistingServer: !process.env.CI && !!process.env.PW_REUSE_SERVER,
    timeout: 60_000,
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
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
  ],
  webServer: {
    // Test the production build, not the dev server — dev's HMR/watcher adds
    // overhead and isn't representative of what ships.
    // `astro preview` auto-detects an AI-agent shell and daemonizes itself
    // (returning immediately), which Playwright's webServer reads as a
    // crash. ASTRO_PREVIEW_BACKGROUND opts out so it stays in the
    // foreground, as webServer requires.
    command: 'npm run build && npm run preview',
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

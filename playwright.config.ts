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
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});

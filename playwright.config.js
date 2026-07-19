import { defineConfig, devices } from '@playwright/test';

// Runs against a production build (npm run build && npm run preview),
// not the dev server -- this is the CSP/service-worker/asset-hash
// configuration that actually ships, and previous sessions on this project
// found real bugs (a stale-cache regression, a CSP host allowlist gap) that
// only showed up against the built output, not `npm run dev`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4310/Travel-Packing-Optimizer/',
    trace: 'on-first-retry',
    // Fixed locale: this app auto-detects language from navigator.language
    // (11 supported languages), and assertions below check English strings.
    locale: 'en-US',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4310',
    url: 'http://localhost:4310/Travel-Packing-Optimizer/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});

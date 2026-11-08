import { defineConfig, devices } from '@playwright/test'

// Smoke tests run against the built single-file page (npm run build first).
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    // CI sets PW_CHANNEL=chrome to use the runner's preinstalled Google Chrome
    channel: process.env.PW_CHANNEL || undefined,
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { viewport: { width: 1366, height: 820 } } },
  ],
})

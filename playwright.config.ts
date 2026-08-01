import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // MapLibre does real WebGL rendering; several tests share the map and
  // hit a live external API (ORS). Running many in parallel starves the
  // GPU across workers and causes flaky timeouts unrelated to the app.
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4181',
    trace: 'on-first-retry',
    geolocation: { latitude: 41.9009, longitude: 12.4833 }, // Trevi Fountain
    permissions: ['geolocation'],
    viewport: { width: 390, height: 844 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4181',
    url: 'http://localhost:4181',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});

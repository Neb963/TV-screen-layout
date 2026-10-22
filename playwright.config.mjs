import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  retries: 1,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1550, height: 950 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1550, height: 950 } } }
  ],
  webServer: { command: 'python3 -m http.server 4173 --bind 127.0.0.1', url: 'http://127.0.0.1:4173/', reuseExistingServer: !process.env.CI, timeout: 30000 }
});

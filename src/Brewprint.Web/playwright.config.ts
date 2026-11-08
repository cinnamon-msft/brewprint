import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const externalUrl = process.env.BREWPRINT_E2E_URL;
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: externalUrl ?? 'http://127.0.0.1:5183', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalUrl ? undefined : [
    {
      command: `dotnet run --project "${path.join('..', 'Brewprint.Api')}" --no-launch-profile --urls http://127.0.0.1:5083`,
      url: 'http://127.0.0.1:5083/api/health', reuseExistingServer: false, timeout: 120_000,
    },
    {
      command: 'npm run dev -- --port 5183',
      url: 'http://127.0.0.1:5183', reuseExistingServer: false,
      env: { BREWPRINT_API_URL: 'http://127.0.0.1:5083' },
    },
  ],
});

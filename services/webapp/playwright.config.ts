import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 3033);
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;
const authBaseURL = process.env.E2E_AUTH_BASE_URL || baseURL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_SKIP_WEB_SERVER
    ? undefined
    : {
        command: `PORT=${PORT} npm run dev`,
        url: baseURL,
        reuseExistingServer: true,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});

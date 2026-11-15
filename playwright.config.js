const { defineConfig } = require('@playwright/test');

// E2E tests for the critical flows. `npx playwright test` starts the backend
// (with fresh seed data) and the frontend itself, so nothing needs to be
// running beforehand. Locally, already running servers are reused.
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,

  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
  },

  webServer: [
    {
      command: 'npm run seed && npm start',
      cwd: './server',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      cwd: './client',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});

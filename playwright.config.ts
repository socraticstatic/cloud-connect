import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  // Only the Cloud Connect app specs live in e2e/. tests/e2e/ holds INHERITED
  // NetBond/RBAC specs (billing, rbac-*, monitor-*, user-management, …) that
  // exercise legacy routes now redirected to /discover — obsolete, kept as files
  // but out of the default run. testMatch is not root-anchored, so also ignore
  // agent worktrees / deps / build output.
  testMatch: ['e2e/**/*.spec.ts'],
  testIgnore: ['**/.claude/**', '**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    // Unusual port on purpose — 5173 is the default Vite port and is
    // frequently occupied by another repo's dev server on this machine.
    // Never assume 5173 is this project's server.
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});

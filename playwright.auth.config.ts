import { defineConfig, devices } from '@playwright/test';

// Auth-gate suite ONLY. Boots the dev server in supabase mode with stub
// credentials (all Supabase traffic is route-stubbed inside the specs, so no
// email is ever sent and no real project is needed). Port 5198 to never
// collide with the gate-mode server the legacy suite uses on 5199.
export default defineConfig({
  testDir: './e2e-auth',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5198',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'VITE_AUTH_MODE=supabase VITE_ATT_GATE_URL=https://stub.supabase.co ' +
      'VITE_ATT_GATE_KEY=stub-publishable-key npm run dev -- --port 5198 --strictPort',
    url: 'http://localhost:5198',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

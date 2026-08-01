import { test, expect } from '@playwright/test';

/**
 * Auth-gate spec: runs ONLY via playwright.auth.config.ts (npm run test:e2e:auth),
 * whose dev server boots in supabase mode with stub credentials. Every Supabase
 * call is network-stubbed — this suite never sends a real email.
 *
 * The legacy suite in e2e/ runs against a gate-mode server (see
 * playwright.config.ts) where seedAuth()'s att_nb_user key still works.
 */

const OTP_OK = { status: 200, contentType: 'application/json', body: '{}' };

test.describe('att.com auth gate (supabase mode)', () => {
  test('app is locked: content not reachable signed-out', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /enter/i })).toBeVisible();
    await expect(page.locator('#root')).not.toContainText(/discover|govern|observe/i);
  });

  test('rejects non-att.com email client-side', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('outsider@gmail.com');
    await page.getByText(/I understand that this is a prototype/).click();
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page.getByText('Only @att.com email addresses are allowed')).toBeVisible();
  });

  test('att.com email advances to code entry', async ({ page }) => {
    await page.route('**/auth/v1/otp**', (route) => route.fulfill(OTP_OK));
    await page.goto('/');
    await page.getByLabel(/email/i).fill('mb1234@att.com');
    await page.getByText(/I understand that this is a prototype/).click();
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page.getByText(/We sent a 6-digit code to/i)).toBeVisible();
    await expect(page.getByPlaceholder('000000')).toBeVisible();
  });

  test('bad code shows error, app stays locked', async ({ page }) => {
    await page.route('**/auth/v1/otp**', (route) => route.fulfill(OTP_OK));
    await page.route('**/auth/v1/verify**', (route) =>
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: '{"error_code":"otp_expired","msg":"Token has expired or is invalid"}',
      }));
    await page.goto('/');
    await page.getByLabel(/email/i).fill('mb1234@att.com');
    await page.getByText(/I understand that this is a prototype/).click();
    await page.getByRole('button', { name: /enter/i }).click();
    await page.getByPlaceholder('000000').fill('123456');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page.getByText(/invalid or expired code/i)).toBeVisible();
    await expect(page.locator('#root')).not.toContainText(/discover|govern|observe/i);
  });

  test('localStorage forgery does not unlock supabase mode', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('att_nb_user', JSON.stringify({ email: 'x@att.com' })));
    await page.goto('/');
    await expect(page.getByRole('button', { name: /enter/i })).toBeVisible();
  });
});

test.describe('Electron-shell browsers stay gated', () => {
  // Regression: Slack/Discord webviews and the Claude browser pane carry
  // "Electron" in their UA. Found live 2026-08-01 — a UA-based offline bypass
  // let the pane straight past the gate. Only file: may bypass.
  test.use({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Claude/1.0 Chrome/148.0.0.0 Electron/42.7.0 Safari/537.36',
  });

  test('Electron UA over http still sees the login card', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /enter/i })).toBeVisible();
    await expect(page.locator('#root')).not.toContainText(/discover|govern|observe/i);
  });
});

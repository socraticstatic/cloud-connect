import type { Page } from '@playwright/test';

const AUTH_KEY = 'att_nb_user';
const AUTH_VALUE = JSON.stringify({ email: 'test@att.com' });

export async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    // Auth
    localStorage.setItem('att_nb_user', JSON.stringify({ email: 'test@att.com' }));
    // Dismiss product tour
    localStorage.setItem('tour-main-app-completed', 'true');
    localStorage.setItem('product-tour-completed', 'true');
    // Skip NetBond Max demo modal
    localStorage.setItem('e2e-skip-demo-modal', 'true');
  });
}

export async function gotoUsers(page: Page) {
  await page.goto('/#/configure/users', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="users-table"]', { timeout: 10000 });
}

export async function gotoManage(page: Page) {
  await page.goto('/#/manage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
}

export async function gotoCreate(page: Page) {
  await page.goto('/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
}

export async function gotoConnectionDetail(page: Page, id: string) {
  await page.goto(`/#/connections/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
}

export async function switchRole(page: Page, role: 'user' | 'admin' | 'super-admin') {
  await page.evaluate((r) => (window as any).__setRole(r), role);
  await page.waitForTimeout(400);
}

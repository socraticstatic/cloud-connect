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

/**
 * Layer-first nav: open a layer's dropdown in the main bar and follow one of
 * its verbs. The verbs live only inside the panel, so this is the one honest
 * way a pointer user reaches them.
 */
export async function openLayerVerb(
  page: Page,
  layer: 'NaaS' | 'AI Fabric',
  verb: 'Connect' | 'Govern' | 'Observe' | 'Cost',
) {
  const nav = page.getByLabel('Main navigation');
  await nav.getByRole('button', { name: layer, exact: true }).click();
  // A menuitem's accessible name is its label plus its description line, so
  // match on the leading verb, never exact.
  await nav.getByRole('menu', { name: layer })
    .getByRole('menuitem', { name: new RegExp(`^${verb}\\b`) }).click();
}

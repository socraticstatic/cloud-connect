import { test, expect } from '@playwright/test';
import { seedAuth } from '../tests/e2e/helpers';

test('fabric on-ramp hover highlights the clouds it reaches, and vice-versa', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/#/discover', { waitUntil: 'domcontentloaded' });

  // Direct Connect reaches AWS + Google Cloud (not Azure).
  const dcCard = page.locator('aside[aria-label="AT&T fabric on-ramps"] div.rounded-xl.p-3', { hasText: 'Direct Connect · Equinix DC2' }).first();
  await dcCard.hover();

  const cloudRow = (name: string) =>
    page.locator('button[aria-label="' + name + '"]').locator('xpath=..');

  await expect(cloudRow('AWS')).toHaveClass(/border-\[#0057b8\]/);
  await expect(cloudRow('Google Cloud')).toHaveClass(/border-\[#0057b8\]/);
  await expect(cloudRow('Azure')).not.toHaveClass(/border-\[#0057b8\]/);

  // Reciprocal: hovering the AWS row lights up the on-ramps that serve AWS
  // (NetBond PE-IAD-02 + Direct Connect DC2), but not the Azure-only ExpressRoute.
  await page.locator('button[aria-label="AWS"]').hover();
  const rampCard = (text: string) =>
    page.locator('aside[aria-label="AT&T fabric on-ramps"] div.rounded-xl', { hasText: text }).first();
  await expect(rampCard('Direct Connect · Equinix DC2')).toHaveClass(/border-\[#0057b8\]/);
  await expect(rampCard('ExpressRoute · Equinix CH1')).not.toHaveClass(/border-\[#0057b8\]/);
});

import { test, expect } from '@playwright/test';

test('02a dashboard', async ({ page }) => {
  await page.goto('/#/dashboard');
  await expect(page.locator('#main h2')).toHaveText('Dashboard');
  await page.screenshot({
    path: 'e2e/screenshots/scenarios/02-dashboard/02a-dashboard.png',
    fullPage: true,
  });
});
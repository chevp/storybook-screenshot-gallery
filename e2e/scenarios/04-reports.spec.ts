import { test, expect } from '@playwright/test';

test('04a reports list', async ({ page }) => {
  await page.goto('/#/reports');
  await expect(page.locator('#main h2')).toHaveText('Reports');
  await page.screenshot({
    path: 'e2e/screenshots/scenarios/04-reports/04a-reports-list.png',
    fullPage: true,
  });
});
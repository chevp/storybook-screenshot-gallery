import { test, expect } from '@playwright/test';

test('03a clients list', async ({ page }) => {
  await page.goto('/#/clients');
  await expect(page.locator('#main h2')).toHaveText('Clients');
  await page.screenshot({
    path: 'e2e/screenshots/scenarios/03-clients/03a-clients-list.png',
    fullPage: true,
  });
});
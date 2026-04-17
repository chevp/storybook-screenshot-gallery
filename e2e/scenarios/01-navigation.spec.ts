import { test, expect } from '@playwright/test';

const SHOT_DIR = 'e2e/screenshots/scenarios/01-navigation';

test.describe('01 — Navigation', () => {
  test('01a sidebar default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#sidebar')).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/01a-sidebar-default.png`, fullPage: true });
  });

  test('01b dark mode', async ({ page }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: `${SHOT_DIR}/01b-dark-mode.png`, fullPage: true });
  });

  test('01c light mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.screenshot({ path: `${SHOT_DIR}/01c-light-mode.png`, fullPage: true });
  });
});
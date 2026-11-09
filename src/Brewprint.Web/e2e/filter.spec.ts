import { test, expect } from '@playwright/test';

test('AND filters, keyboard, empty state and reset preserve custom cup', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.recipe-tile')).toHaveCount(6);
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  const milk = page.getByRole('checkbox', { name: 'Steamed milk', exact: true });
  await milk.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.recipe-tile')).toHaveCount(3);
  await page.getByRole('checkbox', { name: 'Espresso', exact: true }).check();
  await expect(page.locator('.recipe-tile')).toHaveCount(3);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('checkbox', { name: 'Espresso', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Brewed coffee', exact: true }).check();
  await expect(page.locator('.recipe-tile')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No drinks match these ingredients.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use this recipe', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Show all drinks' }).click();
  await expect(page.locator('.recipe-tile')).toHaveCount(6);
  await page.getByRole('checkbox', { name: 'Water', exact: true }).check();
  await expect(page.getByRole('heading', { name: 'Americano', exact: true })).toBeVisible();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
});

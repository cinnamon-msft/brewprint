import { test, expect } from '@playwright/test';

test('oat latte, impossible cappuccino and espresso exception leave builder unchanged', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await page.getByLabel('Espresso shots').selectOption('2');
  await page.getByLabel('Milk choice').selectOption('Oat');
  await page.getByRole('button', { name: 'Apply shots and milk' }).click();
  await expect(page.getByText('240 mL customized serving')).toBeVisible();
  await expect(page.locator('.customize-result')).toContainText('Oat steamed milk150 mL');
  await expect(page.locator('.customize-result')).toContainText('Oat milk foam30 mL');
  await page.locator('.recipe-tile').filter({ hasText: 'Cappuccino' }).click();
  await page.getByLabel('Espresso shots').selectOption('4');
  await page.getByRole('button', { name: 'Apply shots and milk' }).click();
  await expect(page.getByRole('alert')).toContainText('Insufficient serving volume');
  await page.locator('.recipe-tile').filter({ hasText: /^Espresso/ }).click();
  await page.getByLabel('Espresso shots').selectOption('4');
  await page.getByRole('button', { name: 'Apply shots and milk' }).click();
  await expect(page.getByText('120 mL customized serving')).toBeVisible();
  await expect(page.getByText('Espresso-only exception:', { exact: false }).first()).toBeVisible();
  await page.locator('.recipe-tile').filter({ hasText: 'Brewed coffee' }).click();
  await expect(page.getByLabel('Espresso shots')).toBeDisabled();
  await expect(page.getByText('Brewed coffee is not eligible for espresso shots.')).toBeVisible();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
});

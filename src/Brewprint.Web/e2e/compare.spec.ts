import { test, expect } from '@playwright/test';

test('independent comparison, signed differences and same drink preserve builder', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await expect(page.getByLabel('Left drink')).toHaveValue('latte');
  await expect(page.getByLabel('Right drink')).toHaveValue('cappuccino');
  await expect(page.locator('.comparison-table tr').filter({ hasText: 'Steamed milk' })).toContainText('-120');
  await page.getByLabel('Right drink').selectOption('latte');
  await expect(page.getByLabel('Left drink')).toHaveValue('latte');
  await expect(page.getByText('Same drink on both sides: all ingredient differences are zero.')).toBeVisible();
  expect(await page.locator('[data-difference]').evaluateAll(elements =>
    elements.every(element => element.getAttribute('data-difference') === '0'))).toBe(true);
  await page.getByLabel('Left drink').selectOption('espresso');
  await expect(page.getByLabel('Right drink')).toHaveValue('latte');
  await expect(page.locator('.comparison-table tr').filter({ hasText: 'Steamed milk' })).toContainText('+180');
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('body').evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(390);
});

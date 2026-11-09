import { test, expect } from '@playwright/test';

test('scaled preview conserves totals and leaves builder unchanged', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await page.getByLabel('Recipe cup size (mL)').fill('237');
  await page.getByRole('button', { name: 'Scale recipe', exact: true }).click();
  await expect(page.getByText('237 mL scaled serving')).toBeVisible();
  const amounts = await page.locator('[data-scaled-amount]').evaluateAll(elements =>
    elements.reduce((sum, element) => sum + Number(element.getAttribute('data-scaled-amount')), 0));
  expect(amounts).toBe(237);
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await page.getByLabel('Recipe cup size (mL)').fill('480');
  await page.getByRole('button', { name: 'Scale recipe', exact: true }).click();
  await expect(page.getByText('480 mL scaled serving')).toBeVisible();
  await expect(page.locator('.size-result svg')).toHaveAttribute('data-capacity', '480');
  await page.getByLabel('Recipe cup size (mL)').fill('481');
  await page.getByRole('button', { name: 'Scale recipe', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('60 through 480');
  await page.getByRole('button', { name: 'Show base recipe' }).click();
  await expect(page.getByText('240 mL base serving')).toBeVisible();
});

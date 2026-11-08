import { test, expect } from '@playwright/test';
import path from 'node:path';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Latte.*Explore|Latte.*Selected/ })).toBeVisible();
});

test('all six recipes, recipe load, and independent browsing', async ({ page }) => {
  await expect(page.locator('.recipe-tile')).toHaveCount(6);
  await page.getByRole('button', { name: 'Use this recipe', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('240 / 360 mL');
  await page.locator('.recipe-tile').filter({ hasText: 'Americano' }).click();
  await expect(page.getByRole('heading', { name: 'Americano', exact: true })).toBeVisible();
  await expect(page.getByTestId('fill-reading')).toHaveText('240 / 360 mL');
  await page.getByRole('button', { name: 'Use this recipe', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('180 / 360 mL');
});

test('actual mouse drag/drop and keyboard Add share the same assembly behavior', async ({ page }) => {
  await page.getByTestId('tray-espresso').dragTo(page.getByTestId('cup-drop-target'));
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  const addMilk = page.getByRole('button', { name: 'Add Steamed milk', exact: true });
  await addMilk.focus();
  await expect(addMilk).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('fill-reading')).toHaveText('60 / 360 mL');
  await expect(page.locator('.custom-breakdown li').first()).toContainText('Espresso');
  await expect(page.locator('.custom-breakdown li').last()).toContainText('Steamed milk');
  await expect(addMilk).toHaveCSS('outline-style', 'solid');
  const layer = page.getByTestId('cup-drop-target').locator('[data-layer="espresso"]');
  expect(Number(await layer.getAttribute('height'))).toBeCloseTo(184 * 30 / 360);
  expect(Number(await layer.getAttribute('y'))).toBeCloseTo(220 - 184 * 30 / 360);
});

test('exact capacity, accessible overflow rejection, undo, removal and reset', async ({ page }) => {
  const water = page.getByRole('button', { name: 'Add Water', exact: true });
  for (let i = 0; i < 6; i++) await water.click();
  await expect(page.getByTestId('fill-reading')).toHaveText('360 / 360 mL');
  await page.getByTestId('tray-espresso').dragTo(page.getByTestId('cup-drop-target'));
  await expect(page.locator('.builder-status')).toContainText('Cannot add Espresso');
  await expect(page.getByTestId('fill-reading')).toHaveText('360 / 360 mL');
  await page.getByRole('button', { name: 'Undo last addition' }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('300 / 360 mL');
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await water.click();
  await expect(page.locator('.builder-status')).toContainText('only 30 mL remaining');
  await expect(page.getByTestId('fill-reading')).toHaveText('330 / 360 mL');
  await page.getByRole('button', { name: 'Remove Water', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await page.getByRole('button', { name: 'Reset cup', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('0 / 360 mL');
  await expect(page.getByRole('button', { name: 'Undo last addition' })).toBeDisabled();
  await page.reload();
  await expect(page.getByTestId('fill-reading')).toHaveText('0 / 360 mL');
});

test('keyboard gallery selection and touch-equivalent add buttons', async ({ page }) => {
  const espresso = page.locator('.recipe-tile').filter({ hasText: /^Espresso/ });
  await espresso.focus();
  await page.keyboard.press('Space');
  await expect(espresso).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Espresso', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Milk foam', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await expect(page.locator('.builder-status')).toContainText('Added 30 mL Milk foam');
});

test('real touch taps and keyboard skip navigation', async ({ page, browser, baseURL }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to coffee builder' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#workbench')).toBeFocused();
  const context = await browser.newContext({ hasTouch: true, isMobile: true,
    viewport: { width: 390, height: 844 }, baseURL });
  const touchPage = await context.newPage();
  await touchPage.goto('/');
  await touchPage.getByRole('button', { name: 'Add Espresso', exact: true }).tap();
  await expect(touchPage.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await touchPage.getByRole('button', { name: 'Reset cup', exact: true }).tap();
  await expect(touchPage.getByTestId('fill-reading')).toHaveText('0 / 360 mL');
  await context.close();
});

test('loading, explicit API failure and retry; builder still works offline', async ({ page }) => {
  let fail = true;
  await page.route('**/api/recipes', async route => {
    if (fail) await route.fulfill({ status: 503, contentType: 'application/problem+json', body: '{"title":"Unavailable"}' });
    else await route.continue();
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  fail = false;
  await page.getByRole('button', { name: 'Retry recipes' }).click();
  await expect(page.locator('.recipe-tile')).toHaveCount(6);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('slow responses show loading, invalid data is not rendered', async ({ page }) => {
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/recipes', async route => {
    await wait;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[{"id":"bad"}]' });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Opening the recipe book...')).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toContainText('invalid data');
});

test('projector desktop layout, mobile layout, reduced motion and screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Add Espresso', exact: true })).toHaveCSS('transition-duration', '0s');
  expect(await page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: path.join('test-results', 'bar-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await page.screenshot({ path: path.join('test-results', 'bar-mobile.png'), fullPage: true });
});

import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

async function dragIngredient(page: Page, ingredient: string) {
  const source = page.getByTestId(`tray-${ingredient}`);
  const target = page.getByTestId('cup-drop-target');
  await source.scrollIntoViewIfNeeded();
  const start = await source.boundingBox();
  if (!start) throw new Error('Ingredient card is not rendered');
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  // Start the native drag before scrolling the destination into view.
  await page.mouse.move(start.x + start.width / 2 + 16, start.y + start.height / 2, { steps: 4 });
  await expect(target).toHaveClass(/drag-active/);
  await target.scrollIntoViewIfNeeded();
  const end = await target.boundingBox();
  if (!end) throw new Error('Cup drop target is not rendered');
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await expect(target).toHaveClass(/drag-over/);
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('recipe-latte')).toBeVisible();
});

test('one centered cup with all six choices below it and dark by default', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('svg.cup')).toHaveCount(1);
  await expect(page.locator('.recipe-tile')).toHaveCount(6);
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByTestId('recipe-latte')).toHaveAttribute('aria-pressed', 'true');
  const cup = await page.locator('svg.cup').boundingBox();
  const options = await page.locator('.recipe-gallery').boundingBox();
  expect(cup).not.toBeNull();
  expect(options).not.toBeNull();
  expect(cup!.x + cup!.width / 2).toBeCloseTo(720, 0);
  expect(options!.y).toBeGreaterThan(cup!.y + cup!.height);
  for (const [id, amount] of [['espresso', 30], ['americano', 180], ['latte', 240],
    ['cappuccino', 180], ['flat-white', 165], ['brewed-coffee', 240]] as const) {
    await page.getByTestId(`recipe-${id}`).click();
    await expect(page.locator('svg.cup')).toHaveAttribute('data-filled', String(amount));
    await expect(page.getByTestId('fill-reading')).toHaveText(`${amount} / 360 mL`);
    await expect(page.locator('svg.cup')).toHaveCount(1);
  }
});

test('recipe load and independent browsing preserve the custom cup', async ({ page }) => {
  await page.getByRole('button', { name: 'Use this recipe', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('240 / 360 mL');
  await page.getByTestId('recipe-americano').click();
  await expect(page.getByRole('heading', { name: 'Americano', exact: true })).toBeVisible();
  await expect(page.getByTestId('fill-reading')).toHaveText('180 / 360 mL');
  await page.getByRole('button', { name: 'Build your own', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('240 / 360 mL');
  await expect(page.locator('svg.cup')).toHaveCount(1);
  await page.getByRole('button', { name: 'House menu', exact: true }).click();
  await page.getByRole('button', { name: 'Use this recipe', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('180 / 360 mL');
});

test('actual mouse drag/drop and keyboard Add share assembly behavior', async ({ page }) => {
  await page.getByRole('button', { name: 'Build your own', exact: true }).click();
  await dragIngredient(page, 'espresso');
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  const addMilk = page.getByRole('button', { name: 'Add Steamed milk', exact: true });
  await addMilk.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('fill-reading')).toHaveText('60 / 360 mL');
  await expect(page.locator('.breakdown li').first()).toContainText('Espresso');
  await expect(page.locator('.breakdown li').last()).toContainText('Steamed milk');
  await expect(addMilk).toHaveCSS('outline-style', 'solid');
  const layer = page.locator('[data-layer="espresso"]');
  expect(Number(await layer.getAttribute('height'))).toBeCloseTo(184 * 30 / 360);
  expect(Number(await layer.getAttribute('y'))).toBeCloseTo(220 - 184 * 30 / 360);
});

test('exact capacity, overflow rejection, undo, removal, reset and memory-only state', async ({ page }) => {
  await page.getByRole('button', { name: 'Build your own', exact: true }).click();
  const water = page.getByRole('button', { name: 'Add Water', exact: true });
  for (let i = 0; i < 6; i++) await water.click();
  await expect(page.getByTestId('fill-reading')).toHaveText('360 / 360 mL');
  await dragIngredient(page, 'espresso');
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
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Build your own', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('0 / 360 mL');
});

test('keyboard recipe choices, mode switch, real touch and skip navigation', async ({ page, browser, baseURL }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to cup display' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#workbench')).toBeFocused();
  const espresso = page.getByTestId('recipe-espresso');
  await espresso.focus();
  await page.keyboard.press('Space');
  await expect(espresso).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Espresso', exact: true })).toBeVisible();
  const build = page.getByRole('button', { name: 'Build your own', exact: true });
  await build.focus();
  await page.keyboard.press('Enter');
  await expect(build).toHaveAttribute('aria-pressed', 'true');
  const context = await browser.newContext({ hasTouch: true, isMobile: true,
    viewport: { width: 390, height: 844 }, baseURL });
  const touchPage = await context.newPage();
  await touchPage.goto('/');
  await touchPage.getByTestId('recipe-espresso').tap();
  await expect(touchPage.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await expect.poll(async () => {
    const bounds = await touchPage.getByTestId('cup-drop-target').boundingBox();
    return bounds !== null && bounds.y >= 0 && bounds.y + bounds.height <= 844;
  }).toBe(true);
  await touchPage.getByRole('button', { name: 'Build your own', exact: true }).tap();
  await touchPage.getByRole('button', { name: 'Add Espresso', exact: true }).tap();
  await expect(touchPage.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  await touchPage.getByRole('button', { name: 'Reset cup', exact: true }).tap();
  await expect(touchPage.getByTestId('fill-reading')).toHaveText('0 / 360 mL');
  await context.close();
});

test('API failure and retry leave the shared manual cup usable offline', async ({ page }) => {
  let fail = true;
  await page.route('**/api/recipes', async route => {
    if (fail) await route.fulfill({ status: 503, contentType: 'application/problem+json', body: '{"title":"Unavailable"}' });
    else await route.continue();
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  await page.getByRole('button', { name: 'Build your own', exact: true }).click();
  await page.getByRole('button', { name: 'Add Espresso', exact: true }).click();
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
  fail = false;
  await page.getByRole('button', { name: 'Retry recipes' }).click();
  await expect(page.locator('.recipe-tile')).toHaveCount(6);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByTestId('fill-reading')).toHaveText('30 / 360 mL');
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
  await expect(page.locator('svg.cup')).toHaveAttribute('data-filled', '0');
});

test('layer pours animate the real geometry and reduced motion shows final fill', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByTestId('recipe-espresso').click();
  await page.getByTestId('recipe-latte').click();
  const milk = page.locator('[data-layer="steamed-milk"]');
  const heights = await milk.evaluate(rect => {
    const animation = rect.parentElement!.getAnimations().find(value =>
      value instanceof CSSAnimation && value.animationName === 'layer-pour');
    if (!animation) throw new Error('Expected a real layer pour animation');
    animation.pause();
    animation.currentTime = 0;
    const start = rect.getBoundingClientRect().height;
    animation.currentTime = 310;
    const middle = rect.getBoundingClientRect().height;
    animation.currentTime = 800;
    const end = rect.getBoundingClientRect().height;
    animation.finish();
    return { start, middle, end };
  });
  expect(heights.start).toBeLessThan(1);
  expect(heights.middle).toBeGreaterThan(1);
  expect(heights.middle).toBeLessThan(heights.end);
  expect(heights.end).toBeCloseTo(184 * 180 / 360 * 340 / 320, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('recipe-americano').click();
  await expect(page.locator('.pour-layer').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.liquid-layer').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('svg.cup')).toHaveAttribute('data-filled', '180');
});

test('responsive dark composition and builder screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: path.join('test-results', 'bar-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Use this recipe', exact: true }).click();
  await page.screenshot({ path: path.join('test-results', 'bar-builder.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByTestId('recipe-latte').click();
  await page.screenshot({ path: path.join('test-results', 'bar-mobile.png'), fullPage: true });
});

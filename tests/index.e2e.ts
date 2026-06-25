import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Svelte Scaled View Library' })).toBeVisible();
});

test('ScaledView with fit="contain" are correctly scaled', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#contain-1')).toHaveText('2.50 x 2.50');
	await expect(page.locator('#contain-2')).toHaveText('1.88 x 1.88');
	await expect(page.locator('#contain-3')).toHaveText('0.75 x 0.75');
});

test('ScaledView with fit="cover" are correctly scaled', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#cover-1')).toHaveText('3.33 x 3.33');
	await expect(page.locator('#cover-2')).toHaveText('4.44 x 4.44');
	await expect(page.locator('#cover-3')).toHaveText('1.33 x 1.33');
});

test('ScaledView with fit="fill" are correctly scaled', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#fill-1')).toHaveText('2.50 x 3.33');
	await expect(page.locator('#fill-2')).toHaveText('1.88 x 4.44');
	await expect(page.locator('#fill-3')).toHaveText('0.75 x 1.33');
});

test('ScaledView with fit="none" are correctly scaled', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#none-1')).toHaveText('1.00 x 1.00');
	await expect(page.locator('#none-2')).toHaveText('1.00 x 1.00');
	await expect(page.locator('#none-3')).toHaveText('1.00 x 1.00');
});

test('ScaledView with fit="contain" and min="1" max="2" are correctly scaled', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#clamped-1')).toHaveText('2.00 x 2.00');
	await expect(page.locator('#clamped-2')).toHaveText('1.88 x 1.88');
	await expect(page.locator('#clamped-3')).toHaveText('1.00 x 1.00');
});

test('ScaledView can export scaleX and scaleY correctly', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#bind-1-scale')).toHaveText('2.50 x 3.33');
	await page.locator('#bind-1-resize').click();
	await expect(page.locator('#bind-1-scale')).toHaveText('1.88 x 4.44');
	await page.locator('#bind-1-resize').click();
	await expect(page.locator('#bind-1-scale')).toHaveText('2.50 x 3.33');
});

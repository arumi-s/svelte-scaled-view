import { expect, test, type Page } from '@playwright/test';

const BASE = '/controlled-view';

function parseVec(text: string) {
	const [x, y] = text.split(',').map((s) => parseFloat(s.trim()));
	return { x: x!, y: y! };
}

interface Panel {
	scale: number;
	offset: { x: number; y: number };
	size: { x: number; y: number };
	center: { x: number; y: number };
	rectStart: { x: number; y: number };
	rectEnd: { x: number; y: number };
}

async function readPanel(page: Page, id: string): Promise<Panel> {
	const txt = (sel: string) => page.locator(sel).innerText();
	return {
		scale: parseFloat(await txt(`#${id}-scale`)),
		offset: parseVec(await txt(`#${id}-offset`)),
		size: parseVec(await txt(`#${id}-size`)),
		center: parseVec(await txt(`#${id}-center`)),
		rectStart: parseVec(await txt(`#${id}-rect-start`)),
		rectEnd: parseVec(await txt(`#${id}-rect-end`))
	};
}

/** Scrolls the demo into view and returns the viewport's bounding box. */
async function viewportBox(page: Page, id: string) {
	const demo = page.locator(`#${id}`);
	await demo.scrollIntoViewIfNeeded();
	const box = await demo.locator('[data-controlled-view-container]').boundingBox();
	if (!box) throw new Error(`viewport #${id} not found`);
	return box;
}

/**
 * Resolves a viewport-local (cx, cy) to absolute screen coords using the element's own
 * getBoundingClientRect — the same source `handleWheel` reads — so the cursor lands exactly
 * where the library thinks it does (no subpixel drift from Playwright's boundingBox).
 */
async function cursorTarget(page: Page, id: string, cx: number, cy: number) {
	return page.locator(`#${id} [data-controlled-view-container]`).evaluate(
		(el, local) => {
			const r = el.getBoundingClientRect();
			return { x: r.left + local.cx, y: r.top + local.cy };
		},
		{ cx, cy }
	);
}

function expectClose(actual: number, expected: number, tol = 0.02) {
	expect(
		Math.abs(actual - expected),
		`expected ${actual} to be within ${tol} of ${expected}`
	).toBeLessThanOrEqual(tol);
}

/** Content coordinate under a cursor at viewport-local (cx, cy), via linear interp of rect. */
function focalContent(p: Panel, cx: number, cy: number) {
	return {
		x: p.rectStart.x + (cx / p.size.x) * (p.rectEnd.x - p.rectStart.x),
		y: p.rectStart.y + (cy / p.size.y) * (p.rectEnd.y - p.rectStart.y)
	};
}

test.describe('ControlledView — initial render', () => {
	test('default demo reports expected bindable outputs', async ({ page }) => {
		await page.goto(BASE);
		// Gate on ElementSize settling before reading the rest.
		await expect(page.locator('#cv-default-size')).toHaveText('320.00, 220.00');
		await expect(page.locator('#cv-default-scale')).toHaveText('1.00');
		await expect(page.locator('#cv-default-offset')).toHaveText('0.00, 0.00');
		await expect(page.locator('#cv-default-center')).toHaveText('160.00, 110.00');
		await expect(page.locator('#cv-default-rect-start')).toHaveText('-160.00, -110.00');
		await expect(page.locator('#cv-default-rect-end')).toHaveText('160.00, 110.00');
	});
});

test.describe('ControlledView — wheel zoom', () => {
	test('zooms toward the cursor and preserves the focal content point', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-default-size')).toHaveText('320.00, 220.00');

		const cx = 80;
		const cy = 60;
		await page.locator('#cv-default').scrollIntoViewIfNeeded();
		const target = await cursorTarget(page, 'cv-default', cx, cy);
		await page.mouse.move(target.x, target.y);

		const before = await readPanel(page, 'cv-default');
		const focalBefore = focalContent(before, cx, cy);

		// Wheel up (deltaY < 0) zooms in by ~1.1x.
		await page.mouse.wheel(0, -100);
		await expect(page.locator('#cv-default-scale')).not.toHaveText('1.00');

		const after = await readPanel(page, 'cv-default');
		expectClose(after.scale, 1.1, 0.01);

		const focalAfter = focalContent(after, cx, cy);
		expectClose(focalAfter.x, focalBefore.x, 0.05);
		expectClose(focalAfter.y, focalBefore.y, 0.05);

		// Wheel down zooms back out toward 1.0.
		const target2 = await cursorTarget(page, 'cv-default', cx, cy);
		await page.mouse.move(target2.x, target2.y);
		await page.mouse.wheel(0, 100);
		const back = await readPanel(page, 'cv-default');
		expectClose(back.scale, 1.0, 0.01);
	});
});

test.describe('ControlledView — getZoomScale', () => {
	test('custom discrete rate (1.5x) drives zoom and preserves the focal point', async ({
		page
	}) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-zoom-fast-size')).toHaveText('320.00, 220.00');

		const cx = 80;
		const cy = 60;
		await page.locator('#cv-zoom-fast').scrollIntoViewIfNeeded();
		const target = await cursorTarget(page, 'cv-zoom-fast', cx, cy);
		await page.mouse.move(target.x, target.y);

		const before = await readPanel(page, 'cv-zoom-fast');
		const focalBefore = focalContent(before, cx, cy);

		// Wheel up zooms in by ~1.5x (custom rate), not the default 1.1x.
		await page.mouse.wheel(0, -100);
		const after = await readPanel(page, 'cv-zoom-fast');
		expectClose(after.scale, 1.5, 0.01);

		const focalAfter = focalContent(after, cx, cy);
		expectClose(focalAfter.x, focalBefore.x, 0.1);
		expectClose(focalAfter.y, focalBefore.y, 0.1);

		// Wheel down zooms back out toward 1.0 (1.5 * 1/1.5).
		const target2 = await cursorTarget(page, 'cv-zoom-fast', cx, cy);
		await page.mouse.move(target2.x, target2.y);
		await page.mouse.wheel(0, 100);
		const back = await readPanel(page, 'cv-zoom-fast');
		expectClose(back.scale, 1.0, 0.01);
	});

	test('deltaY-magnitude exponential rate scales with wheel amount', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-zoom-exp-size')).toHaveText('320.00, 220.00');

		await page.locator('#cv-zoom-exp').scrollIntoViewIfNeeded();
		const target = await cursorTarget(page, 'cv-zoom-exp', 100, 80);
		await page.mouse.move(target.x, target.y);

		// A single notch with deltaY = -100 → scale * exp(1) ≈ 2.718 (not the default 1.1).
		await page.mouse.wheel(0, -100);
		let after = await readPanel(page, 'cv-zoom-exp');
		expectClose(after.scale, Math.exp(1), 0.02);

		// A larger wheel amount scales proportionally: another deltaY = -200 multiplies by
		// exp(2) ≈ 7.389, so the total reaches exp(1) * exp(2) = exp(3) ≈ 20.086. This only
		// holds because the rate tracks deltaY magnitude — a sign-only default would stay ~1.1x.
		const target2 = await cursorTarget(page, 'cv-zoom-exp', 100, 80);
		await page.mouse.move(target2.x, target2.y);
		await page.mouse.wheel(0, -200);
		after = await readPanel(page, 'cv-zoom-exp');
		expectClose(after.scale, Math.exp(1) * Math.exp(2), 0.1);
	});
});

test.describe('ControlledView — scale clamping', () => {
	test('clamps scale to min/max', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-clamp-size')).toHaveText('320.00, 220.00');

		const box = await viewportBox(page, 'cv-clamp');
		await page.mouse.move(box.x + 160, box.y + 110);

		// Zoom in until the max cap (2.0).
		for (let i = 0; i < 15; i++) await page.mouse.wheel(0, -100);
		await expect(page.locator('#cv-clamp-scale')).toHaveText('2.00');

		// Zoom out until the min floor (0.5).
		for (let i = 0; i < 25; i++) await page.mouse.wheel(0, 100);
		await expect(page.locator('#cv-clamp-scale')).toHaveText('0.50');
	});
});

test.describe('ControlledView — pan', () => {
	test('middle-button drag pans (default trigger)', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-default-size')).toHaveText('320.00, 220.00');

		const box = await viewportBox(page, 'cv-default');
		await page.mouse.move(box.x + 50, box.y + 50);
		await page.mouse.down({ button: 'middle' });
		await page.mouse.move(box.x + 90, box.y + 80, { steps: 5 });
		await page.mouse.up({ button: 'middle' });

		const p = await readPanel(page, 'cv-default');
		expectClose(p.offset.x, 40, 1);
		expectClose(p.offset.y, 30, 1);
	});

	test('shouldPan = left button: left drag pans, middle does not', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-pan-left-size')).toHaveText('320.00, 220.00');

		// Middle button is rejected by shouldPan — offset stays at 0.
		let box = await viewportBox(page, 'cv-pan-left');
		await page.mouse.move(box.x + 50, box.y + 50);
		await page.mouse.down({ button: 'middle' });
		await page.mouse.move(box.x + 90, box.y + 80, { steps: 5 });
		await page.mouse.up({ button: 'middle' });

		let p = await readPanel(page, 'cv-pan-left');
		expectClose(p.offset.x, 0, 0.01);
		expectClose(p.offset.y, 0, 0.01);

		// Left button pans.
		box = await viewportBox(page, 'cv-pan-left');
		await page.mouse.move(box.x + 50, box.y + 50);
		await page.mouse.down({ button: 'left' });
		await page.mouse.move(box.x + 70, box.y + 65, { steps: 5 });
		await page.mouse.up({ button: 'left' });

		p = await readPanel(page, 'cv-pan-left');
		expectClose(p.offset.x, 20, 1);
		expectClose(p.offset.y, 15, 1);
	});

	test('shouldPan = shift+left: only shift+left pans', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-pan-shift-size')).toHaveText('320.00, 220.00');

		// Plain left drag is rejected.
		let box = await viewportBox(page, 'cv-pan-shift');
		await page.mouse.move(box.x + 50, box.y + 50);
		await page.mouse.down({ button: 'left' });
		await page.mouse.move(box.x + 90, box.y + 80, { steps: 5 });
		await page.mouse.up({ button: 'left' });

		let p = await readPanel(page, 'cv-pan-shift');
		expectClose(p.offset.x, 0, 0.01);
		expectClose(p.offset.y, 0, 0.01);

		// Shift+left pans.
		box = await viewportBox(page, 'cv-pan-shift');
		await page.keyboard.down('Shift');
		await page.mouse.move(box.x + 50, box.y + 50);
		await page.mouse.down({ button: 'left' });
		await page.mouse.move(box.x + 80, box.y + 70, { steps: 5 });
		await page.mouse.up({ button: 'left' });
		await page.keyboard.up('Shift');

		p = await readPanel(page, 'cv-pan-shift');
		expectClose(p.offset.x, 30, 1);
		expectClose(p.offset.y, 20, 1);
	});
});

test.describe('ControlledView — origin', () => {
	for (const [o, expected] of [
		['center', '110.00, 85.00'],
		['top-left', '0.00, 0.00'],
		['top-right', '220.00, 0.00'],
		['bottom-left', '0.00, 170.00'],
		['bottom-right', '220.00, 170.00']
	] as const) {
		test(`origin="${o}" anchors center at ${expected}`, async ({ page }) => {
			await page.goto(BASE);
			await expect(page.locator(`#cv-origin-${o}-center`)).toHaveText(expected);
		});
	}
});

test.describe('ControlledView — aspectRatio', () => {
	for (const [id, expected] of [
		['cv-ar-portrait', '110.00, 220.00'],
		['cv-ar-square', '220.00, 220.00'],
		['cv-ar-landscape', '320.00, 160.00']
	] as const) {
		test(`${id} letterboxes size to ${expected} and keeps center at element center`, async ({
			page
		}) => {
			await page.goto(BASE);
			await expect(page.locator(`#${id}-size`)).toHaveText(expected);
			await expect(page.locator(`#${id}-center`)).toHaveText('160.00, 110.00');
		});
	}
});

test.describe('ControlledView — resize & CSS custom properties', () => {
	test('resizing width updates size/center/rect', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-default-size')).toHaveText('320.00, 220.00');

		await page.locator('#cv-default-w').evaluate((el, val) => {
			const input = el as HTMLInputElement;
			input.value = val;
			input.dispatchEvent(new Event('input', { bubbles: true }));
			input.dispatchEvent(new Event('change', { bubbles: true }));
		}, '400');

		await expect(page.locator('#cv-default-size')).toHaveText('400.00, 220.00');
		await expect(page.locator('#cv-default-center')).toHaveText('200.00, 110.00');
		await expect(page.locator('#cv-default-rect-start')).toHaveText('-200.00, -110.00');
		await expect(page.locator('#cv-default-rect-end')).toHaveText('200.00, 110.00');
	});

	test('content element exposes --cv-* custom properties that track scale', async ({ page }) => {
		await page.goto(BASE);
		await expect(page.locator('#cv-default-size')).toHaveText('320.00, 220.00');

		const content = page.locator('#cv-default [data-controlled-view-content]');
		const readVar = (name: string) =>
			content.evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name);

		expectClose(parseFloat(await readVar('--cv-scale')), 1, 0.001);
		expectClose(parseFloat(await readVar('--cv-offset-x')), 0, 0.001);
		expectClose(parseFloat(await readVar('--cv-offset-y')), 0, 0.001);
		expectClose(parseFloat(await readVar('--cv-center-x')), 160, 0.01);
		expectClose(parseFloat(await readVar('--cv-center-y')), 110, 0.01);

		// After zooming, --cv-scale tracks the new value.
		const box = await viewportBox(page, 'cv-default');
		await page.mouse.move(box.x + 80, box.y + 60);
		await page.mouse.wheel(0, -100);
		await expect(page.locator('#cv-default-scale')).not.toHaveText('1.00');

		expectClose(parseFloat(await readVar('--cv-scale')), 1.1, 0.01);
	});
});

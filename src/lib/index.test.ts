import { describe, expect, test } from 'vitest';
import { ScaledView, ControlledView } from './index.js';

describe('ScaledView', () => {
	test('exports a ScaledView component', () => {
		expect(typeof ScaledView).toBe('object');
		expect(typeof ScaledView.Root).toBe('function');
		expect(typeof ScaledView.Content).toBe('function');
	});
});

describe('ControlledView', () => {
	test('exports a ControlledView component', () => {
		expect(typeof ControlledView).toBe('object');
		expect(typeof ControlledView.Root).toBe('function');
		expect(typeof ControlledView.Content).toBe('function');

		expect(typeof ControlledView.getAnchor).toBe('function');
		expect(typeof ControlledView.i2r).toBe('function');
		expect(typeof ControlledView.r2i).toBe('function');
		expect(typeof ControlledView.startDrag).toBe('function');
	});
});

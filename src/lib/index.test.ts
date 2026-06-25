import { describe, expect, test } from 'vitest';
import { ScaledView } from './index.js';

describe('ScaledView', () => {
	test('exports a ScaledView component', () => {
		expect(typeof ScaledView).toBe('object');
		expect(typeof ScaledView.Root).toBe('function');
		expect(typeof ScaledView.Content).toBe('function');
	});
});

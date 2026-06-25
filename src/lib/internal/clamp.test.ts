import { describe, expect, test } from 'vitest';
import { clamp } from './clamp.js';

describe('clamp', () => {
	test('clamps a value between a min and max', () => {
		expect(clamp(0, 0, 1)).toBe(0);
		expect(clamp(1, 0, 1)).toBe(1);
		expect(clamp(2, 0, 1)).toBe(1);
		expect(clamp(-1, 0, 1)).toBe(0);
	});
});

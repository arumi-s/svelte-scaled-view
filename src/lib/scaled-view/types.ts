import type { PrimitiveElementAttributes, WithChild } from '$lib/internal/types.js';
import type { Without } from 'svelte-toolbelt';

export type ScaledViewRootPropsWithoutHTML = WithChild<{
	fit?: 'none' | 'contain' | 'cover' | 'fill';
	min?: number;
	max?: number;
}>;

export type ScaledViewRootProps = ScaledViewRootPropsWithoutHTML &
	Without<PrimitiveElementAttributes, ScaledViewRootPropsWithoutHTML>;

export type ScaledViewContentPropsWithoutHTML = WithChild<
	{
		scale?: {
			x: number;
			y: number;
		};
		onScaleChange?: (value: { x: number; y: number }) => void;
	},
	{ x: number; y: number }
>;

export type ScaledViewContentProps = ScaledViewContentPropsWithoutHTML &
	Without<PrimitiveElementAttributes, ScaledViewContentPropsWithoutHTML>;

/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { PrimitiveElementAttributes, WithChild } from '$lib/internal/types.js';
import type { Without } from 'svelte-toolbelt';

export interface Vector2 {
	x: number;
	y: number;
}

export interface Rect2 {
	start: Vector2;
	end: Vector2;
}

/**
 * Controls where content origin `(0, 0)` is anchored within the viewport. `'center'` (default)
 * places it at the viewport center; the corner values place it at the corresponding corner.
 */
export type Origin = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ControlledViewCallbacks {
	onSizeChange?: (size: Vector2) => void;
	onRectChange?: (rect: Rect2) => void;
	onCenterChange?: (center: Vector2) => void;
	onScaleChange?: (scale: number) => void;
	onOffsetChange?: (offset: Vector2) => void;
}

export type ControlledViewRootPropsWithoutHTML = WithChild<{
	/**
	 * When set, the logical viewport size used for the coordinate math is constrained to this
	 * aspect ratio (`width / height`).
	 */
	aspectRatio?: number;
	/**
	 * Where content origin `(0, 0)` is anchored within the viewport. Defaults to `'center'`.
	 * Affects `center`, `rect`, coordinate transforms and the zoom focal point.
	 */
	origin?: Origin;
	/**
	 * Minimum (inclusive) scale factor. Defaults to `0`.
	 */
	min?: number;
	/**
	 * Maximum (inclusive) scale factor. Defaults to `Infinity`.
	 */
	max?: number;
	/**
	 * Current logical viewport size (bindable).
	 */
	size?: Vector2;
	/**
	 * Current visible rectangle in content coordinates (bindable).
	 */
	rect?: Rect2;
	/**
	 * Current element center in screen pixels (bindable). The logical viewport is centered
	 * within the element, so this is where content origin `(0, 0)` lands.
	 */
	center?: Vector2;
	/**
	 * Current uniform scale factor (bindable).
	 */
	scale?: number;
	/**
	 * Current pan offset in content coordinates (bindable).
	 */
	offset?: Vector2;
	/**
	 * Predicate deciding whether a `mousedown` event should initiate panning.
	 * Defaults to the middle mouse button (`event.button === 1`). Use this to
	 * customize the trigger — for example, left button while holding Shift:
	 * `(e) => e.button === 0 && e.shiftKey`.
	 */
	shouldPan?: (event: MouseEvent) => boolean;
	/**
	 * Computes the next scale factor from a wheel `event` and the current
	 * `scale`. Defaults to zooming in/out by ~1.1x per notch:
	 * `(e, scale) => scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1)`. The returned
	 * value is still clamped to `min`/`max`.
	 */
	getZoomScale?: (event: WheelEvent, scale: number) => number;
}> &
	ControlledViewCallbacks;

export type ControlledViewRootProps = ControlledViewRootPropsWithoutHTML &
	Without<PrimitiveElementAttributes, ControlledViewRootPropsWithoutHTML>;

export type ControlledViewContentPropsWithoutHTML = WithChild<
	{},
	{
		scale: number;
		offset: Vector2;
		size: Vector2;
		rect: Rect2;
		center: Vector2;
	}
>;

export type ControlledViewContentProps = ControlledViewContentPropsWithoutHTML &
	Without<PrimitiveElementAttributes, ControlledViewContentPropsWithoutHTML>;

import { clamp } from '$lib/internal/clamp.js';
import type { RefAttachment, WithRefOpts } from '$lib/internal/types.js';
import { Context, ElementSize, watch } from 'runed';
import {
	addEventListener,
	attachRef,
	executeCallbacks,
	onDestroyEffect,
	type ReadableBoxedValues,
	type WritableBoxedValues
} from 'svelte-toolbelt';
import type { Origin, Rect2, Vector2 } from './types.js';

const ControlledViewRootContext = new Context<ControlledViewRootState>('ControlledView.Root');

/**
 * Returns the anchor (in viewport-local coordinates) where content origin `(0, 0)` lands,
 * based on the chosen `origin`.
 */
export function getAnchor(origin: Origin, size: Vector2): Vector2 {
	switch (origin) {
		case 'top-left':
			return { x: 0, y: 0 };
		case 'top-right':
			return { x: size.x, y: 0 };
		case 'bottom-left':
			return { x: 0, y: size.y };
		case 'bottom-right':
			return { x: size.x, y: size.y };
		case 'center':
		default:
			return { x: size.x / 2, y: size.y / 2 };
	}
}

/**
 * Convert a point from content (internal) coordinates to viewport-local screen coordinates,
 * given the current `size`, `offset`, `scale` and `origin`. `origin` controls where content
 * `(0, 0)` is anchored within the viewport (defaults to `'center'`).
 */
export function i2r(
	point: Vector2,
	size: Vector2,
	offset: Vector2,
	scale: number,
	origin: Origin = 'center'
): Vector2 {
	const anchor = getAnchor(origin, size);
	return {
		x: (point.x + offset.x) * scale + anchor.x,
		y: (point.y + offset.y) * scale + anchor.y
	};
}

/**
 * Convert a point from viewport-local screen coordinates back to content (internal)
 * coordinates. `origin` must match the one used for the forward transform.
 */
export function r2i(
	point: Vector2,
	size: Vector2,
	offset: Vector2,
	scale: number,
	origin: Origin = 'center'
): Vector2 {
	const anchor = getAnchor(origin, size);
	return {
		x: (point.x - anchor.x) / scale - offset.x,
		y: (point.y - anchor.y) / scale - offset.y
	};
}

/**
 * Starts tracking a pointer drag originating from `event`, resolved relative to `container`.
 *
 * `onMove` receives the absolute pointer position (`x`, `y`) relative to the container as well
 * as the delta from the drag start (`relX`, `relY`). `onEnd` is invoked when the pointer is
 * released. Returns a `destroy` function that detaches the listeners early.
 *
 * Works for both mouse and touch events.
 */
export function startDrag<E extends MouseEvent | TouchEvent>(
	event: E,
	container: HTMLElement,
	onMove: (event: E, x: number, y: number, relX: number, relY: number) => void,
	onEnd?: (event: E) => void
): () => void {
	const isTouch = event instanceof TouchEvent;
	let initX = 0;
	let initY = 0;

	const move = (event: MouseEvent | TouchEvent, init = false) => {
		const rect = container.getBoundingClientRect();
		const view = container.ownerDocument.defaultView!;
		const offsetX = rect.left + view.scrollX;
		const offsetY = rect.top + view.scrollY;
		const touch = event instanceof TouchEvent;
		const x = (touch ? event.changedTouches[0].pageX : event.pageX) - offsetX;
		const y = (touch ? event.changedTouches[0].pageY : event.pageY) - offsetY;

		if (init) {
			initX = x;
			initY = y;
		}

		onMove(event as E, x, y, x - initX, y - initY);
	};

	// Move once on init so callers can capture the starting position.
	move(event, true);

	let destroy = () => {};
	const stop = (event: MouseEvent | TouchEvent) => {
		destroy();
		onEnd?.(event as E);
	};

	if (isTouch) {
		destroy = executeCallbacks(
			addEventListener(document, 'touchmove', move, { passive: true }),
			addEventListener(document, 'touchend', stop)
		);
	} else {
		destroy = executeCallbacks(
			addEventListener(document, 'mousemove', move, { passive: true }),
			addEventListener(document, 'mouseup', stop)
		);
	}

	return destroy;
}

interface ControlledViewRootStateOpts
	extends
		WithRefOpts,
		ReadableBoxedValues<{
			aspectRatio: number | undefined;
			min: number;
			max: number;
			origin: Origin;
			shouldPan: (event: MouseEvent) => boolean;
			getZoomScale: (event: WheelEvent, scale: number) => number;
		}>,
		WritableBoxedValues<{
			size: Vector2;
			rect: Rect2;
			center: Vector2;
			scale: number;
			offset: Vector2;
		}> {}

export class ControlledViewRootState {
	static create(opts: ControlledViewRootStateOpts) {
		return ControlledViewRootContext.set(new ControlledViewRootState(opts));
	}

	readonly opts: ControlledViewRootStateOpts;
	readonly attachment: RefAttachment;
	readonly elementSize: ElementSize;

	private isPanning = false;
	private destroyDrag?: () => void;

	constructor(opts: ControlledViewRootStateOpts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref, (v) => (this.opts.ref.current = v));

		this.elementSize = new ElementSize(() => this.opts.ref.current, { box: 'border-box' });

		watch(
			() => this.size,
			(size) => {
				this.opts.size.current = size;
			}
		);
		watch(
			() => this.rect,
			(rect) => {
				this.opts.rect.current = rect;
			}
		);
		watch(
			() => this.center,
			(center) => {
				this.opts.center.current = center;
			}
		);

		$effect(() => {
			const node = this.opts.ref.current;
			if (!node) return;

			return executeCallbacks(
				addEventListener(node, 'wheel', this.handleWheel, { passive: false }),
				addEventListener(node, 'mousedown', this.handleMouseDown)
			);
		});

		onDestroyEffect(() => {
			this.destroyDrag?.();
		});
	}

	/**
	 * Logical viewport size used by the coordinate transforms. When `aspectRatio` is set, the
	 * size is constrained to that ratio (matching the original `setSize` behavior).
	 */
	readonly size = $derived.by<Vector2>(() => {
		const width = this.elementSize.width;
		const height = this.elementSize.height;

		if (!(width > 0 || height > 0)) return { x: 0, y: 0 };

		const ar = this.opts.aspectRatio.current;
		if (ar && width > 0 && height > 0) {
			const aspect = width / height;
			if (ar > aspect) return { x: width, y: width / ar };
			return { x: height * ar, y: height };
		}

		return { x: width, y: height };
	});

	/**
	 * The visible rectangle in content (internal) coordinates.
	 */
	readonly rect = $derived.by<Rect2>(() => {
		const size = this.size;
		const offset = this.opts.offset.current;
		const scale = this.opts.scale.current;
		const origin = this.opts.origin.current;
		if (scale <= 0) return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
		return {
			start: r2i({ x: 0, y: 0 }, size, offset, scale, origin),
			end: r2i(size, size, offset, scale, origin)
		};
	});

	/**
	 * The anchor point (in element pixels) where content origin `(0, 0)` lands before applying
	 * `offset`. Derived from `origin`: the element center for `'center'`, or the corresponding
	 * corner otherwise. The logical viewport is centered within the element when `aspectRatio`
	 * is set, so corner anchors sit at the viewport corners.
	 */
	readonly center = $derived.by<Vector2>(() => {
		const width = this.elementSize.width;
		const height = this.elementSize.height;
		if (!(width > 0 || height > 0)) return { x: 0, y: 0 };
		const size = this.size;
		// The viewport is centered within the element; the anchor lives inside it.
		const viewportOffset = {
			x: (width - size.x) / 2,
			y: (height - size.y) / 2
		};
		const anchor = getAnchor(this.opts.origin.current, size);
		return {
			x: viewportOffset.x + anchor.x,
			y: viewportOffset.y + anchor.y
		};
	});

	private handleWheel = (event: WheelEvent) => {
		const size = this.size;
		if (size.x === 0 || size.y === 0) return;

		const scale = this.opts.scale.current;
		if (scale <= 0 || event.deltaY === 0) return;

		const node = this.opts.ref.current;
		if (!node) return;

		event.preventDefault();

		const rect = node.getBoundingClientRect();
		const pointer = {
			x: event.clientX - rect.left - (this.elementSize.width - size.x) / 2,
			y: event.clientY - rect.top - (this.elementSize.height - size.y) / 2
		};
		const offset = this.opts.offset.current;
		const origin = this.opts.origin.current;

		const oldPoint = r2i(pointer, size, offset, scale, origin);

		const next = clamp(
			this.opts.getZoomScale.current(event, scale),
			this.opts.min.current,
			this.opts.max.current
		);
		if (next <= 0) return;

		const newPoint = r2i(pointer, size, offset, next, origin);

		this.opts.scale.current = next;
		this.opts.offset.current = {
			x: offset.x + newPoint.x - oldPoint.x,
			y: offset.y + newPoint.y - oldPoint.y
		};
	};

	private handleMouseDown = (event: MouseEvent) => {
		if (this.isPanning || !this.opts.shouldPan.current(event)) return;

		const node = this.opts.ref.current;
		if (!node) return;

		event.preventDefault();
		this.isPanning = true;

		const start = { ...this.opts.offset.current };
		const scale = this.opts.scale.current;

		this.destroyDrag = startDrag(
			event,
			node,
			(_event, _x, _y, relX, relY) => {
				this.opts.offset.current = {
					x: start.x + relX / scale,
					y: start.y + relY / scale
				};
			},
			() => {
				this.isPanning = false;
			}
		);
	};

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				'data-controlled-view-container': '',
				...this.attachment
			}) as const
	);
}

type ControlledViewContentStateOpts = WithRefOpts;

export class ControlledViewContentState {
	static create(opts: ControlledViewContentStateOpts) {
		return new ControlledViewContentState(opts, ControlledViewRootContext.get());
	}

	readonly opts: ControlledViewContentStateOpts;
	readonly root: ControlledViewRootState;
	readonly attachment: RefAttachment;

	constructor(opts: ControlledViewContentStateOpts, root: ControlledViewRootState) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => (this.opts.ref.current = v));
	}

	readonly scale = $derived.by(() => this.root.opts.scale.current);
	readonly offset = $derived.by(() => this.root.opts.offset.current);
	readonly size = $derived.by(() => this.root.size);
	readonly rect = $derived.by(() => this.root.rect);
	readonly center = $derived.by(() => this.root.center);

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				'data-controlled-view-content': '',
				style: {
					'--cv-scale': this.scale,
					'--cv-offset-x': this.offset.x,
					'--cv-offset-y': this.offset.y,
					'--cv-center-x': this.center.x,
					'--cv-center-y': this.center.y
				},
				...this.attachment
			}) as const
	);
}

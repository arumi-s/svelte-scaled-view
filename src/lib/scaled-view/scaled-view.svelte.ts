import { clamp } from '$lib/internal/clamp.js';
import type { RefAttachment, WithRefOpts } from '$lib/internal/types.js';
import { Context, ElementSize, watch } from 'runed';
import { attachRef, type ReadableBoxedValues, type WritableBoxedValues } from 'svelte-toolbelt';

const ScaledViewRootContext = new Context<ScaledViewRootState>('ScaledView.Root');

interface ScaledViewRootStateOpts
	extends
		WithRefOpts,
		ReadableBoxedValues<{
			fit: 'none' | 'contain' | 'cover' | 'fill';
			min: number;
			max: number;
		}> {}

export class ScaledViewRootState {
	static create(opts: ScaledViewRootStateOpts) {
		return ScaledViewRootContext.set(new ScaledViewRootState(opts));
	}

	readonly opts: ScaledViewRootStateOpts;
	readonly attachment: RefAttachment;

	size: ElementSize;

	constructor(opts: ScaledViewRootStateOpts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref, (v) => (this.opts.ref.current = v));

		this.size = new ElementSize(() => this.opts.ref.current, { box: 'content-box' });
	}

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				'data-scaled-view-container': '',
				...this.attachment
			}) as const
	);
}

interface ScaledViewContentStateOpts
	extends
		WithRefOpts,
		WritableBoxedValues<{
			scale: {
				x: number;
				y: number;
			};
		}> {}

export class ScaledViewContentState {
	static create(opts: ScaledViewContentStateOpts) {
		return new ScaledViewContentState(opts, ScaledViewRootContext.get());
	}

	readonly opts: ScaledViewContentStateOpts;
	readonly root: ScaledViewRootState;
	readonly attachment: RefAttachment;
	readonly size: ElementSize;
	readonly ratio = $derived.by(() => ({
		x: this.size.width === 0 ? 1 : this.root.size.width / this.size.width,
		y: this.size.height === 0 ? 1 : this.root.size.height / this.size.height
	}));

	constructor(opts: ScaledViewContentStateOpts, root: ScaledViewRootState) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => (this.opts.ref.current = v));

		this.size = new ElementSize(() => this.opts.ref.current, { box: 'border-box' });

		watch(
			[
				() => this.ratio,
				() => this.root.opts.fit.current,
				() => this.root.opts.min.current,
				() => this.root.opts.max.current
			],
			([ratio, fit, min, max]) => {
				if (fit === 'fill') {
					this.opts.scale.current = { x: clamp(ratio.x, min, max), y: clamp(ratio.y, min, max) };
				} else if (fit === 'cover') {
					const maxScale = clamp(Math.max(ratio.y, ratio.x), min, max);
					this.opts.scale.current = { x: maxScale, y: maxScale };
				} else if (fit === 'none') {
					this.opts.scale.current = { x: 1, y: 1 };
				} else {
					const minScale = clamp(Math.min(ratio.y, ratio.x), min, max);
					this.opts.scale.current = { x: minScale, y: minScale };
				}
			}
		);
	}

	readonly props = $derived.by(
		() =>
			({
				id: this.opts.id.current,
				'data-scaled-view-content': '',
				style: {
					'--scale-x': `${this.opts.scale.current.x}`,
					'--scale-y': `${this.opts.scale.current.y}`
				},
				...this.attachment
			}) as const
	);
}

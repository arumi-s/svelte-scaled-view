export { default as Root } from './controlled-view.svelte';
export { default as Content } from './controlled-view-content.svelte';

export { getAnchor, i2r, r2i, startDrag } from './controlled-view.svelte.js';

export type {
	ControlledViewRootPropsWithoutHTML as RootProps,
	ControlledViewContentPropsWithoutHTML as ContentProps,
	Origin,
	Rect2,
	Vector2
} from './types.js';

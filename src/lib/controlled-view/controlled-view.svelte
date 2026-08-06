<script lang="ts">
	import { watch } from 'runed';
	import { boxWith, mergeProps } from 'svelte-toolbelt';
	import { ControlledViewRootState } from './controlled-view.svelte.js';
	import type { ControlledViewRootProps } from './types.js';

	const uid = $props.id();

	let {
		id = `controlled-view-${uid}`,
		aspectRatio = undefined,
		origin = 'center',
		min = 0,
		max = Infinity,
		size = $bindable(),
		rect = $bindable(),
		center = $bindable(),
		scale = $bindable(),
		offset = $bindable(),
		shouldPan = (event: MouseEvent) => event.button === 1,
		getZoomScale = (event: WheelEvent, scale: number) => scale * (event.deltaY < 0 ? 1.1 : 1 / 1.1),
		onSizeChange,
		onRectChange,
		onCenterChange,
		onScaleChange,
		onOffsetChange,
		ref = $bindable(null),
		child,
		children,
		...restProps
	}: ControlledViewRootProps = $props();

	function handleDefaults() {
		if (scale === undefined) scale = 1;
		if (offset === undefined) offset = { x: 0, y: 0 };
	}

	// SSR
	handleDefaults();

	watch.pre(
		() => [scale, offset],
		() => {
			handleDefaults();
		}
	);

	const rootState = ControlledViewRootState.create({
		id: boxWith(() => id),
		aspectRatio: boxWith(() => aspectRatio),
		origin: boxWith(() => origin),
		min: boxWith(() => min ?? 0),
		max: boxWith(() => max ?? Infinity),
		shouldPan: boxWith(() => shouldPan),
		getZoomScale: boxWith(() => getZoomScale),
		size: boxWith(
			() => size!,
			(v) => {
				size = v;
				onSizeChange?.(v);
			}
		),
		rect: boxWith(
			() => rect!,
			(v) => {
				rect = v;
				onRectChange?.(v);
			}
		),
		center: boxWith(
			() => center!,
			(v) => {
				center = v;
				onCenterChange?.(v);
			}
		),
		scale: boxWith(
			() => scale!,
			(v) => {
				scale = v;
				onScaleChange?.(v);
			}
		),
		offset: boxWith(
			() => offset!,
			(v) => {
				offset = v;
				onOffsetChange?.(v);
			}
		),
		ref: boxWith(
			() => ref,
			(v) => (ref = v)
		)
	});

	const mergedProps = $derived(mergeProps(restProps, rootState.props));
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}

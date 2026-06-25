<script lang="ts">
	import { watch } from 'runed';
	import { boxWith, mergeProps } from 'svelte-toolbelt';
	import { ScaledViewContentState } from './scaled-view.svelte.js';
	import type { ScaledViewContentProps } from './types.js';

	const uid = $props.id();

	let {
		id = `scaled-view-content-${uid}`,
		ref = $bindable(null),
		scale = $bindable(),
		onScaleChange = () => {},
		child,
		children,
		...restProps
	}: ScaledViewContentProps = $props();

	function handleDefaultValue() {
		if (scale !== undefined) return;
		const defaultValue = { x: 0, y: 0 };
		scale = defaultValue;
	}

	// SSR
	handleDefaultValue();

	watch.pre(
		() => scale,
		() => {
			handleDefaultValue();
		}
	);

	const contentState = ScaledViewContentState.create({
		id: boxWith(() => id),
		scale: boxWith(
			() => scale as { x: number; y: number },
			(v) => {
				scale = v;
				onScaleChange(v);
			}
		),
		ref: boxWith(
			() => ref,
			(v) => (ref = v)
		)
	});

	const mergedProps = $derived(mergeProps(restProps, contentState.props));
</script>

{#if child}
	{@render child({ props: mergedProps, ...contentState.opts.scale.current })}
{:else}
	<div {...mergedProps}>
		{@render children?.(contentState.opts.scale.current)}
	</div>
{/if}

<style>
	:global([data-scaled-view-content]) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: top left;
		translate: calc(-50% * var(--scale-x)) calc(-50% * var(--scale-y));
		scale: var(--scale-x) var(--scale-y);
	}
</style>

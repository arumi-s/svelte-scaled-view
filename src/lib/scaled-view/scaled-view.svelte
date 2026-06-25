<script lang="ts">
	import { boxWith, mergeProps } from 'svelte-toolbelt';
	import { ScaledViewRootState } from './scaled-view.svelte.js';
	import type { ScaledViewRootProps } from './types.js';

	const uid = $props.id();

	let {
		id = `scaled-view-${uid}`,
		fit = 'contain',
		min = 0,
		max = Infinity,
		ref = $bindable(null),
		child,
		children,
		...restProps
	}: ScaledViewRootProps = $props();

	const rootState = ScaledViewRootState.create({
		id: boxWith(() => id),
		fit: boxWith(() => fit),
		min: boxWith(() => min ?? 0),
		max: boxWith(() => max ?? Infinity),
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

<style>
	:global([data-scaled-view-container]) {
		position: relative;
		overflow: hidden;
		width: 100%;
		height: 100%;
	}
</style>

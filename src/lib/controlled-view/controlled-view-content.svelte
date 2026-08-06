<script lang="ts">
	import { boxWith, mergeProps } from 'svelte-toolbelt';
	import { ControlledViewContentState } from './controlled-view.svelte.js';
	import type { ControlledViewContentProps } from './types.js';

	const uid = $props.id();

	let {
		id = `controlled-view-content-${uid}`,
		ref = $bindable(null),
		child,
		children,
		...restProps
	}: ControlledViewContentProps = $props();

	const contentState = ControlledViewContentState.create({
		id: boxWith(() => id),
		ref: boxWith(
			() => ref,
			(v) => (ref = v)
		)
	});

	const mergedProps = $derived(mergeProps(restProps, contentState.props));

	const snippetProps = $derived({
		scale: contentState.scale,
		offset: contentState.offset,
		size: contentState.size,
		rect: contentState.rect,
		center: contentState.center
	});
</script>

{#if child}
	{@render child({ props: mergedProps, ...snippetProps })}
{:else}
	<div {...mergedProps}>
		{@render children?.(snippetProps)}
	</div>
{/if}

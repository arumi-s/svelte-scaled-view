<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export let fit: 'none' | 'contain' | 'cover' | 'fill' = 'contain';
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;

	let baseElement: HTMLElement;
	let contentElement: HTMLElement;

	let baseOffsetWidth = 0;
	let baseOffsetHeight = 0;
	let contentOffsetWidth = 0;
	let contentOffsetHeight = 0;

	export let scaleX = 1;
	export let scaleY = 1;

	let RO: ResizeObserver;

	function onResize(entries?: ResizeObserverEntry[]) {
		let baseRect: Pick<DOMRect, 'height' | 'width'> | undefined = undefined;
		let contentRect: Pick<DOMRect, 'height' | 'width'> | undefined = undefined;

		if (entries != null && entries.length > 0) {
			for (let index = 0; index < entries.length; index++) {
				const entry = entries[index];
				if (entry.target === baseElement) baseRect = entry.contentRect;
				else if (entry.target === contentElement) contentRect = entry.contentRect;
			}
		}

		if (baseRect == null) {
			const styles = getComputedStyle(baseElement);
			baseRect = {
				height:
					baseElement.offsetHeight -
					(parseFloat(styles.paddingTop) || 0) -
					(parseFloat(styles.paddingBottom) || 0),
				width:
					baseElement.offsetWidth -
					(parseFloat(styles.paddingLeft) || 0) -
					(parseFloat(styles.paddingRight) || 0)
			};
		}
		if (contentRect == null) {
			contentRect = {
				height: contentElement.offsetHeight,
				width: contentElement.offsetWidth
			};
		}

		baseOffsetWidth = baseRect.width;
		baseOffsetHeight = baseRect.height;
		contentOffsetWidth = contentRect.width;
		contentOffsetHeight = contentRect.height;
	}

	function clamp(value: number) {
		return Math.max(Math.min(value, max ?? Infinity), min ?? 0);
	}

	onMount(() => {
		RO = new ResizeObserver(onResize);
	});

	onDestroy(() => {
		RO?.disconnect();
	});

	$: if (baseElement) RO.observe(baseElement);
	$: if (contentElement) RO.observe(contentElement);

	$: {
		const ratioX = baseOffsetWidth / Math.max(1, contentOffsetWidth);
		const ratioY = baseOffsetHeight / Math.max(1, contentOffsetHeight);

		if (fit === 'fill') {
			scaleX = clamp(ratioX);
			scaleY = clamp(ratioY);
		} else if (fit === 'cover') {
			const maxScale = clamp(Math.max(ratioY, ratioX));
			scaleX = maxScale;
			scaleY = maxScale;
		} else if (fit === 'none') {
			scaleX = 1;
			scaleY = 1;
		} else {
			const minScale = clamp(Math.min(ratioY, ratioX));
			scaleX = minScale;
			scaleY = minScale;
		}
	}
</script>

<div bind:this={baseElement} class="scaled-base">
	<div
		bind:this={contentElement}
		class="scaled-content"
		style:transform={`scale(${
			scaleX === scaleY ? scaleX : `${scaleX},${scaleY}`
		}) translate(-50%,-50%)`}
	>
		<slot {scaleX} {scaleY} />
	</div>
</div>

<style>
	.scaled-base {
		display: block;
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	.scaled-content {
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: left top;
	}
</style>

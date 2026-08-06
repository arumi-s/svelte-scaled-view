<script lang="ts">
	import { ControlledView } from '$lib/index.js';
	import { untrack } from 'svelte';

	let {
		id,
		title,
		origin = undefined,
		shouldPan = undefined,
		getZoomScale = undefined,
		min = undefined,
		max = undefined,
		aspectRatio = undefined,
		width = 320,
		height = 220
	}: {
		id: string;
		title: string;
		width?: number;
		height?: number;
	} & Pick<
		ControlledView.RootProps,
		'origin' | 'shouldPan' | 'getZoomScale' | 'min' | 'max' | 'aspectRatio'
	> = $props();

	let scale = $state(1);
	let offset = $state.raw({ x: 0, y: 0 });
	let size = $state({ x: 0, y: 0 });
	let rect = $state.raw({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
	let center = $state.raw({ x: 0, y: 0 });

	let w = $state(untrack(() => width));
	let h = $state(untrack(() => height));

	// Checkerboard grid driven by scale/offset/center so it follows zoom & pan.
	// One tile == `tile` content units; the grid origin tracks content (0, 0).
	const tile = 20;
	const gridStyle = $derived.by(() => {
		const ts = Math.max(tile * scale, 1);
		const half = ts / 2;
		const gx = center.x + offset.x * scale;
		const gy = center.y + offset.y * scale;
		const s = `${ts}px ${ts}px`;
		return `background-size: ${s}, ${s}, ${s}, ${s}; background-position: ${gx}px ${gy}px, ${gx}px ${gy + half}px, ${gx + half}px ${gy - half}px, ${gx - half}px ${gy}px;`;
	});

	const f = (n: number) => n.toFixed(2);
	const vec = (p: { x: number; y: number }) => `${f(p.x)}, ${f(p.y)}`;
</script>

<div class="demo" {id}>
	<h3>
		<span class="title">{title}</span>
		<span class="controls">
			<label>w<input id={`${id}-w`} type="range" min="150" max="500" bind:value={w} /></label>
			<label>h<input id={`${id}-h`} type="range" min="100" max="400" bind:value={h} /></label>
			<span class="dims">{w}×{h}</span>
		</span>
	</h3>

	<div class="examples">
		<ControlledView.Root
			class="viewport"
			style="width:{w}px; height:{h}px"
			{origin}
			{shouldPan}
			{getZoomScale}
			{min}
			{max}
			{aspectRatio}
			bind:scale
			bind:offset
			bind:size
			bind:rect
			bind:center
		>
			<div class="grid" style={gridStyle}></div>
			{#if aspectRatio !== undefined}
				<div
					class="vp-border"
					style:left="{center.x - size.x / 2}px"
					style:top="{center.y - size.y / 2}px"
					style:width="{size.x}px"
					style:height="{size.y}px"
				></div>
			{/if}
			<ControlledView.Content class="world">
				<div class="axis v"></div>
				<div class="axis h"></div>
				<div class="origin"></div>
				<div class="pt a" style="left:60px;top:-35px">A</div>
				<div class="pt b" style="left:-75px;top:-25px">B</div>
				<div class="pt c" style="left:-35px;top:65px">C</div>
				<div class="pt d" style="left:85px;top:60px">D</div>
			</ControlledView.Content>
		</ControlledView.Root>

		<div class="panel">
			<div><span>scale</span><code id={`${id}-scale`}>{f(scale)}</code></div>
			<div><span>offset</span><code id={`${id}-offset`}>{vec(offset)}</code></div>
			<div><span>size</span><code id={`${id}-size`}>{vec(size)}</code></div>
			<div><span>center</span><code id={`${id}-center`}>{vec(center)}</code></div>
			<div><span>rect.start</span><code id={`${id}-rect-start`}>{vec(rect.start)}</code></div>
			<div><span>rect.end</span><code id={`${id}-rect-end`}>{vec(rect.end)}</code></div>
		</div>
	</div>
</div>

<style>
	.demo {
		border-radius: 0.5rem;
		border: 1px solid #cbd5e1;
		width: fit-content;
	}

	.demo h3 {
		border-top-left-radius: 0.5rem;
		border-top-right-radius: 0.5rem;
		background-color: #cbd5e1;
		margin: 0;
		padding: 0.4rem 0.75rem;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.title {
		font-family: monospace;
	}

	.controls {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.72rem;
		color: #334155;
	}

	.controls label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.controls input[type='range'] {
		width: 80px;
		vertical-align: middle;
	}

	.dims {
		font-family: monospace;
		opacity: 0.7;
		min-width: 4.5em;
		text-align: right;
	}

	.examples {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
	}

	.demo :global(.viewport) {
		position: relative;
		overflow: hidden;
		flex: none;
		background: #ffffff;
	}

	.grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		background-color: #ffffff;
		background-image:
			linear-gradient(45deg, #fde68a 25%, transparent 25%),
			linear-gradient(-45deg, #fde68a 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #fde68a 75%),
			linear-gradient(-45deg, transparent 75%, #fde68a 75%);
	}

	.vp-border {
		position: absolute;
		border: 2px dashed #ef4444;
		pointer-events: none;
	}

	/*
	 * The "world" is the Content element. It carries the CSS custom properties
	 * (--cv-scale, --cv-offset-x/y, --cv-center-x/y) set by ControlledView.Content.
	 * We translate content origin (0,0) to `center + offset * scale`, then scale.
	 */
	.demo :global(.world) {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		transform: translate(
				calc(var(--cv-center-x) * 1px + var(--cv-offset-x) * var(--cv-scale) * 1px),
				calc(var(--cv-center-y) * 1px + var(--cv-offset-y) * var(--cv-scale) * 1px)
			)
			scale(var(--cv-scale));
	}

	.axis {
		position: absolute;
		background: #334155;
	}

	.axis.v {
		left: -0.5px;
		top: -500px;
		width: 1px;
		height: 1000px;
	}

	.axis.h {
		left: -500px;
		top: -0.5px;
		width: 1000px;
		height: 1px;
	}

	.origin {
		position: absolute;
		left: -4px;
		top: -4px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
	}

	.pt {
		position: absolute;
		transform: translate(-50%, -50%);
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 10px;
		font-weight: 600;
		color: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.pt.a {
		background: #0ea5e9;
	}
	.pt.b {
		background: #22c55e;
	}
	.pt.c {
		background: #a855f7;
	}
	.pt.d {
		background: #f97316;
	}

	.panel {
		display: grid;
		gap: 0.35rem;
		font-size: 0.8rem;
		min-width: 180px;
		align-self: flex-start;
	}

	.panel > div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.panel span {
		color: #64748b;
	}

	.demo :global(code) {
		background: #f1f5f9;
		border-radius: 0.25rem;
		padding: 0.05rem 0.3rem;
		font-size: 0.85em;
	}
</style>

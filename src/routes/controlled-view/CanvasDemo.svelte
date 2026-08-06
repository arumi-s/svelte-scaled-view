<script lang="ts">
	import { ControlledView } from '$lib/index.js';
	import { untrack } from 'svelte';

	let {
		title,
		origin = undefined,
		shouldPan = undefined,
		min = undefined,
		max = undefined,
		width = 320,
		height = 220
	}: {
		title: string;
		origin?: ControlledView.Origin;
		shouldPan?: (event: MouseEvent) => boolean;
		min?: number;
		max?: number;
		width?: number;
		height?: number;
	} = $props();

	let scale = $state(1);
	let offset = $state.raw({ x: 0, y: 0 });
	let size = $state({ x: 0, y: 0 });
	let rect = $state.raw({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
	let center = $state.raw({ x: 0, y: 0 });

	let w = $state(untrack(() => width));
	let h = $state(untrack(() => height));

	let canvas = $state<HTMLCanvasElement | null>(null);

	// Checkerboard grid driven by scale/offset/center so it follows zoom & pan.
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

	// Redraw whenever the viewport size or visible content rect changes.
	$effect(() => {
		const c = canvas;
		if (!c) return;
		if (size.x <= 0 || size.y <= 0) return;
		const dx = rect.end.x - rect.start.x;
		const dy = rect.end.y - rect.start.y;
		if (!(dx > 0) || !(dy > 0)) return;
		const ctx = c.getContext('2d');
		if (!ctx) return;

		// `size` controls the canvas backing store (× dpr for crispness).
		const dpr = window.devicePixelRatio || 1;
		const bw = Math.max(1, Math.round(size.x * dpr));
		const bh = Math.max(1, Math.round(size.y * dpr));
		if (c.width !== bw) c.width = bw;
		if (c.height !== bh) c.height = bh;

		// Draw in logical pixels (size coordinates).
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, size.x, size.y);

		// Map content coords onto the canvas: rect.start -> 0, rect.end -> size.
		const mx = (cx: number) => ((cx - rect.start.x) / dx) * size.x;
		const my = (cy: number) => ((cy - rect.start.y) / dy) * size.y;

		// axes through content origin (0, 0), spanning the whole visible range
		ctx.strokeStyle = '#334155';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(mx(0), 0);
		ctx.lineTo(mx(0), size.y);
		ctx.moveTo(0, my(0));
		ctx.lineTo(size.x, my(0));
		ctx.stroke();

		// origin marker
		ctx.fillStyle = '#ef4444';
		ctx.beginPath();
		ctx.arc(mx(0), my(0), 4, 0, Math.PI * 2);
		ctx.fill();

		// labelled points in content coordinates
		const pts: [string, number, number, string][] = [
			['A', 60, -35, '#0ea5e9'],
			['B', -75, -25, '#22c55e'],
			['C', -35, 65, '#a855f7'],
			['D', 85, 60, '#f97316']
		];
		ctx.font = '600 10px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (const [label, cx, cy, color] of pts) {
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(mx(cx), my(cy), 9, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = '#fff';
			ctx.fillText(label, mx(cx), my(cy));
		}
	});
</script>

<div class="demo">
	<h3>
		<span class="title">{title}</span>
		<span class="controls">
			<label>w<input type="range" min="150" max="500" bind:value={w} /></label>
			<label>h<input type="range" min="100" max="400" bind:value={h} /></label>
			<span class="dims">{w}×{h}</span>
		</span>
	</h3>

	<div class="examples">
		<ControlledView.Root
			class="viewport"
			style="width:{w}px; height:{h}px"
			{origin}
			{shouldPan}
			{min}
			{max}
			bind:scale
			bind:offset
			bind:size
			bind:rect
			bind:center
		>
			<div class="grid" style={gridStyle}></div>
			<canvas class="cv-canvas" bind:this={canvas}></canvas>
		</ControlledView.Root>

		<div class="panel">
			<div><span>scale</span><code>{f(scale)}</code></div>
			<div><span>offset</span><code>{vec(offset)}</code></div>
			<div><span>size</span><code>{vec(size)}</code></div>
			<div><span>center</span><code>{vec(center)}</code></div>
			<div><span>rect.start</span><code>{vec(rect.start)}</code></div>
			<div><span>rect.end</span><code>{vec(rect.end)}</code></div>
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

	.cv-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;
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

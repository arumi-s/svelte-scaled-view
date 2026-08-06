<script lang="ts">
	import { ControlledView } from '$lib/index.js';

	const ORIGIN = 'center' as const;
	const INITIAL_SCALE = 200;
	const MIN_SCALE = 10;
	const MAX_SCALE = 10000;

	let size = $state({ x: 0, y: 0 });
	let scale = $state(INITIAL_SCALE);
	let offset = $state.raw({ x: 0, y: 0 });
	let center = $state.raw({ x: 0, y: 0 });
	let rect = $state.raw({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });

	let rootEl = $state<HTMLElement | null>(null);
	let cursor = $state<{ x: number; y: number } | null>(null);

	let majorGridSize = $state(1);
	let minorGridSize = $state(0.2);

	// Adaptive "nice" grid: keep minor lines >= 20px on screen, snapped to 1/2/5 × 10^k.
	function updateGridSize(s: number) {
		if (!(s > 0)) return;
		const target = 20 / s;
		const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
		const normalized = target / magnitude;
		const rounded = normalized < 1 ? 1 : normalized < 2 ? 2 : normalized < 5 ? 5 : 10;
		minorGridSize = rounded * magnitude;
		majorGridSize = (rounded === 1 ? 5 : rounded === 2 ? 10 : rounded === 5 ? 20 : 50) * magnitude;
	}

	$effect(() => updateGridSize(scale));

	// Map a content coordinate to a screen pixel within the viewport (origin = 'center').
	const sx = (cx: number) => cx * scale + offset.x * scale + center.x;
	const sy = (cy: number) => cy * scale + offset.y * scale + center.y;

	// Visible major-grid tick values within [start, end].
	function ticks(start: number, end: number, step: number): number[] {
		if (!(step > 0) || !(end > start)) return [];
		const i0 = Math.ceil(start / step);
		const i1 = Math.floor(end / step);
		const out: number[] = [];
		for (let i = i0; i <= i1; i++) out.push(i * step);
		return out;
	}

	const xTicks = $derived(ticks(rect.start.x, rect.end.x, majorGridSize));
	const yTicks = $derived(ticks(rect.start.y, rect.end.y, majorGridSize));

	// Drop FP noise and collapse -0 to 0 for display.
	function fmt(v: number): string {
		const n = Math.round(v * 1e6) / 1e6;
		return n === 0 ? '0' : n.toString();
	}

	const f = (n: number) => n.toFixed(2);
	const vec = (p: { x: number; y: number }) => `${f(p.x)}, ${f(p.y)}`;

	const cursorContent = $derived(
		cursor && size.x > 0 && size.y > 0
			? ControlledView.r2i(cursor, size, offset, scale, ORIGIN)
			: null
	);
	const zoomPct = $derived((scale / INITIAL_SCALE) * 100);

	// Track the cursor over the viewport for the crosshair + readout.
	$effect(() => {
		const el = rootEl;
		if (!el) return;
		const move = (e: MouseEvent) => {
			const r = el.getBoundingClientRect();
			cursor = { x: e.clientX - r.left, y: e.clientY - r.top };
		};
		const leave = () => {
			cursor = null;
		};
		el.addEventListener('mousemove', move);
		el.addEventListener('mouseleave', leave);
		return () => {
			el.removeEventListener('mousemove', move);
			el.removeEventListener('mouseleave', leave);
		};
	});

	// Zoom around an arbitrary screen point (viewport-local), keeping that content point fixed.
	function zoomAt(point: { x: number; y: number }, factor: number) {
		if (size.x <= 0 || size.y <= 0 || scale <= 0) return;
		const oldPoint = ControlledView.r2i(point, size, offset, scale, ORIGIN);
		const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
		if (next === scale) return;
		const newPoint = ControlledView.r2i(point, size, offset, next, ORIGIN);
		scale = next;
		offset = { x: offset.x + newPoint.x - oldPoint.x, y: offset.y + newPoint.y - oldPoint.y };
	}

	const zoomByCenter = (factor: number) => zoomAt({ x: size.x / 2, y: size.y / 2 }, factor);
	const resetView = () => {
		scale = INITIAL_SCALE;
		offset = { x: 0, y: 0 };
	};

	const verticalBg = `linear-gradient(to right, currentColor 1px, transparent 1px)`;
	const horizontalBg = `linear-gradient(to bottom, currentColor 1px, transparent 1px)`;
	const ox = () => offset.x * scale + center.x;
	const oy = () => offset.y * scale + center.y;

	// Reduce a background-position modulo its tile size so the value handed to CSS stays
	// small. Browsers composite repeating backgrounds with limited subpixel precision, so a
	// large position (high zoom / panned far from origin) makes the `mod size` step drift
	// differently per layer — and minor/major lines stop coinciding. Reducing in JS (double
	// precision) keeps both layers phase-accurate without changing where lines are drawn.
	const posmod = (n: number, m: number) => ((n % m) + m) % m;
	const minorSizePx = $derived(scale * minorGridSize);
	const majorSizePx = $derived(scale * majorGridSize);
	const minorPosX = $derived(posmod(ox(), minorSizePx));
	const minorPosY = $derived(posmod(oy(), minorSizePx));
	const majorPosX = $derived(posmod(ox(), majorSizePx));
	const majorPosY = $derived(posmod(oy(), majorSizePx));
</script>

<svelte:head>
	<title>Grid — ControlledView</title>
</svelte:head>

<div class="page">
	<ControlledView.Root
		origin={ORIGIN}
		min={MIN_SCALE}
		max={MAX_SCALE}
		shouldPan={(e) => e.button === 0 || e.button === 1}
		bind:ref={rootEl}
		bind:size
		bind:rect
		bind:center
		bind:scale
		bind:offset
		style="position:relative;display:grid;height:100%;width:100%;overflow:hidden;background:#fff;"
	>
		<!-- minor grid -->
		<div
			class="layer"
			style:color="#eef2f7"
			style:background-size="{minorSizePx}px {minorSizePx}px"
			style:background-position="{minorPosX}px {minorPosY}px"
			style:background-image="{verticalBg}, {horizontalBg}"
		></div>
		<!-- major grid -->
		<div
			class="layer"
			style:color="#cbd5e1"
			style:background-size="{majorSizePx}px {majorSizePx}px"
			style:background-position="{majorPosX}px {majorPosY}px"
			style:background-image="{verticalBg}, {horizontalBg}"
		></div>
		<!-- axes through content origin (0, 0) -->
		<div
			class="layer"
			style:color="#334155"
			style:background-repeat="repeat-y"
			style:background-position="{ox()}px {oy()}px"
			style:background-image={verticalBg}
		></div>
		<div
			class="layer"
			style:color="#334155"
			style:background-repeat="repeat-x"
			style:background-position="{ox()}px {oy()}px"
			style:background-image={horizontalBg}
		></div>
		<!-- origin marker -->
		<div class="origin" style:left="{ox()}px" style:top="{oy()}px"></div>

		<!-- tick labels along the top (x) and left (y) edges -->
		<div class="layer labels">
			{#each xTicks as t (t)}
				{#if t !== 0}
					<span class="tick tick-x" style:left="{sx(t)}px">{fmt(t)}</span>
				{/if}
			{/each}
			{#each yTicks as t (t)}
				{#if t !== 0}
					<span class="tick tick-y" style:top="{sy(t)}px">{fmt(t)}</span>
				{/if}
			{/each}
			<span class="tick tick-x origin-label" style:left="{sx(0)}px">0</span>
			<span class="tick tick-y origin-label" style:top="{sy(0)}px">0</span>
		</div>

		<!-- cursor crosshair -->
		{#if cursor}
			<div class="crosshair-v" style:left="{cursor.x}px"></div>
			<div class="crosshair-h" style:top="{cursor.y}px"></div>
		{/if}
	</ControlledView.Root>

	<!-- HUD: live readouts (pointer-events pass through so panning still works under it) -->
	<div class="overlay hud">
		<div class="card">
			<div class="row"><span>zoom</span><code>{zoomPct.toFixed(0)}%</code></div>
			<div class="row">
				<span>grid</span><code>{fmt(minorGridSize)} / {fmt(majorGridSize)}</code>
			</div>
			<div class="row">
				<span>cursor</span><code
					>{cursorContent ? `${fmt(cursorContent.x)}, ${fmt(cursorContent.y)}` : '—'}</code
				>
			</div>
		</div>
		<details class="card debug">
			<summary>bindable outputs</summary>
			<div class="row"><span>scale</span><code>{f(scale)}</code></div>
			<div class="row"><span>size</span><code>{vec(size)}</code></div>
			<div class="row"><span>center</span><code>{vec(center)}</code></div>
			<div class="row"><span>offset</span><code>{vec(offset)}</code></div>
			<div class="row"><span>rect</span><code>{vec(rect.start)} → {vec(rect.end)}</code></div>
		</details>
	</div>

	<!-- zoom controls -->
	<div class="overlay controls">
		<button type="button" onclick={() => zoomByCenter(1 / 1.2)} aria-label="Zoom out">−</button>
		<button type="button" onclick={resetView} aria-label="Reset view">⟲</button>
		<button type="button" onclick={() => zoomByCenter(1.2)} aria-label="Zoom in">+</button>
	</div>

	<div class="overlay hint">scroll to zoom • drag to pan • move the cursor for coordinates</div>
</div>

<style>
	.page {
		position: fixed;
		inset: 0;
	}

	/* All viewport children stack in the single grid cell. */
	.layer {
		grid-column: 1;
		grid-row: 1;
	}

	.labels {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.origin {
		position: absolute;
		grid-column: 1;
		grid-row: 1;
		width: 7px;
		height: 7px;
		margin: -4px 0 0 -4px;
		border-radius: 50%;
		background: #ef4444;
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
		pointer-events: none;
	}

	.tick {
		position: absolute;
		font-family: monospace;
		font-size: 11px;
		line-height: 1;
		color: #475569;
		background: #ffffff;
		padding: 2px 4px;
		border-radius: 3px;
		pointer-events: none;
	}

	.tick-x {
		top: 6px;
		transform: translateX(-50%);
	}

	.tick-y {
		left: 6px;
		transform: translateY(-50%);
	}

	.origin-label {
		font-weight: 600;
		color: #334155;
	}

	.crosshair-v,
	.crosshair-h {
		position: absolute;
		grid-column: 1;
		grid-row: 1;
		background: #0ea5e9;
		opacity: 0.45;
		pointer-events: none;
	}

	.crosshair-v {
		top: 0;
		bottom: 0;
		width: 1px;
		margin-left: -0.5px;
	}

	.crosshair-h {
		left: 0;
		right: 0;
		height: 1px;
		margin-top: -0.5px;
	}

	.overlay {
		position: absolute;
		pointer-events: none;
		z-index: 10;
	}

	.hud {
		top: 12px;
		left: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 280px;
	}

	.card {
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		padding: 8px 10px;
		font-size: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		line-height: 1.6;
	}

	.row span {
		color: #64748b;
	}

	.card code {
		font-family: monospace;
		font-size: 11px;
		background: #f1f5f9;
		border-radius: 4px;
		padding: 1px 5px;
	}

	.debug summary {
		cursor: pointer;
		color: #64748b;
		font-size: 11px;
		margin-bottom: 4px;
		list-style: none;
		pointer-events: auto;
	}

	.debug summary::before {
		content: '▸ ';
	}

	.debug[open] summary::before {
		content: '▾ ';
	}

	.debug[open] summary {
		margin-bottom: 6px;
	}

	.controls {
		bottom: 16px;
		right: 16px;
		display: flex;
		flex-direction: row;
		gap: 6px;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		padding: 6px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.controls button {
		pointer-events: auto;
		font-size: 16px;
		line-height: 1;
		width: 30px;
		height: 30px;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		background: #fff;
		color: #334155;
		cursor: pointer;
		padding: 0;
	}

	.controls button:hover {
		background: #f1f5f9;
	}

	.controls button:active {
		background: #e2e8f0;
	}

	.hint {
		bottom: 16px;
		left: 16px;
		font-family: monospace;
		font-size: 11px;
		color: #64748b;
		background: rgba(255, 255, 255, 0.8);
		padding: 4px 8px;
		border-radius: 6px;
	}
</style>

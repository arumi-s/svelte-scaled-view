<script lang="ts">
	import Demo from './Demo.svelte';
	import CanvasDemo from './CanvasDemo.svelte';

	const origins = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
</script>

<svelte:head>
	<title>ControlledView — Svelte Scaled View</title>
</svelte:head>

<h1>ControlledView</h1>

<p>
	<code>ControlledView</code> is an interactive zoom &amp; pan viewport. Scroll inside a viewport to
	zoom toward the cursor, and drag to pan. It exposes the live <code>scale</code>,
	<code>offset</code>, <code>size</code>, <code>rect</code> and <code>center</code> through bindable
	props, snippet props on <code>Content</code>, and CSS custom properties (<code>--cv-scale</code>,
	<code>--cv-offset-x/y</code>, <code>--cv-center-x/y</code>).
</p>

<p class="hint">
	Default pan trigger is the <strong>middle mouse button</strong>. Drag the <code>w</code> /
	<code>h</code> sliders on any demo to resize the viewport and watch the outputs update. See
	<a href="#pan-trigger">Pan Trigger</a> to customize the trigger.
</p>

<h2>Interactive Zoom &amp; Pan</h2>
<div class="demos">
	<Demo id="cv-default" title="default — scroll to zoom, middle-drag to pan" />
</div>

<h2 id="origin">Origin</h2>
<p>
	The <code>origin</code> prop decides where content origin <code>(0, 0)</code> is anchored within
	the viewport. It affects <code>center</code>, the coordinate transforms and the zoom focal point.
	The red dot marks <code>(0, 0)</code>.
</p>
<div class="demos">
	{#each origins as o (o)}
		<Demo id={`cv-origin-${o}`} title={`origin="${o}"`} origin={o} width={220} height={170} />
	{/each}
</div>

<h2 id="pan-trigger">Pan Trigger</h2>
<p>
	Pass a <code>shouldPan</code> predicate to choose which <code>mousedown</code> starts panning.
</p>
<div class="demos">
	<Demo
		id="cv-pan-left"
		title="shouldPan = (e) => e.button === 0"
		shouldPan={(e) => e.button === 0}
	/>
	<Demo
		id="cv-pan-shift"
		title="shouldPan = (e) => e.button === 0 && e.shiftKey"
		shouldPan={(e) => e.button === 0 && e.shiftKey}
	/>
</div>

<h2 id="zoom-speed">Zoom Speed</h2>
<p>
	Pass a <code>getZoomScale</code> function to take over the wheel-to-scale calculation. It receives
	the wheel <code>event</code> and the current <code>scale</code>, and returns the next scale (still
	clamped to <code>min</code>/<code>max</code>). The default zooms by ~1.1x per notch; below are two
	alternatives — faster discrete steps, and continuous exponential scaling driven by
	<code>deltaY</code> magnitude.
</p>
<div class="demos">
	<Demo
		id="cv-zoom-fast"
		title="getZoomScale = (e, s) => s * (e.deltaY < 0 ? 1.5 : 1 / 1.5)"
		getZoomScale={(e, s) => s * (e.deltaY < 0 ? 1.5 : 1 / 1.5)}
	/>
	<Demo
		id="cv-zoom-exp"
		title="getZoomScale = (e, s) => s * Math.exp(-e.deltaY * 0.01)"
		getZoomScale={(e, s) => s * Math.exp(-e.deltaY * 0.01)}
	/>
</div>

<h2>Scale Clamping</h2>
<p>Use <code>min</code> and <code>max</code> to bound the zoom range.</p>
<div class="demos">
	<Demo id="cv-clamp" title="min=0.5 max=2" min={0.5} max={2} />
</div>
<h2>Aspect Ratio</h2>
<p>
	Setting <code>aspectRatio</code> constrains the logical viewport size used by the coordinate math; the
	viewport is centered and letterboxed within the element. The dashed box shows the logical viewport region.
</p>
<div class="demos">
	<Demo id="cv-ar-portrait" title="aspectRatio=0.5 (portrait)" aspectRatio={0.5} />
	<Demo id="cv-ar-square" title="aspectRatio=1 (square)" aspectRatio={1} />
	<Demo id="cv-ar-landscape" title="aspectRatio=2 (landscape)" aspectRatio={2} />
</div>

<h2>Canvas Rendering</h2>
<p>
	Instead of HTML + CSS transforms, render to a <code>&lt;canvas&gt;</code> directly: the canvas
	backing store is sized from <code>size</code> and content is drawn by mapping <code>rect</code>
	(the visible content range) onto it. No <code>Content</code> component is needed — just read the bound
	outputs and redraw in an effect.
</p>
<div class="demos">
	<CanvasDemo title="canvas — size controls buffer, rect controls range" />
</div>

<style>
	.demos {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	code {
		background: #f1f5f9;
		border-radius: 0.25rem;
		padding: 0.05rem 0.3rem;
		font-size: 0.85em;
	}

	.hint {
		color: #475569;
	}
</style>

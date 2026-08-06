<script lang="ts">
	import { ScaledView } from '$lib/index.js';
	import { onDestroy } from 'svelte';
	import { cubicInOut } from 'svelte/easing';

	function printScale(x: number, y: number) {
		return `${x.toFixed(2)} x ${y.toFixed(2)}`;
	}

	const loop = 10000;

	let time = $state(loop);

	let raf: number | undefined = undefined;
	function run(t: number) {
		time = t;
		raf = requestAnimationFrame(run);
	}

	let isAnimating = $state(false);
	let width = $derived(`${cubicInOut((time % (loop + 1)) / loop) * 400}px`);
	let height = $derived(`${cubicInOut((time % (loop + 1)) / loop) * 300}px`);

	let bindWidth = $state('400px');
	let bindHeight = $state('300px');
	let bindScale = $state({ x: 0, y: 0 });

	function toggleAnimation() {
		cancelAnimationFrame(raf!);
		if (isAnimating) {
			isAnimating = false;
			time = loop;
		} else {
			isAnimating = true;
			time = 0;
			run(0);
		}
	}

	onDestroy(() => {
		if (raf) cancelAnimationFrame(raf);
	});
</script>

<svelte:head>
	<title>ScaledView — Svelte Scaled View</title>
</svelte:head>

<h1>ScaledView</h1>

<button onclick={toggleAnimation}>Toggle Animation</button>

<p>
	<code>ScaledView</code> scales the content within it to fit its parent element using one of four
	strategies (contain, cover, fill, and none). It exposes the live <code>scale</code> through
	bindable props and snippet props on <code>Content</code> (the <code>x</code> and <code>y</code> scale
	factors).
</p>

<p class="hint">
	Each parent box is a fixed-size container with a <code>160 × 90</code> child. Use the
	<strong>Toggle Animation</strong> button to drive the parent size across a range, or watch the
	dashed content reflow as the parent changes shape. See <a href="#clamping">Clamped Scale</a> to
	bound the ratio and <a href="#bind">Bind Scale</a> to read it out.
</p>

<h2 id="strategies">Scaling Strategies</h2>
<p>
	The <code>fit</code> prop selects how the content is scaled relative to its parent:
	<code>contain</code> scales uniformly to fit inside, <code>cover</code> scales uniformly to fill,
	<code>fill</code> stretches independently on each axis, and <code>none</code> leaves the content at
	its natural size.
</p>

<div class="demos">
	<div class="demo">
		<h3>fit="contain" (default)</h3>
		<div class="examples">
			<div id="contain-1" class="parent" style:width style:height>
				<ScaledView.Root fit="contain">
					<ScaledView.Content
						style={{
							width: '160px',
							height: '90px'
						}}
					>
						{#snippet child({ props, x, y })}
							<div class="content" {...props}>
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="contain-2" class="parent" style:width={height} style:height={width}>
				<ScaledView.Root fit="contain">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="contain-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView.Root fit="contain">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="cover"</h3>
		<div class="examples">
			<div id="cover-1" class="parent" style:width style:height>
				<ScaledView.Root fit="cover">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="cover-2" class="parent" style:width={height} style:height={width}>
				<ScaledView.Root fit="cover">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="cover-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView.Root fit="cover">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="fill"</h3>
		<div class="examples">
			<div id="fill-1" class="parent" style:width style:height>
				<ScaledView.Root fit="fill">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="fill-2" class="parent" style:width={height} style:height={width}>
				<ScaledView.Root fit="fill">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="fill-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView.Root fit="fill">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="none"</h3>
		<div class="examples">
			<div id="none-1" class="parent" style:width style:height>
				<ScaledView.Root fit="none">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="none-2" class="parent" style:width={height} style:height={width}>
				<ScaledView.Root fit="none">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="none-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView.Root fit="none">
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>
		</div>
	</div>
</div>

<h2 id="clamping">Clamped Scale</h2>
<p>Use <code>min</code> and <code>max</code> to bound the computed scale ratio.</p>

<div class="demos">
	<div class="demo">
		<h3>fit="contain" min={1} max={2}</h3>
		<div class="examples">
			<div id="clamped-1" class="parent" style:width style:height>
				<ScaledView.Root fit="contain" min={1} max={2}>
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="clamped-2" class="parent" style:width={height} style:height={width}>
				<ScaledView.Root fit="contain" min={1} max={2}>
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>

			<div id="clamped-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView.Root fit="contain" min={1} max={2}>
					<ScaledView.Content>
						{#snippet children({ x, y })}
							<div class="content" style:width="160px" style:height="90px">
								{printScale(x, y)}
							</div>
						{/snippet}
					</ScaledView.Content>
				</ScaledView.Root>
			</div>
		</div>
	</div>
</div>

<h2 id="bind">Bind Scale</h2>
<p>
	Bind <code>scale</code> on <code>Content</code> to read the computed factors reactively. Use the
	<strong>resize</strong> button to swap the parent dimensions and watch the values update.
</p>

<div class="demos">
	<div class="demo">
		<h3>
			fit="fill" <span id="bind-1-scale">{printScale(bindScale.x, bindScale.y)}</span>
			<button
				id="bind-1-resize"
				onclick={() => {
					[bindWidth, bindHeight] = [bindHeight, bindWidth];
				}}>resize</button
			>
		</h3>

		<div class="examples">
			<div id="bind-1" class="parent" style:width={bindWidth} style:height={bindHeight}>
				<ScaledView.Root fit="fill">
					<ScaledView.Content bind:scale={bindScale}>
						<div class="content" style:width="160px" style:height="90px"></div>
					</ScaledView.Content>
				</ScaledView.Root>
			</div>
		</div>
	</div>
</div>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	.demos {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

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
		padding: 0.5rem 1rem;
	}

	.examples {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.parent {
		margin: 12px;
		background-color: #fde68a;
	}

	.content {
		background-image:
			linear-gradient(45deg, #67e8f9 25%, transparent 25%),
			linear-gradient(-45deg, #67e8f9 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #67e8f9 75%),
			linear-gradient(-45deg, transparent 75%, #67e8f9 75%);
		background-size: 20px 20px;
		background-position:
			0 0,
			0 10px,
			10px -10px,
			-10px 0px;
		display: grid;
		place-items: center;
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

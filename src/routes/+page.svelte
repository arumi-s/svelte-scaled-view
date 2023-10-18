<script lang="ts">
	import { ScaledView } from '../lib';

	function printScale(x: number, y: number) {
		return `${x.toFixed(2)} x ${y.toFixed(2)}`;
	}
</script>

<svelte:head>
	<title>Svelte Scaled View Library</title>
</svelte:head>

<h1>Svelte Scaled View Library</h1>

<p>
	Svelte Scaled View provides a component called "ScaledView" that allows you to scale the content
	within it to fit its parent element using one of three strategies (contain, cover, and fill). It
	also allows you to clamp the scale ratio using an optional min and max prop.
</p>

<h2>Scaling Strategies</h2>

<div class="demos">
	<div class="demo">
		<h3>fit="contain" (default)</h3>
		<div class="examples">
			<div id="contain-1" class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="contain" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="contain-2" class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="contain" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="contain-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView fit="contain" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="cover"</h3>
		<div class="examples">
			<div id="cover-1" class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="cover" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="cover-2" class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="cover" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="cover-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView fit="cover" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="fill"</h3>
		<div class="examples">
			<div id="fill-1" class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="fill" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="fill-2" class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="fill" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="fill-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView fit="fill" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="none"</h3>
		<div class="examples">
			<div id="none-1" class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="none" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="none-2" class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="none" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="none-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView fit="none" let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>
		</div>
	</div>
</div>

<h2>Clamped Scale</h2>

<div class="demos">
	<div class="demo">
		<h3>fit="contain" min={1} max={2}</h3>
		<div class="examples">
			<div id="clamped-1" class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="contain" min={1} max={2} let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="clamped-2" class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="contain" min={1} max={2} let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>

			<div id="clamped-3" class="parent" style:width="120px" style:height="120px">
				<ScaledView fit="contain" min={1} max={2} let:scaleX let:scaleY>
					<div class="content" style:width="160px" style:height="90px">
						{printScale(scaleX, scaleY)}
					</div>
				</ScaledView>
			</div>
		</div>
	</div>
</div>

<style>
	.demos {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.demo {
		border-radius: 0.5rem;
		border: 1px solid #cbd5e1;
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
		background-image: linear-gradient(45deg, #67e8f9 25%, transparent 25%),
			linear-gradient(-45deg, #67e8f9 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #67e8f9 75%),
			linear-gradient(-45deg, transparent 75%, #67e8f9 75%);
		background-size: 20px 20px;
		background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
		display: grid;
		place-items: center;
	}
</style>

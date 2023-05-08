<script lang="ts">
	import { ScaledView } from '../lib';
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
			<div class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="contain">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>

			<div class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="contain">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="cover"</h3>
		<div class="examples">
			<div class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="cover">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>

			<div class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="cover">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="fill"</h3>
		<div class="examples">
			<div class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="fill">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>

			<div class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="fill">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>
		</div>
	</div>

	<div class="demo">
		<h3>fit="none"</h3>
		<div class="examples">
			<div class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="none">
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>

			<div class="parent" style:width="300px" style:height="400px">
				<ScaledView fit="none">
					<div class="content" style:width="160px" style:height="90px" />
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
			<div class="parent" style:width="400px" style:height="300px">
				<ScaledView fit="contain" min={1} max={2}>
					<div class="content" style:width="160px" style:height="90px" />
				</ScaledView>
			</div>

			<div class="parent" style:width="100px" style:height="400px">
				<ScaledView fit="contain" min={1} max={2}>
					<div class="content" style:width="160px" style:height="90px" />
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
	}
</style>

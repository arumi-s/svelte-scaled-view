<script lang="ts">
	import { ScaledView } from '../lib';
</script>

<h1>Welcome to Scaled View library</h1>

<h2>fit="contain"</h2>

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

<h2>fit="cover"</h2>

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

<h2>fit="fill"</h2>

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

<h2>fit="none"</h2>

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

<style>
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

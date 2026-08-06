<script lang="ts">
	import { resolve } from '$app/paths';

	const demos = [
		{
			href: resolve('/scaled-view'),
			name: 'ScaledView',
			description: 'Scale content to fit its parent using contain, cover, fill, or none.'
		},
		{
			href: resolve('/controlled-view'),
			name: 'ControlledView',
			description: 'Interactive zoom & pan viewport with bindable scale and offset.'
		}
	];
</script>

<svelte:head>
	<title>Svelte Scaled View Library</title>
</svelte:head>

<h1>Svelte Scaled View Library</h1>

<p>
	A collection of Svelte components for scaling and transforming content to fit its container. Pick
	a demo below to explore each component.
</p>

<ul class="demos">
	{#each demos as demo (demo.name)}
		<li>
			<a href={demo.href}>
				<strong>{demo.name}</strong>
				<span>{demo.description}</span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.demos {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.demos a {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		text-decoration: none;
		color: inherit;
	}

	.demos a:hover {
		background-color: #f1f5f9;
	}

	.demos span {
		color: #475569;
	}
</style>

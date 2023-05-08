# Svelte Scaled View Library

[![NPM](https://img.shields.io/npm/v/svelte-scaled-view)](https://www.npmjs.com/package/svelte-scaled-view)
![License](https://img.shields.io/npm/l/svelte-scaled-view)

Svelte Scaled View provides a component called "ScaledView" that allows you to scale the content within it to fit its parent element using one of three strategies (contain, cover, and fill). It also allows you to clamp the scale ratio using an optional min and max prop.

## Usage

### Install

First, install the library in your Svelte project from npm:

```bash
npm install svelte-scaled-view
```

### Include

Then, add it to your project:

```typescript
import ScaledView from 'svelte-scaled-view
```

### Basic

Once included, you can now use the ScaledView component in your project:

```svelte
<div class="container_with_a_non_zero_size">
	<ScaledView fit="contain">
		<div>My content to be scaled</div>
	</ScaledView>
</div>
```

In the above example, the `fit` prop is set to `contain`, which will scale the content to fit the parent element while maintaining its aspect ratio.

You can also choose to use other scaling methods like `cover` and `fill`:

```svelte
<ScaledView fit="cover">
	<div>My content to be scaled</div>
</ScaledView>
```

In this case, the content will be scaled to cover its parent element while maintaining of aspect ratio.

Or you can use `fill` to scale the content to fill its parent element, regardless of aspect ratio:

```svelte
<ScaledView fit="fill">
	<div>My content to be scaled</div>
</ScaledView>
```

### Advanced

You may also pass in a `min` and `max` value to set a minimum and maximum scale ratio.

```svelte
<ScaledView fit="contain" min={0.5} max={2}>
	<div>My content to be scaled</div>
</ScaledView>
```

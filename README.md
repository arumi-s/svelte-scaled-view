# Svelte Scaled View Library

[![NPM](https://img.shields.io/npm/v/svelte-scaled-view)](https://www.npmjs.com/package/svelte-scaled-view)
![License](https://img.shields.io/npm/l/svelte-scaled-view)

Svelte Scaled View provides a component called "ScaledView" that allows you to scale the content within it to fit its parent element using one of four strategies (`contain`, `cover`, `fill`, and `none`). It also allows you to clamp the scale ratio using an optional `min` and `max` prop.

> **v4 is a major rewrite.** It targets **Svelte 5**, adopts a **compound component** API (`ScaledView.Root` + `ScaledView.Content`), and adds [`runed`](https://www.npmjs.com/package/runed) and [`svelte-toolbelt`](https://www.npmjs.com/package/svelte-toolbelt) as peer dependencies. Svelte 4 / slot-based usage is still documented under [Legacy (v3) Usage](#legacy-v3-usage).

## Peer dependencies

In addition to `svelte`, v4 relies on two peer dependencies. Install them alongside this package:

```bash
npm install svelte-scaled-view runed svelte-toolbelt
```

## Usage (v4)

### Install

First, install the library in your Svelte project from npm:

```bash
npm install svelte-scaled-view runed svelte-toolbelt
```

### Include

The package exports the `ScaledView` namespace, which contains the `Root` and `Content` components (plus their prop types):

```typescript
import { ScaledView } from 'svelte-scaled-view';
```

### Basic

`ScaledView.Root` is the element whose size is observed. `ScaledView.Content` is the element that gets scaled to fit. Wrap your content with both:

```svelte
<div class="container_with_a_non_zero_size">
	<ScaledView.Root fit="contain">
		<ScaledView.Content>
			<div class="content" style:width="160px" style:height="90px">My content to be scaled</div>
		</ScaledView.Content>
	</ScaledView.Root>
</div>
```

In the above example, the `fit` prop is set to `contain`, which will scale the content to fit the parent element while maintaining its aspect ratio.

### Scaling strategies (`fit`)

The `fit` prop on `ScaledView.Root` accepts one of four strategies:

| `fit`     | Behavior                                                                          |
| --------- | --------------------------------------------------------------------------------- |
| `contain` | (default) Scales uniformly to fit _inside_ the parent, preserving aspect ratio.   |
| `cover`   | Scales uniformly to _cover_ the parent, preserving aspect ratio (may overflow).   |
| `fill`    | Scales independently on X and Y to fill the parent, ignoring aspect ratio.        |
| `none`    | No scaling; the content is rendered at its natural size (scale `{ x: 1, y: 1 }`). |

```svelte
<ScaledView.Root fit="cover">
	<ScaledView.Content>
		<div class="content" style:width="160px" style:height="90px">My content to be scaled</div>
	</ScaledView.Content>
</ScaledView.Root>
```

### Clamping the scale (`min` / `max`)

Pass `min` and/or `max` to `ScaledView.Root` to clamp the computed scale ratio. Both values are inclusive and apply to each axis independently.

```svelte
<ScaledView.Root fit="contain" min={0.5} max={2}>
	<ScaledView.Content>
		<div class="content" style:width="160px" style:height="90px">My content to be scaled</div>
	</ScaledView.Content>
</ScaledView.Root>
```

### Reading the current scale

There are two ways to obtain the current scale factors (`{ x, y }`).

**1. `bind:scale`** — a two-way bindable prop on `ScaledView.Content`:

```svelte
<script lang="ts">
	let scale = $state({ x: 0, y: 0 });
</script>

<ScaledView.Root fit="fill">
	<ScaledView.Content bind:scale>
		<div class="content" style:width="160px" style:height="90px"></div>
	</ScaledView.Content>
</ScaledView.Root>

<p>scaled by x:{scale.x} and y:{scale.y}</p>
```

**2. `onScaleChange` callback** — invoked whenever the scale is recomputed:

```svelte
<ScaledView.Root fit="contain">
	<ScaledView.Content onScaleChange={(s) => console.log(s)}>
		<div class="content" style:width="160px" style:height="90px"></div>
	</ScaledView.Content>
</ScaledView.Root>
```

### Snippet-based content (`children`)

Instead of passing static children, you can use the `children` snippet, which receives the current `{ x, y }` scale. This is useful when the rendered markup needs to react to the scale:

```svelte
<ScaledView.Root fit="contain">
	<ScaledView.Content>
		{#snippet children({ x, y })}
			<div class="content" style:width="160px" style:height="90px">
				scaled by x:{x.toFixed(2)} and y:{y.toFixed(2)}
			</div>
		{/snippet}
	</ScaledView.Content>
</ScaledView.Root>
```

### Render delegation (`child`)

For full control over the rendered element, use the `child` snippet. `ScaledView.Content` will _not_ render its own wrapper — instead it forwards the props (including the scale as CSS variables) for you to spread onto your own element. The snippet receives `{ props, x, y }`:

```svelte
<ScaledView.Root fit="contain">
	<ScaledView.Content style="width: 160px; height: 90px;">
		{#snippet child({ props, x, y })}
			<div class="content" {...props}>
				scaled by x:{x.toFixed(2)} and y:{y.toFixed(2)}
			</div>
		{/snippet}
	</ScaledView.Content>
</ScaledView.Root>
```

> The `style` prop on `ScaledView.Content` accepts an object (using `svelte-toolbelt`'s `StyleProperties`) or a string, and is merged with the internal scale CSS variables (`--scale-x`, `--scale-y`).

### Binding to the underlying DOM nodes

Both components expose a bindable `ref`:

```svelte
<ScaledView.Root bind:ref={rootEl} fit="contain">
	<ScaledView.Content bind:ref={contentEl}>
		<div class="content" style:width="160px" style:height="90px"></div>
	</ScaledView.Content>
</ScaledView.Root>
```

### Props

#### `ScaledView.Root`

| Prop       | Type                                       | Default     | Description                                                           |
| ---------- | ------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| `fit`      | `'contain' \| 'cover' \| 'fill' \| 'none'` | `'contain'` | Scaling strategy.                                                     |
| `min`      | `number`                                   | `0`         | Minimum scale ratio (inclusive).                                      |
| `max`      | `number`                                   | `Infinity`  | Maximum scale ratio (inclusive).                                      |
| `ref`      | `HTMLElement \| null` (bindable)           | `null`      | The container element.                                                |
| `child`    | `Snippet<[{ props }]>`                     | —           | Render-delegation snippet; receives the merged props for the element. |
| `children` | `Snippet`                                  | —           | Default content.                                                      |
| `...rest`  | `HTMLAttributes<HTMLElement>`              | —           | Any other HTML attributes are forwarded to the container element.     |

#### `ScaledView.Content`

| Prop            | Type                                        | Default    | Description                                                          |
| --------------- | ------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| `scale`         | `{ x: number; y: number }` (bindable)       | `{0,0}`    | The current scale. Read with `bind:scale`.                           |
| `onScaleChange` | `(value: { x: number; y: number }) => void` | `() => {}` | Called whenever the scale is recomputed.                             |
| `ref`           | `HTMLElement \| null` (bindable)            | `null`     | The content element.                                                 |
| `style`         | `StyleProperties \| string \| null`         | —          | Set the content's intrinsic dimensions (e.g. width/height).          |
| `child`         | `Snippet<[{ props, x, y }]>`                | —          | Render-delegation snippet; receives merged props plus current scale. |
| `children`      | `Snippet<[{ x, y }]>`                       | —          | Content snippet; receives the current scale.                         |
| `...rest`       | `HTMLAttributes<HTMLElement>`               | —          | Any other HTML attributes are forwarded to the content element.      |

## Legacy (v3) Usage

The API below is from **v3 and earlier**, which targets **Svelte 4** and ships the component as the default export with a single-element, slot-based interface. It is preserved here for projects that have not yet migrated.

> If you are still on Svelte 4, install v3 explicitly:
>
> ```bash
> npm install svelte-scaled-view@^3
> ```

### Include

```typescript
import ScaledView from 'svelte-scaled-view';
```

### Basic

```svelte
<div class="container_with_a_non_zero_size">
	<ScaledView fit="contain">
		<div>My content to be scaled</div>
	</ScaledView>
</div>
```

Other scaling methods (`cover` and `fill`) are also available:

```svelte
<ScaledView fit="cover">
	<div>My content to be scaled</div>
</ScaledView>
```

```svelte
<ScaledView fit="fill">
	<div>My content to be scaled</div>
</ScaledView>
```

### Advanced

Pass `min` and `max` to clamp the scale ratio:

```svelte
<ScaledView fit="contain" min={0.5} max={2}>
	<div>My content to be scaled</div>
</ScaledView>
```

Retrieve the scale factors via slot props:

```svelte
<div class="container_with_a_non_zero_size">
	<ScaledView fit="contain" let:scaleX let:scaleY>
		<div>this element is scaled by x:{scaleX} and y:{scaleY}</div>
	</ScaledView>
</div>
```

### Migrating from v3 to v4

| v3 (Svelte 4)                                 | v4 (Svelte 5)                                                                                   |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `import ScaledView from 'svelte-scaled-view'` | `import { ScaledView } from 'svelte-scaled-view'`                                               |
| `<ScaledView fit="contain">...</ScaledView>`  | `<ScaledView.Root fit="contain"><ScaledView.Content>...</ScaledView.Content></ScaledView.Root>` |
| `let:scaleX` / `let:scaleY` slot props        | `bind:scale` or `children` snippet `{ x, y }`                                                   |
| (not available)                               | `fit="none"`, `onScaleChange`, render delegation via `child`, bindable `ref`                    |

# Svelte Scaled View Library

[![NPM](https://img.shields.io/npm/v/svelte-scaled-view)](https://www.npmjs.com/package/svelte-scaled-view)
![License](https://img.shields.io/npm/l/svelte-scaled-view)

Svelte Scaled View provides a component called "ScaledView" that allows you to scale the content within it to fit its parent element using one of four strategies (`contain`, `cover`, `fill`, and `none`). It also allows you to clamp the scale ratio using an optional `min` and `max` prop.

For interactive zoom & pan, the package additionally ships `ControlledView` — a cursor-focal viewport with bindable `scale`/`offset`/`size`/`rect`/`center`. See [ControlledView](#controlledview).

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

## ControlledView

`ControlledView` is an interactive zoom & pan viewport built on the same compound-component pattern as `ScaledView`. Scroll inside the viewport to zoom toward the cursor, and drag to pan. Unlike `ScaledView` (which auto-computes a fit), `ControlledView` hands you direct, bindable control over a uniform `scale` and a pan `offset`, plus the derived `size`, `rect`, and `center`.

### Include

The package exports the `ControlledView` namespace, which contains the `Root` and `Content` components, the helper transforms (`i2r`, `r2i`, `getAnchor`, `startDrag`), and their prop/types:

```typescript
import { ControlledView } from 'svelte-scaled-view';
```

### Basic

`ControlledView.Root` is the viewport element whose size is observed and which captures wheel/drag gestures. `ControlledView.Content` is the element that gets the scale/offset applied (via CSS custom properties). Wrap your content with both:

```svelte
<script lang="ts">
	let scale = $state(1);
	let offset = $state({ x: 0, y: 0 });
</script>

<ControlledView.Root bind:scale bind:offset style="width: 320px; height: 220px; overflow: hidden;">
	<ControlledView.Content class="world">
		<div class="point" style="left: 60px; top: -35px;">A</div>
	</ControlledView.Content>
</ControlledView.Root>

<style>
	/* The Content element exposes the live transform as CSS custom properties. */
	.world {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		transform: translate(
				calc(var(--cv-center-x) * 1px + var(--cv-offset-x) * var(--cv-scale) * 1px),
				calc(var(--cv-center-y) * 1px + var(--cv-offset-y) * var(--cv-scale) * 1px)
			)
			scale(var(--cv-scale));
	}
</style>
```

Scroll inside the viewport to zoom toward the cursor; drag with the middle mouse button to pan.

> The `Content` element does **not** transform itself — it only exposes `--cv-scale`, `--cv-offset-x/y`, and `--cv-center-x/y`. Your CSS (or canvas effect) consumes them, which keeps the rendering strategy in your hands.

### Origin (`origin`)

The `origin` prop controls where content origin `(0, 0)` is anchored within the viewport. It affects `center`, the coordinate transforms, and the zoom focal point.

| `origin`       | Anchor                     |
| -------------- | -------------------------- |
| `center`       | (default) Viewport center. |
| `top-left`     | Top-left corner.           |
| `top-right`    | Top-right corner.          |
| `bottom-left`  | Bottom-left corner.        |
| `bottom-right` | Bottom-right corner.       |

```svelte
<ControlledView.Root origin="top-left" bind:scale bind:offset>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

### Scale clamping (`min` / `max`)

Pass `min` and/or `max` to clamp the zoom range. Both values are inclusive:

```svelte
<ControlledView.Root min={0.5} max={2} bind:scale bind:offset>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

### Pan trigger (`shouldPan`)

By default, panning starts on the **middle mouse button** (`event.button === 1`). Pass a `shouldPan` predicate to customize the trigger — for example, left-drag to pan:

```svelte
<ControlledView.Root shouldPan={(e) => e.button === 0} bind:scale bind:offset>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

…or Shift + left-drag:

```svelte
<ControlledView.Root shouldPan={(e) => e.button === 0 && e.shiftKey} bind:scale bind:offset>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

### Zoom speed (`getZoomScale`)

By default each wheel notch zooms by ~1.1x: `(e, scale) => scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1)`. Pass a `getZoomScale` function to take over the calculation — it receives the wheel `event` and the current `scale`, and returns the next scale (still clamped to `min`/`max`). For example, faster 1.5x steps:

```svelte
<ControlledView.Root
	getZoomScale={(e, scale) => scale * (e.deltaY < 0 ? 1.5 : 1 / 1.5)}
	bind:scale
	bind:offset
>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

### Aspect ratio (`aspectRatio`)

Setting `aspectRatio` (`width / height`) constrains the logical viewport size used by the coordinate math. The viewport is centered and letterboxed within the element — useful when you need a fixed-ratio logical canvas regardless of the element's shape:

```svelte
<ControlledView.Root aspectRatio={1} bind:scale bind:offset>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

### Reading the live viewport state

`ControlledView.Root` exposes five bindable outputs that fully describe the viewport. Bind whichever you need:

| Prop     | Type      | Description                                                                    |
| -------- | --------- | ------------------------------------------------------------------------------ |
| `scale`  | `number`  | Current uniform scale factor.                                                  |
| `offset` | `Vector2` | Current pan offset in content coordinates.                                     |
| `size`   | `Vector2` | Logical viewport size in CSS pixels (letterboxed when `aspectRatio` is set).   |
| `center` | `Vector2` | Element-local pixel position where content origin `(0, 0)` lands (the anchor). |
| `rect`   | `Rect2`   | The visible rectangle in content coordinates (`{ start: {x,y}, end: {x,y} }`). |

```svelte
<script lang="ts">
	let scale = $state(1);
	let offset = $state({ x: 0, y: 0 });
	let size = $state({ x: 0, y: 0 });
	let rect = $state({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
	let center = $state({ x: 0, y: 0 });
</script>

<ControlledView.Root bind:scale bind:offset bind:size bind:rect bind:center>
	<ControlledView.Content><!-- ... --></ControlledView.Content>
</ControlledView.Root>

<p>visible content range: {rect.start.x},{rect.start.y} → {rect.end.x},{rect.end.y}</p>
```

Each output also has a matching callback (`onScaleChange`, `onOffsetChange`, `onSizeChange`, `onRectChange`, `onCenterChange`) if you prefer events over bindings.

### Snippet-based content (`children`)

The `children` snippet on `Content` receives the live viewport state, useful when the rendered markup needs to react to it:

```svelte
<ControlledView.Root bind:scale bind:offset>
	<ControlledView.Content>
		{#snippet children({ scale, offset, size, rect, center })}
			<div>scale: {scale.toFixed(2)}</div>
		{/snippet}
	</ControlledView.Content>
</ControlledView.Root>
```

### Render delegation (`child`)

For full control over the rendered element, use the `child` snippet. `ControlledView.Content` forwards the merged props (including the `--cv-*` CSS variables) plus the viewport state for you to spread onto your own element:

```svelte
<ControlledView.Root bind:scale bind:offset>
	<ControlledView.Content>
		{#snippet child({ props, scale, offset })}
			<div class="world" {...props}>scaled by {scale.toFixed(2)}</div>
		{/snippet}
	</ControlledView.Content>
</ControlledView.Root>
```

### Rendering without `Content` (e.g. canvas)

`Content` is optional. Because `Root` already exposes the bindable state, you can render to a `<canvas>` directly — size the backing store from `size` and map the visible content range (`rect`) onto it:

```svelte
<script lang="ts">
	import { ControlledView } from 'svelte-scaled-view';

	let scale = $state(1);
	let offset = $state({ x: 0, y: 0 });
	let size = $state({ x: 0, y: 0 });
	let rect = $state({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
	let canvas = $state<HTMLCanvasElement | null>(null);

	$effect(() => {
		const c = canvas;
		if (!c || size.x <= 0 || size.y <= 0) return;
		const ctx = c.getContext('2d');
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;
		c.width = Math.round(size.x * dpr);
		c.height = Math.round(size.y * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, size.x, size.y);
		// Map content coords -> canvas pixels using `rect`.
		const dx = rect.end.x - rect.start.x;
		const dy = rect.end.y - rect.start.y;
		const mx = (cx: number) => ((cx - rect.start.x) / dx) * size.x;
		const my = (cy: number) => ((cy - rect.start.y) / dy) * size.y;
		ctx.beginPath();
		ctx.moveTo(mx(0), 0);
		ctx.lineTo(mx(0), size.y);
		ctx.stroke();
	});
</script>

<ControlledView.Root bind:scale bind:offset bind:size bind:rect>
	<canvas bind:this={canvas} style="width: 100%; height: 100%;"></canvas>
</ControlledView.Root>
```

### Coordinate transforms

The namespace exports pure helpers that mirror the internal math. Use them to convert between content (internal) coordinates and viewport-local screen coordinates:

```typescript
ControlledView.i2r(point, size, offset, scale, origin?); // content → screen
ControlledView.r2i(point, size, offset, scale, origin?); // screen → content
ControlledView.getAnchor(origin, size);                  // anchor for a given origin
```

For example, to zoom around an arbitrary screen point while keeping the content under it fixed:

```svelte
<script lang="ts">
	import { ControlledView } from 'svelte-scaled-view';

	const ORIGIN = 'center' as const;
	let size = $state({ x: 0, y: 0 });
	let scale = $state(1);
	let offset = $state({ x: 0, y: 0 });

	function zoomAt(point: { x: number; y: number }, factor: number) {
		const oldPoint = ControlledView.r2i(point, size, offset, scale, ORIGIN);
		const next = Math.max(0.1, Math.min(10, scale * factor));
		const newPoint = ControlledView.r2i(point, size, offset, next, ORIGIN);
		scale = next;
		offset = {
			x: offset.x + newPoint.x - oldPoint.x,
			y: offset.y + newPoint.y - oldPoint.y
		};
	}
</script>
```

`ControlledView.startDrag(event, container, onMove, onEnd?)` is a pointer-drag helper (mouse **and** touch) that `Root` uses internally for panning; reuse it for custom drag interactions. `onMove` receives the event, the absolute pointer position (`x`, `y`) relative to the container, and the delta from the drag start (`relX`, `relY`). It returns a `destroy` function to detach early.

### Binding to the underlying DOM nodes

Both components expose a bindable `ref`:

```svelte
<ControlledView.Root bind:ref={rootEl} bind:scale bind:offset>
	<ControlledView.Content bind:ref={contentEl}><!-- ... --></ControlledView.Content>
</ControlledView.Root>
```

### Props

#### `ControlledView.Root`

| Prop             | Type                                           | Default                                        | Description                                                           |
| ---------------- | ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| `origin`         | `Origin`                                       | `'center'`                                     | Where content origin `(0, 0)` is anchored.                            |
| `aspectRatio`    | `number`                                       | —                                              | Constrains the logical viewport size to this `width / height` ratio.  |
| `min`            | `number`                                       | `0`                                            | Minimum (inclusive) scale factor.                                     |
| `max`            | `number`                                       | `Infinity`                                     | Maximum (inclusive) scale factor.                                     |
| `scale`          | `number` (bindable)                            | `1`                                            | Current uniform scale factor.                                         |
| `offset`         | `Vector2` (bindable)                           | `{0,0}`                                        | Current pan offset in content coordinates.                            |
| `size`           | `Vector2` (bindable)                           | `{0,0}`                                        | Logical viewport size.                                                |
| `rect`           | `Rect2` (bindable)                             | —                                              | Visible rectangle in content coordinates.                             |
| `center`         | `Vector2` (bindable)                           | `{0,0}`                                        | Element-local pixel position of the content origin anchor.            |
| `shouldPan`      | `(event: MouseEvent) => boolean`               | `(e) => e.button === 1`                        | Predicate deciding whether a `mousedown` starts panning.              |
| `getZoomScale`   | `(event: WheelEvent, scale: number) => number` | `(e, s) => s * (e.deltaY < 0 ? 1.1 : 1 / 1.1)` | Computes the next scale from a wheel event (clamped to `min`/`max`).  |
| `onSizeChange`   | `(value: Vector2) => void`                     | —                                              | Called when the viewport size changes.                                |
| `onRectChange`   | `(value: Rect2) => void`                       | —                                              | Called when the visible rectangle changes.                            |
| `onCenterChange` | `(value: Vector2) => void`                     | —                                              | Called when the anchor position changes.                              |
| `onScaleChange`  | `(value: number) => void`                      | —                                              | Called when the scale changes.                                        |
| `onOffsetChange` | `(value: Vector2) => void`                     | —                                              | Called when the pan offset changes.                                   |
| `ref`            | `HTMLElement \| null` (bindable)               | `null`                                         | The viewport element.                                                 |
| `child`          | `Snippet<[{ props }]>`                         | —                                              | Render-delegation snippet; receives the merged props for the element. |
| `children`       | `Snippet`                                      | —                                              | Default content (rendered inside the viewport, not transformed).      |
| `...rest`        | `HTMLAttributes<HTMLElement>`                  | —                                              | Any other HTML attributes are forwarded to the viewport element.      |

#### `ControlledView.Content`

| Prop       | Type                                                      | Default | Description                                                           |
| ---------- | --------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `ref`      | `HTMLElement \| null` (bindable)                          | `null`  | The content element.                                                  |
| `child`    | `Snippet<[{ props, scale, offset, size, rect, center }]>` | —       | Render-delegation snippet; receives merged props plus viewport state. |
| `children` | `Snippet<[{ scale, offset, size, rect, center }]>`        | —       | Content snippet; receives the live viewport state.                    |
| `...rest`  | `HTMLAttributes<HTMLElement>`                             | —       | Any other HTML attributes are forwarded to the content element.       |

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

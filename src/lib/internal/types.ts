/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Snippet } from 'svelte';
import type {
	attachRef,
	ReadableBoxedValues,
	StyleProperties,
	WritableBoxedValues
} from 'svelte-toolbelt';
import type { HTMLAttributes } from 'svelte/elements';

export type WithChild<
	/**
	 * The props that the component accepts.
	 */
	Props extends Record<PropertyKey, unknown> = {},
	/**
	 * The props that are passed to the `child` and `children` snippets. The `ElementProps` are
	 * merged with these props for the `child` snippet.
	 */
	SnippetProps extends Record<PropertyKey, unknown> = { _default: never },
	/**
	 * The underlying DOM element being rendered. You can bind to this prop to
	 * programmatically interact with the element.
	 */
	Ref = HTMLElement
> = Omit<Props, 'child' | 'children'> & {
	child?: SnippetProps extends { _default: never }
		? Snippet<[{ props: Record<string, unknown> }]>
		: Snippet<[SnippetProps & { props: Record<string, unknown> }]>;
	children?: SnippetProps extends { _default: never } ? Snippet : Snippet<[SnippetProps]>;
	style?: StyleProperties | string | null | undefined;
	ref?: Ref | null | undefined;
};

export type WithRefOpts<T = {}> = T &
	ReadableBoxedValues<{ id: string }> &
	WritableBoxedValues<{ ref: HTMLElement | null }>;

export type RefAttachment<T extends HTMLElement = HTMLElement> = ReturnType<typeof attachRef<T>>;

type Primitive<T> = Omit<T, 'style' | 'id' | 'children'> & { id?: string };

export type PrimitiveElementAttributes = Primitive<HTMLAttributes<HTMLElement>>;

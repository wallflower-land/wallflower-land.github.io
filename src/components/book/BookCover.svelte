<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { Book } from "../../api/bookapi";
	import ClickableImage from "../util/ClickableImage.svelte";

	let { 
		book, 
		clickable = true, 
		...rest 
	}: {
		book: Book,
		clickable?: boolean,
	} & (HTMLAttributes<HTMLDivElement>) = $props();

	let image: HTMLImageElement | undefined = $state(undefined);

	function onload() {
		if (!image) return;

		if (image.naturalWidth < 10) {
			image.src = book.backupCover;
		}
	}

	let visible = $state(true);

	function onerror() {
		visible = false;
	}

	let size = $state(0);

	function setFontSize(element: HTMLElement) {
		size = element.getBoundingClientRect().width;
	}
</script>

{#if visible}
	<ClickableImage {clickable} class="cover" bind:element={image} {...rest} src={book.cover} {onload} {onerror} />
{:else}
	<div
		{@attach setFontSize} 
		style:font-size="{size / 10}px"
		style:border-radius="{size / 16}px"
		style:padding="{size / 8}px"
		class="no cover"
		{...rest}
	>
		{#if size >= 80}
			{book.title}
		{/if}
	</div>
{/if}

<style>
	:global(.cover) {
		aspect-ratio: 1 / 1.5;
		background-color: var(--surface-0);
		color: var(--subtext-1);
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}
</style>

<script lang="ts">
	import type { Book } from "../api/bookapi";
	import ClickableImage from "./ClickableImage.svelte";

	let { 
		book, 
		clickable = true, 
		...rest 
	}: {
		book: Book,
		clickable?: boolean,
		[key: string]: unknown
	} = $props();

	let image: HTMLImageElement | null = $state(null);

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
</script>

{#if visible}
	<ClickableImage {clickable} class="cover" bind:element={image} {...rest} src={book.cover} {onload} {onerror} />
{:else}
	<div class="no cover" {...rest}>{book.title}</div>
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

	.no {
		border-radius: 0.5rem;
	}
</style>

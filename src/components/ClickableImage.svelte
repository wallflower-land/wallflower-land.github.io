<script lang="ts">
	import type { Snippet } from "svelte";

	let { src, children, clickable, element = $bindable(), ...rest }: { src: string, children?: Snippet, [key: string]: unknown } = $props();

	let expanded = $state(false);

	function click() {
		if (!clickable) return;
		expanded = true;
	}
</script>

{#if children}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div {...rest} class="wrapper" onclick={click} style:cursor="pointer">
		{@render children()}
	</div>
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<img bind:this={element} {src} {...rest} onclick={click} style:cursor="pointer" />
{/if}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
	style:pointer-events={expanded ? undefined : "none"} 
	style:background-color={expanded ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0)"}
	class="preview-wrapper" 
	onclick={() => expanded = false}
>
	<!-- svelte-ignore a11y_missing_attribute -->
	<img class="preview" {src} style:scale={expanded ? "100%" : "0%"} />
</div>

<style>
	.wrapper {
		display: contents;
	}

	.preview-wrapper {
		position: fixed;
		top: 0px;
		left: 0px;
		height: 100dvh;
		width: 100dvw;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		z-index: 9999999;
	}

	.preview {
		width: 100%;
		border-radius: 0.75rem;
		max-width: 50rem;
		transition: scale 0.25s, background-color 1s;
		box-shadow: 0px 0px 1rem black;
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";

	let menu: HTMLElement;

	export function open(event: MouseEvent) {
		menu.style.left = `${event.clientX - menu.clientWidth}px`;
		menu.style.top = `${event.clientY}px`;
		visible = true;
		menu.focus();
	}

	let visible = $state(false);

	export function close() {
		visible = false;
	}

	export function toggle(event: MouseEvent) {
		if (visible) close();
		else open(event);
	}

	let { children } = $props();

	onMount(() => {
		menu.addEventListener("focusout", event => {
			if (!menu.contains(event.relatedTarget as Node)) {
				close();
			}
		});
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<section tabindex="0" bind:this={menu} class="contextmenu" style:scale={visible ? 1 : 0}>
	{@render children()}
</section>

<style>
	.contextmenu {
		display: flex;
		flex-direction: column;
		position: fixed;
		overflow: hidden;
		border-radius: 0.5rem;
		border: 1px solid var(--surface-0);
		box-shadow: 0px 0px 0.5rem black;
		width: 10rem;
		background-color: var(--crust);
		z-index: 9999;
		transition: scale 0.1s;
		transform-origin: top right;

		:global(> *) {
			padding: 0.5rem 1rem 0.5rem 1rem;
			width: 100%;
			display: flex;
			align-items: center;
			color: #cdd6f4;
			font-size: 0.85rem;

			&:hover {
				background: rgba(150, 150, 255, 8%);
			}

			&:not(:last-child) {
				border-bottom-style: solid;
				border-bottom-width: 1px;
				border-bottom-color: inherit;
			}
		}
	}
</style>

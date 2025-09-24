<script lang="ts">
	import { haptic } from "ios-haptics";
	import Notification from "./Notification.svelte";

	let {
		message,
		undo = undefined,
		undoMessage = "Undone",
	}: {
		message: string;
		undo?: () => void;
		undoMessage?: string;
	} = $props();

	let timeout: NodeJS.Timeout | null = null;
	let undoneNotification: Notification | null = $state(null);

	export function show() {
		haptic();
		isHidden = false;
		timeout = setTimeout(() => {
			isHidden = true;
			timeout = null;
		}, 3000);
	}

	export function hide() {
		isHidden = true;
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	}

	let isHidden = $state(true);

	function doUndo() {
		undo?.();
		hide();
		undoneNotification?.show();
	}
</script>

<section
	style:bottom={isHidden ? "-4rem" : "4rem"}
	class="notification"
	style:justify-content={undo ? "space-between" : "center"}
>
	{message}
	{#if undo}
		<button onclick={doUndo}>Undo</button>
	{/if}
</section>

{#if undo}
	<Notification message={undoMessage} bind:this={undoneNotification} />
{/if}

<style>
	.notification {
		display: flex;
		align-items: center;
		position: fixed;
		width: 80vw;
		max-width: 20rem;
		height: fit-content;
		padding: 1rem;
		font-size: 0.85rem;
		border-radius: 0.75rem;
		box-shadow: 0px 0px 0.5rem black;
		left: 50%;
		transform: translateX(-50%);
		transition: bottom 0.2s;
		z-index: 9999;
		color: var(--subtext-1);
		background: var(--crust);
		border: 1px solid var(--surface-0);

		button {
			background: linear-gradient(to bottom right, var(--lavender), var(--blue));
			padding: 0.25rem 2rem 0.25rem 2rem;
			border-radius: 100vmax;
			color: var(--crust);
			box-shadow: 0px 0px 0.5rem var(--box-shadow);
			transition: scale 0.15s;

			&:hover {
				scale: 105%;
			}
		}
	}
</style>

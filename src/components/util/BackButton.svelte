<script>
	import { goto } from "$app/navigation";
	import LeftCaretIcon from "../icons/LeftCaretIcon.svelte";

	let { href = undefined, ...props } = $props();
</script>

<button {...props} onclick={() => href ? goto(href) : window.history.back()}>
	<LeftCaretIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--crust)" />
</button>

<style>
	button {
		background: linear-gradient(to bottom right, var(--lavender), var(--blue));
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		padding: 0.25rem;
		box-shadow: 0px 0px 0.5rem var(--box-shadow);
		z-index: 9999;
		width: fit-content;
		height: fit-content;
		transition: scale 0.2s;

		&:hover {
			scale: 110%;
		}

		&, :global(*) {
			cursor: pointer;
		}
	}
</style>

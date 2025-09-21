<script lang="ts">
	import { haptic } from "ios-haptics";

	let { message } = $props();

	export function show() {
		haptic();
		isHidden = false;
		setTimeout(() => {
			isHidden = true;
		}, 3000);
	}

	let isHidden = $state(true);
</script>

<section style:bottom={isHidden ? "-4rem" : "5rem"} class="notification">
	{message}
</section>

<style>
	.notification {
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		width: 80vw;
		max-width: 20rem;
		height: fit-content;
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-radius: 0.75rem;
		box-shadow: 0px 0px 10px black;
		left: 50%;
		transform: translateX(-50%);
		transition: bottom 0.2s;
		z-index: 9999;
		color: var(--crust);
		background: linear-gradient(to bottom right, var(--lavender), var(--blue));
	}
</style>

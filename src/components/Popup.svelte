<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		children,
		element = $bindable(),
		visible = $bindable(),
		onclose = () => {},
		...rest
	}: {
		children: Snippet;
		element?: HTMLElement;
		visible?: boolean;
		onclose?: () => void;
	} & HTMLAttributes<HTMLDivElement> = $props();

	function onclick(event: MouseEvent) {
		if (event.target === element) {
			visible = false;
			onclose();
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	{...rest}
	class="popup"
	bind:this={element}
	{onclick}
	style:background={visible ? "rgba(0, 0, 0, 60%)" : "rgba(0, 0, 0, 0%)"}
	style:pointer-events={visible ? undefined : "none"}
>
	<div style:scale={visible ? "100%" : "0%"}>
		{@render children()}
	</div>
</div>

<style>
	.popup {
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100dvw;
		height: 100dvh;
		z-index: 9999999;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.1s;

		> div {
			background: var(--base);
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 2rem;
			padding-top: 1.5rem;
			border-radius: 0.5rem;
			box-shadow: 0px 0px 0.5rem black;
			gap: 1rem;
			transition: scale 0.1s;
			width: 18rem;
		}
	}
</style>

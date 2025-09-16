<script lang="ts">
	let { 
		value = $bindable(), 
		size = 1, 
		onenable = () => {},
		ondisable = () => {},
		onchange = (_value: boolean) => {},
		...rest 
	}: {
		value: boolean,
		size?: number,
		onenable?: () => void,
		ondisable?: () => void,
		onchange?: (value: boolean) => void,
		[key: string]: unknown
	} = $props();

	function toggle() {
		value = !value;
		if (value) onenable();
		else ondisable();
		onchange(value);
	}
</script>

<button
	{...rest}
	aria-label="radio"
	onclick={toggle}
	style:background={value ? "linear-gradient(to bottom right, var(--lavender), var(--blue))" : "var(--overlay-1)"}
	style="width: {4 * size}rem; height: {2 * size}rem; padding: {0.2 * size}rem;"
>
	<div style:margin-left={value ? `${size * 2}rem` : "0px"}></div>
</button>

<style>
	button {
		border-radius: 100vmax;
		display: flex;

		div {
			height: 100%;
			aspect-ratio: 1;
			border-radius: 50%;
			transition: margin-left 0.2s;
			background: var(--mantle);
		}
	}
</style>

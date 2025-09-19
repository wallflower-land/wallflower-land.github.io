<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import RightArrowIcon from "../icons/RightArrowIcon.svelte";

	let {
		options, 
		value = $bindable(), 
		...rest 
	}: { 
		options: string[], 
		value?: string, 
	} & HTMLAttributes<HTMLDivElement> = $props();

	let expanded = $state(false);

	let optionsElement: HTMLElement;

	function onclick(event: MouseEvent) {
		if (!event.composedPath().includes(optionsElement)) {
			expanded = false;
		}
	}
</script>

<svelte:document {onclick} />

<div {...rest} class="select" bind:this={optionsElement}>
	<button class="value" onclick={() => expanded = !expanded}>
		{value}
		<RightArrowIcon stroke="var(--subtext-1)" style="width: 1rem; height: 1rem; rotate: {expanded ? "90deg" : "0deg"}; transition: rotate 0.2s;" />
	</button>
	<div class={{ options: true, expanded }}>
		{#each options as option}
			<button class="option" onclick={() => { value = option; expanded = false; }}>
				{option}
			</button>
		{/each}
	</div>
</div>

<style>
	.select {
		position: relative;
		background-color: var(--crust);
		color: var(--subtext-1);
		border-radius: 0.5rem;
		border: 1px solid var(--surface-0);
	}

	.value {
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		:global(>*:last-child) {
			margin-left: auto;
			margin-right: -0.5rem;
		}
	}

	.options {
		flex-direction: column;
		overflow-x: hidden;
		overflow-y: auto;
		position: absolute;
		top: 100%;
		left: 0px;
		z-index: 999;
		width: 100%;
		border-radius: 0.5rem;
		background-color: var(--crust);
		color: var(--subtext-1);
		transition: max-height 0.2s;

		&:not(.expanded) {
			max-height: 0rem;
		}

		&.expanded {
			max-height: 10rem;
			box-shadow: 0px 0px 0.5rem black;
			border: 1px solid var(--surface-0);
		}
	}

	.option {
		&:hover {
			background: rgba(150, 150, 255, 10%);
		}
	}

	button {
		text-transform: capitalize;
		width: 100%;
		text-align: left;
		padding: 0.5rem 1rem 0.5rem 1rem;

		&:not(:hover) {
			background-color: var(--base-color);
		}

		&:hover {
			background-color: var(--gray);
		}
	}
</style>

<script lang="ts">
	import BackButton from "./BackButton.svelte";

	let { 
		title, 
		nonfixed = false, 
		subtitle = undefined 
	}: {
		title: string,
		nonfixed?: boolean,
		subtitle?: string | Promise<string>
	} = $props();
</script>

<span class="heading" style:position={nonfixed ? "relative" : "fixed"}>
	<BackButton style="position: absolute; left: 1rem;" />
	<h1>{title}</h1>
	{#if subtitle}
		{#await subtitle}
			<h2>Loading...</h2>
		{:then subtitle}
			<h2>{subtitle}</h2>
		{/await}
	{/if}
</span>

<style>
	.heading {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
		top: 0px;
		background-color: var(--crust);
		width: inherit;
		padding-top: 1rem;
		padding-bottom: 1rem;
		left: 0px;
		padding-left: 4rem;
		padding-right: 4rem;
		text-align: center;
		z-index: 9;

		h1 {
			color: var(--text);
			font-weight: normal;
			font-size: 1rem;
			text-transform: capitalize;
		}

		h2 {
			color: var(--overlay-1);
			font-weight: normal;
			font-size: 0.85rem;
		}
	}
</style>

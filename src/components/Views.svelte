<script lang="ts" generics="View extends string">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import SideSwiper from "./SideSwiper.svelte";

	let { 
		views, 
		view = $bindable(), 
		left = $bindable(),
		formatViewName = (name) => name,
		marginTop = "0px"
	}: { 
		views: View[], 
		view: View,
		left: string,
		formatViewName?: (name: View) => string | Promise<string>
		marginTop?: string
	} = $props();

	let element: HTMLElement;

	let viewbarLeft = $derived(`${views.indexOf(view) * (100 / views.length) + (50 / views.length)}%`);

	let width = 0;

	function setView(newView: View) {
		view = newView;
		const params = new URLSearchParams(window.location.search);
		params.set("view", view);
		goto(`${window.location.origin}${window.location.pathname}?${params}`);
		left = `${views.indexOf(view) * -width}px`;
	}

	function gotoNext() {
		const viewIndex = views.indexOf(view);
		if (viewIndex < views.length - 1) setView(views[viewIndex + 1]);
	}

	function gotoPrevious() {
		const viewIndex = views.indexOf(view);
		if (viewIndex > 0) setView(views[viewIndex - 1]);
	}

	onMount(() => {
		width = element.getBoundingClientRect().width;
	});
</script>

<SideSwiper {gotoNext} {gotoPrevious} bind:left />

<div 
	class="views" 
	bind:this={element} 
	style:grid-template-columns="repeat({views.length}, 1fr)"
	style:margin-top={marginTop}
>
	{#each views as viewtab}
		<button 
			class={view === viewtab ? "selected" : ""} 
			onclick={() => setView(viewtab)}
			style:font-size={views.length > 2 ? "0.85rem" : "1rem"}
		>
			{#await formatViewName(viewtab) then viewtab}
				{viewtab}
			{/await}
		</button>
	{/each}

	<div class="viewline" style:width="{50 / views.length}%" style:left={viewbarLeft}></div>
</div>

<style>
	.views {
		display: grid;
		position: relative;
		background-color: var(--crust);

		> button {
			padding-bottom: 0.75rem;
			border-color: var(--lavender);
			color: var(--overlay-1);
			padding-left: 1rem;
			padding-right: 1rem;
			text-transform: capitalize;

			&.selected {
				color: var(--text);
			}
		}
	}

	.viewline {
		position: absolute;
		background-color: var(--lavender);
		bottom: 0px;
		height: 3px;
		border-radius: 100vmax;
		transition: left 0.2s;
		transform: translateX(-50%);
	}
</style>

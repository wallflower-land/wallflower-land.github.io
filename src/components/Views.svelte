<script lang="ts" generics="View extends string">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import SideSwiper from "./SideSwiper.svelte";

	let { 
		views, 
		view = $bindable(), 
		left = $bindable(),
		content = undefined,
		viewFilter = (_name) => true,
		formatViewName = (name) => name,
		marginTop = "0px",
		onViewChange = (_name) => {},
		paddingTop = "0px"
	}: { 
		views: View[], 
		view: View,
		left: string,
		content?: HTMLElement,
		paddingTop?: string,
		formatViewName?: (name: View) => string | Promise<string>
		viewFilter?: (name: View) => (boolean | Promise<boolean>)
		onViewChange?: (name: View) => void,
		marginTop?: string
	} = $props();

	let availableViews = $derived(views.filter(viewFilter));
	let viewbarLeft = $derived(`${availableViews.indexOf(view) * (100 / availableViews.length) + (50 / availableViews.length)}%`);

	let width = 0;

	function setView(newView: View) {
		view = newView;
		const params = new URLSearchParams(window.location.search);
		params.set("view", view);
		goto(`${window.location.origin}${window.location.pathname}?${params}`);
		left = `${availableViews.indexOf(view) * -width}px`;
		onViewChange(view);
	}

	function gotoNext() {
		const viewIndex = availableViews.indexOf(view);
		if (viewIndex < availableViews.length - 1) setView(availableViews[viewIndex + 1]);
	}

	function gotoPrevious() {
		const viewIndex = availableViews.indexOf(view);
		if (viewIndex > 0) setView(availableViews[viewIndex - 1]);
	}

	onMount(() => {
		width = window.innerWidth;
		left = `${availableViews.indexOf(view) * -width}px`;
	});
</script>

<SideSwiper {content} {gotoNext} {gotoPrevious} bind:left />

<div 
	class="views" 
	style:grid-template-columns="repeat({availableViews.length}, 1fr)"
	style:margin-top={marginTop}
>
	{#each availableViews as viewtab}
		<button 
			class={view === viewtab ? "selected" : ""} 
			onclick={() => setView(viewtab)}
			style:font-size={availableViews.length > 2 ? "0.85rem" : "1rem"}
			style:padding-top={paddingTop}
		>
			{#await formatViewName(viewtab) then viewtab}
				{viewtab}
			{/await}
		</button>
	{/each}

	<div class="viewline" style:width="max({50 / availableViews.length}%, 5rem)" style:left={viewbarLeft}></div>
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

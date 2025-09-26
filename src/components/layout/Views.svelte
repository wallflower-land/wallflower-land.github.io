<script lang="ts" generics="View extends string">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import SideSwiper from "./SideSwiper.svelte";

	let {
		views,
		view = $bindable(),
		left = $bindable(),
		content = undefined,
		viewFilter = _name => true,
		formatViewName = name => name,
		onViewChange = _name => {},
		paddingTop = "0px",
	}: {
		/** The names of the possible page views. */
		views: View[];
		/** The currently selected view (bindable). */
		view: View;
		/** The . */
		left: string;
		/** The container element for the views. */
		content?: HTMLElement;
		/** The padding, as a CSS length value, over top of the viewbar. */
		paddingTop?: string;
		/**
		 * A function to format how the view names are displayed. View
		 * names are already displayed in title case by default.
		 */
		formatViewName?: (name: View) => string | Promise<string>;
		/**
		 * A filter for which views to show. Sometimes, we don't want to show
		 * every single view, and we want to be able to filter some out. For
		 * example, we dont want the home page to have a "following" tab if the
		 * user isn't logged in, because they can't be following anyone.
		 */
		viewFilter?: (name: View) => boolean | Promise<boolean>;
		/**
		 * A hook to run when the view changes. This does not run on mount.
		 *
		 * @param view The name of the new view.
		 */
		onViewChange?: (name: View) => void;
	} = $props();

	/**
	 * The available views. Sometimes, we don't want to show every single view,
	 * and we want to be able to filter some out. For example, we dont want
	 * the home page to have a "following" tab if the user isn't logged in,
	 * because they can't be following anyone. That's what the `viewFilter`
	 * property is for, and it's used here to create `availableViews`.
	 */
	let availableViews = $derived(views.filter(viewFilter));

	/**
	 * The left CSS value of the viewbar DOM element. This is the little
	 * colored bar that slides left and right under the name of the currently
	 * selected view.
	 */
	let viewbarLeft = $derived(
		`${availableViews.indexOf(view) * (100 / availableViews.length) + 50 / availableViews.length}%`,
	);

	/** The width of one view page. */
	let viewWidth = $state(window.innerWidth);

	/**
	 * Sets the current view to the given value. This does a few things:
	 *
	 * - Moves the page to display the current view section
	 * - Adds the new view to the URL's search parameters
	 * - Runs any hooks scheduled to run on view change
	 *
	 * @param newView The new view to set the page to
	 */
	export function setView(newView: View): void {
		view = newView;
		const params = new URLSearchParams(window.location.search);
		params.set("view", view);
		goto(`${window.location.origin}${window.location.pathname}?${params}`, { replaceState: true });
		left = `${availableViews.indexOf(view) * -viewWidth}px`;
		onViewChange(view);
	}

	/**
	 * Goes to the next view after the current view. If the current
	 * view is the last one, does nothing.
	 */
	function gotoNext(): void {
		const viewIndex = availableViews.indexOf(view);
		if (viewIndex < availableViews.length - 1) setView(availableViews[viewIndex + 1]);
	}

	/**
	 * Goes to the previous view before the current view. If the current
	 * view is the first one, does nothing.
	 */
	function gotoPrevious(): void {
		const viewIndex = availableViews.indexOf(view);
		if (viewIndex > 0) setView(availableViews[viewIndex - 1]);
	}

	onMount(() => {
		left = `${availableViews.indexOf(view) * -viewWidth}px`;
	});
</script>

<!-- Bind window.innerwidth -->
<svelte:window bind:innerWidth={viewWidth} />

<!-- Side Swiping -->
<SideSwiper {content} {gotoNext} {gotoPrevious} bind:left viewCount={availableViews.length} />

<!-- Viewbar content -->
<div class="views" style:grid-template-columns="repeat({availableViews.length}, 1fr)">
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

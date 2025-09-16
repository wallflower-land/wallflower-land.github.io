<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import Sidebar from "../Sidebar.svelte";
	import Footer from "../elements/Footer.svelte";
	import { setTheme } from "../../api/themes.svelte";
	import { getPreference } from "../../api/userapi";
	import Header from "../elements/Header.svelte";

	let { 
		sidebar = $bindable(), 
		type = undefined, 
		children, 
		header,
		...rest 
	}: {
		children: Snippet,
		sidebar?: Sidebar,
		type?: "home" | "search" | "new" | "inbox" | "profile",
		header?: string,
		[key: string]: unknown,
	} = $props();

	onMount(() => {
		setTheme(getPreference("darkMode") ? "Catppuccin Mocha" : "Catppuccin Latte");
	});
</script>

<div class="outer">
	{#if header}
		<Header title={header} />
	{/if}
	<Sidebar bind:this={sidebar} />
	<main {...rest}>
		{@render children?.()}
	</main>
	<Footer selected={type} />
</div>

<style>
	.outer {
		position: relative;
		width: 100%;
		height: calc(100% - 3rem);
		overflow: hidden;

		.inner {
			width: 40%;
		}
	}

	@media (min-width: 700px) {
		main {
			margin-left: 20rem;
			width: max(calc(100% - 40rem), 25rem);
			border-right: 1px solid var(--surface-0);
		}
	}

	@media (max-width: 700px) {
		main {
			width: 100%;
		}
	}

	main {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		position: relative;
		background-color: var(--base);
		flex-grow: 0;
		flex-shrink: 0;
	}
</style>

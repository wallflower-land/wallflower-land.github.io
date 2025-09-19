<script module>
	export const wallflowerHeader = Symbol();
</script>

<script lang="ts" generics="View extends string">
	import type { Snippet } from 'svelte';
	import Views from './Views.svelte';
	import Header from "../elements/Header.svelte";
	import Page from './Page.svelte';
	import { user } from '../../api/userapi.svelte';
	import { getFile } from '../../api/storageapi';
	import WallflowerIcon from '../icons/WallflowerIcon.svelte';
	import BellIcon from '../icons/BellIcon.svelte';
	import PersonIcon from '../icons/PersonIcon.svelte';
	import Sidebar from "../Sidebar.svelte";

	let {
		views,
		view = $bindable(),
		children,
		contentElement = $bindable(),
		marginTop = "0px",
		top = "0px",
		header = undefined,
		subheader = undefined,
		afterHeader = undefined,
		fullpage = false,
		pagetype = undefined,
		viewFilter = (_name) => true,
		formatViewName = (name) => name,
		onViewChange = (_name) => {},
	}: {
		views: View[],
		view: View,
		children: Snippet,
		viewFilter?: (name: string) => (boolean | Promise<boolean>)
		header?: string | typeof wallflowerHeader,
		afterHeader?: Snippet,
		fullpage?: boolean,
		contentElement?: HTMLElement,
		top?: string,
		pagetype?: "home" | "search" | "new" | "inbox" | "profile",
		subheader?: string | Promise<string>,
		formatViewName?: (name: View) => (string | Promise<string>)
		onViewChange?: (name: View) => void,
		marginTop?: string
	} = $props();

	let left = $state("0px");

	let sidebar: Sidebar | undefined = $state(undefined);
	let spinLogo = $state(false);

	function spin() {
		if (!spinLogo) {
			spinLogo = true;
			setTimeout(() => spinLogo = false, 2000);
		}
	}
</script>

{#snippet nav()}
	<div class="header" style:top>
		{#if header}
			{#if header === wallflowerHeader}
				<div class="banner">
					<button onclick={() => sidebar?.show()} aria-label="Open sidebar">
						{#if user()}
							{#await getFile(user()!.picture) then pfp}
								<img alt="Your profile" src={pfp} class="profile-link" />
							{/await}
						{:else}
							<PersonIcon stroke="var(--overlay-1)" style="width: 2.5rem;" />
						{/if}
					</button>

					<button onclick={spin}>
						<WallflowerIcon class={spinLogo ? "spin" : ""} style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
					</button>

					<a href="/inbox">
						<BellIcon style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
					</a>
				</div>
			{:else}
				<Header title={header} subtitle={subheader} nonfixed />
			{/if}
		{/if}
		{@render afterHeader?.()}
		<Views 
			{onViewChange}
			content={contentElement}
			{viewFilter} 
			{formatViewName} 
			{marginTop} 
			{views} 
			bind:view 
			bind:left 
			paddingTop={fullpage ? "0px" : "0.5rem"}
		/>
	</div>
	<div
		bind:this={contentElement}
		class="content" 
		style:left
		style:grid-template-columns="repeat({views.length}, 1fr)"
		style:width="{views.length * 100}%"
	>
		{@render children()}
	</div>
{/snippet}

{#if fullpage}
	<Page type={pagetype} bind:sidebar>
		{@render nav()}
	</Page>
{:else}
	{@render nav()}
{/if}


<style>
	.header {
		position: sticky;
		width: 100%;
		display: flex;
		flex-direction: column;
		z-index: 599;
	}

	@keyframes spin {
		from {
			rotate: 0deg;
		}

		to {
			rotate: 360deg;
		}
	}

	.banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background-color: var(--crust);

		button {
			background-size: cover;
			background-position: center;
			overflow: hidden;

			img {
				border-radius: 50%;
				width: 3rem;
				height: 3rem;
			}
		}

		:global(.spin) {
			animation-name: spin;
			animation-duration: 2s;
		}
	}

	.content {
		display: grid;
		position: relative;
		transition: left 0.2s;

		:global(> *) {
			min-width: 0px;
			min-height: 100dvh;

			&:not(:last-child) {
				border-right: 1px solid var(--surface-0);
			}
		}
	}
</style>

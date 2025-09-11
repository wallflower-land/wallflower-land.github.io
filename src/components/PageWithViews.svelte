<script lang="ts" generics="View extends string">
	import type { Snippet } from 'svelte';
	import Views from './Views.svelte';

	let {
		views,
		view = $bindable(),
		children,
		marginTop = "0px",
		formatViewName = (name) => name
	}: {
		views: View[],
		view: View,
		children: Snippet,
		formatViewName?: (name: View) => string | Promise<string>
		marginTop?: string
	} = $props();

	let left = $state("0px");
</script>

<Views {formatViewName} {marginTop} {views} bind:view bind:left />
<div
	class="content" 
	style:left
	style:grid-template-columns="repeat({views.length}, 1fr)"
	style:width="{views.length * 100}%"
>
	{@render children()}
</div>

<style>
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

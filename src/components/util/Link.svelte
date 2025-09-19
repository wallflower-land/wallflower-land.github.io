<script lang="ts">
	import type { Snippet } from "svelte";
	import ExternalLinkIcon from "../icons/ExternalLinkIcon.svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		href,
		children,
		...rest
	}: {
		href: string,
		children: Snippet,
	} & HTMLAnchorAttributes = $props();

	let isExternal = $derived(!/^[\.\/]/.test(href));
</script>

<a
	{...rest} 
	{href} 
	target={isExternal ? "_blank" : undefined} 
	rel={isExternal ? "noopener noreferrer" : undefined} 
	class={isExternal ? "external" : "local"}
>
	{@render children()}

	{#if isExternal}
		<ExternalLinkIcon stroke="var(--blue)" style="width: 0.9em; height: 0.9em; position: relative; top: 1px;" />
	{/if}
</a>

<style>
	a {
		color: var(--blue);
		text-decoration: none;
		font-size: 0.85rem;

		&.external {
			display: inline-flex;
			position: relative;
			gap: 0.25em;
			align-items: center;

			&:hover::after {
				content: '';
				position: absolute;
				top: 100%;
				left: 0px;
				height: 1px;
				width: 100%;
				background-color: var(--blue);
			}
		}

		&.local {
			display: inline;

			&:hover {
				text-decoration: underline;
			}
		}

		&:visited {
			color: var(--blue);
		}
	}
</style>

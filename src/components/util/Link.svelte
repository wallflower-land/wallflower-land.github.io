<script lang="ts">
	import type { Snippet } from "svelte";
	import ExternalLinkIcon from "../icons/ExternalLinkIcon.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import ConfirmationPopup from "../ConfirmationPopup.svelte";

	let {
		href,
		children,
		confirm = true,
		...rest
	}: {
		href: string;
		confirm?: boolean;
		children: Snippet;
	} & HTMLAttributes<any> = $props();

	let isExternal = $derived(!/^[\.\/]/.test(href));
	let popup: ConfirmationPopup | null = $state(null);
</script>

{#if isExternal}
	<ConfirmationPopup
		bind:this={popup}
		title="Hold Up!"
		body="This link redirects to <span style='color: var(--subtext-1)'>{href}</span>, outside of wallflower.land. It may be dangerous. Continue to external website?"
		onconfirm={() => window.open(href, "_blank")?.focus()}
	/>
	<button {...rest} onclick={() => popup?.open()} class={"external"}>
		{@render children()}
		<ExternalLinkIcon stroke="var(--blue)" style="width: 0.9em; height: 0.9em; position: relative; top: 1px;" />
	</button>
{:else}
	<a {...rest} {href}>
		{@render children()}
	</a>
{/if}

<style>
	a,
	button {
		color: var(--blue);
		text-decoration: none;
		font-size: 0.85rem;

		&.external {
			display: inline-flex;
			position: relative;
			gap: 0.25em;
			align-items: center;

			&:hover::after {
				content: "";
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

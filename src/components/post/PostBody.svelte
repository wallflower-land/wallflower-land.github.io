<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { format } from "../../api/postapi";
	import Link from "../util/Link.svelte";

	let { 
		body,
		...rest 
	}: { body: string } & HTMLAttributes<HTMLDivElement> = $props();

	let formatted = $derived(format(body));
	type Segment = { type: "link", href: string, text: string } | { type: "plain", text: string };
	let segments: Promise<Segment[]> = $derived(formatted.then(formatted => formatted.split(/(<a(?:.+)? href="(?:.+)"(?:.+?)?>(?:.+?)<\/a>)/).map(segment => {
		const match = segment.match(/^<a(?:.+)? href="(.+)"(?:.+?)?>(.+?)<\/a>$/);
		if (match) {
			return {
				type: "link",
				href: match[1],
				text: match[2],
			}
		}

		return {
			type: "plain",
			text: segment
		}
	})));
</script>

<div class="body" {...rest} >
	{#await segments then segments}
		{#each segments as segment}
			{#if segment.type === "link"}
				<Link href={segment.href}>{segment.text}</Link>
			{:else}
				{@html segment.text}
			{/if}
		{/each}
	{/await}
</div>

<style>
	.body {
		color: var(--subtext-1);
		font-size: 0.85rem;

		:global(code) {
			font-family: monospace;
			background-color: var(--crust);
			padding-left: 0.5ch;
			padding-right: 0.5ch;
			border-radius: 0.25rem;
		}
	}
</style>

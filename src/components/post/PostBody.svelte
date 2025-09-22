<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import Link from "../util/Link.svelte";
	import { getBook, type ISBN } from "../../api/bookapi";

	let { body, ...rest }: { body: string } & HTMLAttributes<HTMLDivElement> = $props();

	type Segment = { type: string; groups: string[] };
	let segments: Segment[] = $derived.by(() => {
		const tokens: Segment[] = [];
		const tokenTypes = {
			bold: /^\*\*([^\*]+)\*\*/,
			italic: /^\*([^\*]+)\*/,
			strikethrough: /^~~([^~]+)~~/,
			book: /^@(\d{13})/,
			tag: /^@\w+/,
			code: /^`([^`]+)`/,
			link: /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
			text: /^[\S\s]/,
		} as const;

		let text = body;
		let textNode = "";
		while (text) {
			if (
				!Object.entries(tokenTypes).some(([type, pattern]) => {
					const groups = text.match(pattern);
					if (!groups) return false;
					if (type === "text") {
						textNode += groups[0];
					} else {
						if (textNode) {
							tokens.push({ type: "text", groups: [textNode] });
							textNode = "";
						}
						tokens.push({ type, groups });
					}
					text = text.substring(groups[0].length);
					return true;
				})
			) {
				throw `Invalid token: ${text}`;
			}
		}

		if (textNode) {
			tokens.push({ type: "text", groups: [textNode] });
		}

		return tokens;
	});
</script>

<div class="body" {...rest}>
	{#each segments as segment}
		{#if segment.type === "italic"}
			<i>{segment.groups[1]}</i>
		{:else if segment.type === "bold"}
			<b>{segment.groups[1]}</b>
		{:else if segment.type === "book"}
			{#await getBook(segment.groups[1] as ISBN) then book}
				<Link href="/book/{book.isbn}"><i>{book.title}</i></Link>
			{/await}
		{:else if segment.type === "code"}
			<code>{segment.groups[1]}</code>
		{:else if segment.type === "strikethrough"}
			<s>{segment.groups[1]}</s>
		{:else if segment.type === "tag"}
			<Link href="/{segment.groups[0]}">{segment.groups[0]}</Link>
		{:else if segment.type === "link"}
			<Link href={segment.groups[0]}>{segment.groups[0]}</Link>
		{:else if segment.type === "text"}
			{segment.groups[0]}
		{/if}
	{/each}
</div>

<style>
	.body {
		color: var(--subtext-1);
		font-size: 0.85rem;

		code {
			font-family: monospace;
			background-color: var(--crust);
			padding-left: 0.5ch;
			padding-right: 0.5ch;
			border-radius: 0.25rem;
		}
	}
</style>

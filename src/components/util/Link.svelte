<!--
	@component

	A link. This comes with several utilities:

	- A link to an external website (outside of wallflower.land) will
	have an external link icon and give a confirmation popup before 
	redirecting the user
	- A link to an email with render an email icon and give a confirmation
	popup before redirecting the user
	- A link to `/book/[isbn]` will be rendered as the title of the book,
	if no text content is given
	- A link to `/@[username]`, `/profile/[username]`, or `/user/[username]`,
	will be rendered as the tag `@[username]` if no text content is given.
	- Otherwise, if no text content is given, the `href` is used as the text
	content.
-->
<script lang="ts">
	import type { Snippet } from "svelte";
	import ExternalLinkIcon from "../icons/ExternalLinkIcon.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import ConfirmationPopup from "../ConfirmationPopup.svelte";
	import MailIcon from "../icons/MailIcon.svelte";
	import { getBook, isbn } from "../../api/bookapi";

	let {
		href,
		children = undefined,
		...attributes
	}: {
		/** The location of the link, analogous to the `href` attribute of an `<a>` element. */
		href: string;

		/**
		 * The content inside the link. If ommitted, the following rules determine the
		 * text content:
		 *
		 * - A link to `/book/[isbn]` will be rendered as the title of the book,
		 * if no text content is given
		 * - A link to `/@[username]`, `/profile/[username]`, or `/user/[username]`,
		 * will be rendered as the tag `@[username]` if no text content is given.
		 * - Otherwise, if no text content is given, the `href` is used as the text
		 * content.
		 */
		children?: Snippet;
	} & HTMLAttributes<any> = $props();

	let isExternal = $derived(
		!/^[\.\/]/.test(href) && !/^(https?:\/\/)?([^\.]+.)?wallflower\.land(\b[^\.]*)?/.test(href),
	);
	let isMail = $derived(href.startsWith("mailto:"));
	let popup: ConfirmationPopup | null = $state(null);
	let book = $derived.by(() => {
		let value = href.match(/^\/book\/(\d{13})$/)?.[1];
		if (value) return getBook(isbn(value));
		return null;
	});
	let username = $derived.by(() => {
		let username = href.match(/^\/?(?:@|profile\/|user\/)(\w+)$/)?.[1];
		return username ?? null;
	});
</script>

{#snippet contents()}
	{#if children}
		{@render children()}
	{:else if username}
		@{username}
	{:else if book}
		{#await book}
			<i>Loading...</i>
		{:then book}
			<i>{book.title}</i>
		{/await}
	{:else}
		{href.match(/^(?:mailto:)?(.+)/)![1]}
	{/if}
{/snippet}

{#if isMail}
	<ConfirmationPopup
		bind:this={popup}
		title="Hold Up!"
		body="This link redirects to the email <span style='color: var(--subtext-1)'>{href.match(
			/^mailto:(.+)$/,
		)![1]}</span>, outside of wallflower.land. Open email link?"
		onconfirm={() => window.open(href, "_blank")?.focus()}
	/>
	<button {...attributes} onclick={() => popup?.open()} class={"external"}>
		{@render contents()}
		<MailIcon stroke="var(--blue)" style="width: 0.9em; height: 0.9em; position: relative; top: 1px;" />
	</button>
{:else if isExternal}
	<ConfirmationPopup
		bind:this={popup}
		title="Hold Up!"
		body="This link redirects to <span style='color: var(--subtext-1)'>{href}</span>, outside of wallflower.land. It may be dangerous. Continue to external website?"
		onconfirm={() => window.open(href, "_blank")?.focus()}
	/>
	<button {...attributes} onclick={() => popup?.open()} class={"external"}>
		{@render contents()}
		<ExternalLinkIcon
			stroke="var(--blue)"
			style="width: 0.9em; height: 0.9em; position: relative; top: 1px;"
		/>
	</button>
{:else}
	<a {...attributes} {href}>
		{@render contents()}
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

		&:not(.external):hover {
			text-decoration: underline;
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

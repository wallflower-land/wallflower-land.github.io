<script lang="ts">
	import { getAuthor } from "../../api/authorapi";
	import { getBook, type ISBN } from "../../api/bookapi";
	import type { UpdateType } from "../../api/postapi";
	import type { User } from "../../api/userapi.svelte";
	import BookCover from "../book/BookCover.svelte";
	import PostBody from "./PostBody.svelte";

	let {
		isbn,
		body,
		user,
		updateType,
	}: {
		isbn: ISBN;
		body: string;
		user: User;
		updateType: UpdateType;
	} = $props();

	let book = getBook(isbn);
</script>

<section>
	{#await book then book}
		<!-- Update information -->
		<p class="rating-line">
			{#if updateType === "add to reading list"}
				{user.displayName} added
				<i>{book?.title}</i>
				 to their reading list:
			{:else if updateType === "remove from reading list"}
				{user.displayName} removed
				<i>{book?.title}</i>
				 from their reading list:
			{:else}
				{user.displayName}
				{#if updateType === "start"}
					started reading
				{:else if updateType === "finish"}
					finished reading
				{:else if updateType === "abandon"}
					abandoned
				{/if}
				<i>{book?.title}</i>
				:
			{/if}
		</p>

		<!-- Book info -->
		<div class="info">
			<div class="content">
				<!-- Book title & authors -->
				<a href="/book/{book?.isbn}" class="title">{book?.title}</a>
				<a href="/book/{book?.isbn}" class="author">
					{#await getAuthor(book.authorKey) then author}
						{author.name}
					{/await}
				</a>
			</div>

			<!-- Book cover image -->
			<a href={`/book/${book?.isbn}`} aria-label={`Go to details for book "${book?.title}"`}>
				<BookCover clickable={false} {book} style="width: 6rem; margin-left: 1rem;" />
			</a>
		</div>
	{/await}

	<PostBody {body} />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
	}

	.info {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.content {
		padding-right: 1rem;
		display: flex;
		flex-direction: column;
		width: 70%;

		.title,
		.author {
			font-weight: normal;
			text-decoration: none;
			text-align: center;
		}

		.title {
			font-size: 1.2rem;
			color: var(--text);
		}

		.author {
			font-size: 0.9rem;
			color: var(--surface-2);
		}
	}

	.rating-line {
		padding-bottom: 1rem;
		font-size: 0.85rem;
		color: var(--overlay-1);

		i {
			color: var(--text);
		}
	}
</style>

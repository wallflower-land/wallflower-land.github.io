<script lang="ts">
	import { getAuthor } from "../../api/authorapi";
	import { getBook } from "../../api/bookapi";
	import PostBody from "./PostBody.svelte";

	let { isbn, body, user, updateType } = $props();

	let book = getBook(isbn);
</script>

<section>
	{#await book then book}
		<!-- Update information -->
		<p class="rating-line">
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
			<a aria-label={`Go to details for book "${book?.title}"`} href={`/book/${book?.isbn}`}>
				<img alt={`Cover for book "${book?.title}"`} src={book?.cover} />
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

	img {
		width: 6rem;
		height: 9rem;
	}
</style>

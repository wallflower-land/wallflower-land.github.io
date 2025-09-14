<script lang="ts">
	import { getAuthor } from "../../api/authorapi";
	import BookCover from "../BookCover.svelte";
	import ImageCarousel from "../ImageCarousel.svelte";
	import PostBody from "./PostBody.svelte";
	import { getBook, type ISBN } from "../../api/bookapi";

	let { 
		body, 
		images, 
		isbns 
	}: {
		body: string,
		images: string[],
		isbns: ISBN[],
	} = $props();

	let books = $derived(isbns.map(isbn => getBook(isbn)));
</script>

<section>
	<PostBody {body} />

	{#each books as book}
		{#await book then book}

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
	{/each}

	<ImageCarousel {images} />
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
			font-size: 1rem;
			color: var(--surface-2);
		}
	}
</style>

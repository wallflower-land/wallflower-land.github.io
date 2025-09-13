<script lang="ts">
	import { type Author } from "../../../api/authorapi";
	import { getBook } from "../../../api/bookapi";
	import BookCover from "../../../components/BookCover.svelte";
	import ClickableImage from "../../../components/ClickableImage.svelte";
	import Header from "../../../components/Header.svelte";
	import Page from "../../../components/Page.svelte";

	let { data }: { data: { author: Author } } = $props();

	let author = $derived(data.author);

	const books = $derived(author.books.map(isbn => getBook(isbn)));
</script>

<Page type="search">
	<Header title={author.name} subtitle="Author" />

	<div class="content">
		<ClickableImage src={author.picture} class="picture" />

		<p>{author.bio || "No description provided."}</p>

		<h2>Books</h2>
		<div class="books">
			{#each books as book}
				{#await book}
				{:then book}
					<a class="book" href="/book/{book.isbn}">
						<h1>{book.title}</h1>
						<BookCover {book} style="width: 2rem;" />
					</a>
				{/await}
			{/each}
		</div>
	</div>
</Page>

<style>
	.content {
		margin-top: 7rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;

		:global(.picture) {
			border-radius: 0.5rem;
			max-width: 80%;
		}
	}

	p {
		color: var(--overlay-1);
		padding: 2rem;
		font-size: 0.85rem;
	}

	h2 {
		width: 100%;
		color: var(--text);
		font-weight: normal;
		padding-bottom: 1rem;
		margin-left: 2rem;
	}

	.books {
		display: flex;
		flex-direction: column;
		margin-left: 2rem;
		margin-right: 2rem;
		width: 100%;

		.book {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1rem;
			text-decoration: none;

			h1 {
				color: var(--overlay-1);
				font-weight: normal;
				font-size: 1rem;
			}
		}
	}
</style>

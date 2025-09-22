<script lang="ts">
	import { goto } from "$app/navigation";
	import { getAuthor, updateAuthor, type Author } from "../../../../api/authorapi";
	import { updateBook } from "../../../../api/bookapi";
	import ImagePicker from "../../../../components/util/ImagePicker.svelte";
	import Page from "../../../../components/layout/Page.svelte";
	import AuthorSearch from "../../../../components/book/AuthorSearch.svelte";

	let { data } = $props();
	let book = $derived(data.book);

	// svelte-ignore state_referenced_locally
	let description = $state(book.description);
	// svelte-ignore state_referenced_locally
	let title = $state(book.title);
	// svelte-ignore state_referenced_locally
	let publishDate = $state(book.publishDate);

	let authors: Author[] = $state([]);

	let canSave = $derived(
		authors.length === 1 &&
			(description !== book.description ||
				title !== book.title ||
				publishDate !== book.publishDate ||
				authors[0].key !== book.authorKey),
	);

	async function update() {
		const promises = [updateBook(book, { description, title, publishDate, authorKey: authors[0].key })];
		if (authors[0].key !== book.authorKey) {
			promises.push(updateAuthor(authors[0], { books: [...new Set([...authors[0].books, book.isbn])] }));
		}
		await Promise.all(promises);
		goto(`/book/${book.isbn}`);
	}

	async function resetAuthor() {
		authors = [await getAuthor(book.authorKey)];
	}

	resetAuthor();
</script>

<Page type="search" header="Edit Book">
	<div class="info">
		<h2>{book.title}</h2>
		<h3>
			{#await getAuthor(book.authorKey) then author}
				{author.name}
			{/await}
		</h3>

		<hr />

		<div class="section">
			<span>
				This page is available to wallflower.land moderators only. Note that changes you make to this book's details
				here will update <b>globally for everyone</b>
				. This is a moderator tool meant for fixing issues in the book details fetched from the Google or OpenLibrary
				APIs.
				<b>Use carefully</b>
				.
			</span>
		</div>

		<hr />

		<div class="section">
			<div>
				<span>Cover</span>
				<label for="choose-book-cover">
					<img src={book.cover} alt={book.title} />
				</label>
				<ImagePicker id="choose-book-cover" aspectRatio={1 / 1.5} />
			</div>
		</div>

		<hr />

		<div class="section">
			<span>Description</span>
			<textarea class="description" bind:value={description}></textarea>
		</div>

		<hr />

		<div class="section">
			<AuthorSearch title="Author" bind:authors />
			<button class="reset" onclick={resetAuthor} disabled={authors.length === 1 && book.authorKey === authors[0].key}>
				Reset
			</button>
		</div>

		<hr />

		<div class="section">
			<span>Product Information</span>
			<div>
				<span>Title:</span>
				<input type="text" bind:value={title} />
			</div>
			<div>
				<span>Publish Date:</span>
				<input type="text" bind:value={publishDate} />
			</div>
		</div>

		<hr />

		<div class="saves bottom">
			<a class="cancel save" href="/book/{book.isbn}">Cancel</a>
			<button disabled={!canSave} class="save" onclick={update}>Save</button>
		</div>
	</div>
</Page>

<style>
	.saves {
		display: flex;
		padding-right: 1rem;
		width: 100%;
		gap: 1rem;

		&:not(.bottom) {
			margin-top: -1.5rem;

			> *:first-child {
				margin-left: auto;
			}
		}

		&.bottom {
			justify-content: center;
			margin-bottom: 2rem;
			margin-top: 1.5rem;
		}
	}

	.reset {
		padding-top: 0.5rem;
		padding-bottom: 0.25rem;
		border-radius: 100vmax;
		margin-top: 0.5rem;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: scale 0.2s;

		&[disabled] {
			color: var(--surface-2);
			background: var(--crust);
		}

		&:not([disabled]) {
			background-image: linear-gradient(to bottom right, var(--pink), var(--red));
			color: var(--crust);
			box-shadow: 0px 0px 0.5rem var(--box-shadow);

			&:hover {
				scale: 105%;
			}
		}
	}

	.save {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 100vmax;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 7rem;
		transition: scale 0.1s;
		text-decoration: none;

		&:hover {
			scale: 105%;
		}

		&.cancel {
			background: linear-gradient(to bottom right, var(--peach), var(--red));
		}

		&:not([disabled], .cancel) {
			background: linear-gradient(to bottom right, var(--lavender), var(--blue));
			box-shadow: 0px 0px 0.5rem black;
		}

		&[disabled] {
			background-color: var(--crust);
			color: var(--surface-2);
			box-shadow: none;
			scale: 100%;
			cursor: default;
		}
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 3rem;
	}

	hr {
		height: 1px;
		width: 100%;
		background-color: var(--surface-0);
	}

	.description {
		padding: 0.75rem;
		font-size: 0.85rem;
		white-space: pre-wrap;
		color: var(--subtext-1);
		background-color: var(--crust);
		width: 100%;
		height: 10rem;
		resize: none;
		border-radius: 0.5rem;
		overflow-y: auto;
	}

	.section {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 1rem;
		gap: 0.5rem;

		span {
			color: var(--overlay-1);
			font-size: 0.85rem;
		}

		> div:has(input) {
			display: grid;
			align-items: center;
			grid-template-columns: 1fr 3fr;
		}

		input {
			width: 100%;
			background-color: var(--crust);
			border-radius: 0.5rem;
			font-size: 0.85rem;
			padding: 0.5rem;
			color: var(--subtext-1);
		}

		div:has(img) {
			color: var(--overlay-1);
			display: flex;
			justify-content: space-between;
			align-items: center;

			img {
				height: 4rem;
				border-radius: 0.25rem;
			}
		}
	}

	h2 {
		color: var(--subtext-1);
		margin-top: 1.25rem;
		font-size: 1rem;
	}

	h3 {
		font-weight: normal;
		color: var(--overlay-1);
		font-size: 0.85rem;
		margin-bottom: 1rem;
		margin-top: 0.25rem;
	}
</style>

<script lang="ts">
	import { goto } from "$app/navigation";
	import { format, post, type PostType } from "../../../api/postapi";
	import Page from "../../../components/Page.svelte";
	import { searchBooks, type Book } from "../../../api/bookapi";
	import Select from "../../../components/Select.svelte";
	import TrashIcon from "../../../assets/images/icons/TrashIcon.svelte";
	import EyeIcon from "../../../assets/images/icons/EyeIcon.svelte";
	import Header from "../../../components/Header.svelte";
	import CharacterLimitMeter from "../../../components/CharacterLimitMeter.svelte";
	import { getAuthor } from "../../../api/authorapi";

	let { data }: { data: { type: PostType } } = $props();
	let type = $derived(data.type);

	let bodyName = $derived({
		general: "Post Body",
		rating: "Review (Optional)",
		update: "Comments (Optional)",
		reply: null!,
	}[type]);

	let body: string = $state("");
	let rating: string | null = $state(null);
	let updateType = $state("start");
	let chosenBooks: Book[] = $state([]);

	let searchResults: Promise<Book>[] = $state([]);
	let searchText: string = $state("");

	async function search() {
		searchResults = await searchBooks(searchText);
	}

	function checkSearch(event: KeyboardEvent) {
		if (event.key === "Enter") {
			search();
		}
	}

	let bodyError = $state("");

	function validateBody() {
		if (type === "general" && body.trim().length === 0) {
			bodyError = "Body cannot be empty";
		} else {
			bodyError = "";
		}
	}

	function upload() {
		if (type === "rating") validateRating();
		if (type === "rating" || type === "update") validateBook();
		if (type === "general") validateBody();

		if (ratingError || bookError || bodyError) return;

		let object = { type, body, books: chosenBooks.map(book => book.isbn) };
		if (rating !== null) object = Object.assign(object, { rating: Number(rating) });
		if (type === "update") object = Object.assign(object, { updateType });

		post(object);

		goto("/profile");
	}

	function chooseBook(book: Book) {
		return function() {
			chosenBooks.push(book);
			validateBook();
		}
	}

	function removeBook(book: Book) {
		return function() {
			chosenBooks = chosenBooks.filter(other => other.isbn !== book.isbn);
			validateBook();
		}
	}

	let ratingError = $state("");
	let bookError = $state("");

	function validateRating() {
		if (type === "rating") {
			if (rating === null)  {
				ratingError = "Add a rating value.";
				return;
			}
			if (!/^\d(\.\d)?$/.test(rating!)) {
				ratingError = "Value must be between 0 and 10, to at most one decimal place.";
				return;
			}
		}

		ratingError = "";
	}

	function validateBook() {
		if (type === "rating" && chosenBooks.length === 0) {
			bookError = "Choose a book to rate.";
		} else {
			bookError = "";
		}
	}

	let showPreview = $state(false);
</script>

{#snippet bookSearch(title: string = "Add a book")}
	<h2>{title}</h2>

	<div class="book-search">
		<input
			id="search"
			type="text"
			bind:value={searchText}
			onkeyup={checkSearch}
			style:outline={bookError ? `2px solid var(--red)` : "none"}
		/>
		{#if bookError}
			<span class="error">{bookError}</span>
		{/if}
	</div>

	<div class="search-results">
		{#each searchResults as book}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			{#await book}
				<div class="book search-book">
					<img alt="Book cover" src="" />
					<div class="info">
						<span class="title">Loading Title...</span>
						<span class="authors">Loading authors...</span>
					</div>
				</div>
			{:then book}
				<div class="book search-book" onclick={chooseBook(book)}>
					<img alt="{book.title} cover" src={book.cover} />
					<div class="info">
						<span class="title">{book.title}</span>
						<span class="authors">
							{#await getAuthor(book.authorKey) then author}
								{author}
							{/await}
						</span>
					</div>
				</div>
			{/await}
		{/each}
	</div>
{/snippet}

{#snippet chosenBookList()}
	<div class="books">
		{#each chosenBooks as book (book.isbn) }
			<div class="book">
				<img alt="{book.title} cover" src={book.cover} />
				<div class="info">
					<span class="title">{book.title}</span>
					<span class="authors">
						{#await getAuthor(book.authorKey) then author}
							{author}
						{/await}
					</span>
				</div>
				<button class="close" onclick={removeBook(book)}>
					<TrashIcon stroke="var(--red)" style="width: 1.25rem; height: 1.25rem;" />
				</button>
			</div>
		{/each}
	</div>
{/snippet}

<Page>
	<div class="new-post-page">
		<Header title="New {type} Post" />

		{#if type === "rating"}
			{#if chosenBooks.length === 0}
				{@render bookSearch("Choose a book")}
			{:else}
				{@render chosenBookList()}
			{/if}

			<h2 class="body-name">Rating</h2>
			<div class="stars">
				<input 
					bind:value={rating}
					id="rating"
					oninput={validateRating}
					style:outline={ratingError ? `2px solid #f38ba8` : "none"}
				/>
				{#if ratingError}
					<span class="error">{ratingError}</span>
				{/if}
			</div>
		{/if}

		{#if type === "update"}
			<h2 class="body-name">Update Type</h2>
			<Select options={["start", "finish", "abandon"]} bind:value={updateType} style="margin-bottom: 1rem;" />

			{#if chosenBooks.length === 0}
				{@render bookSearch("Choose a book")}
			{:else}
				{@render chosenBookList()}
			{/if}
		{/if}

		<div class="body-header">
			<h2 class="body-name preview-body">{bodyName}</h2>
			{#if body}
				<button onclick={() => showPreview = !showPreview}>
					<EyeIcon stroke={showPreview ? "var(--lavender)" : "var(--overlay-1)"} style="width: 1rem; height: 1rem;" />
				</button>
			{/if}
		</div>

		{#if showPreview}
			{#await format(body) then body}
				<div class="preview">{@html body}</div>
			{/await}
		{:else}
			<div class="text-container">
				<textarea maxlength="144" id="body" bind:value={body}></textarea>
				<CharacterLimitMeter limit={144} bind:text={body} />
			</div>
		{/if}

		{#if type !== "rating" && type !== "update"}
			{#if chosenBooks.length !== 0}
				{@render chosenBookList()}
			{/if}
			{@render bookSearch("Add a book")}
		{/if}

		<button onclick={upload} class="post-button">
			Post
		</button>
	</div>
</Page>

<style>
	input, textarea, .preview {
		background-color: var(--crust);
		color: var(--subtext-1);
	}

	.search-book {
		cursor: pointer;
	}

	.body-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}

	.body-name:not(.preview-body) {
		margin-top: 1rem;
	}

	.text-container {
		position: relative;
	}

	.book {
		display: flex;	
		align-items: center;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		gap: 1rem;


		.title {
			color: var(--subtext-1);
		}

		&:first-child {
			margin-top: 0.5rem;
		}

		.info {
			display: flex;
			flex-direction: column;
			padding-right: 2rem;
		}

		img {
			width: 10%;
			aspect-ratio: 1 / 1.5;
		}

		.authors {
			font-size: 0.85rem;
			color: var(--overlay-1);
		}

		.close {
			margin-left: auto;
		}
	}


	.book-search {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stars {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

	}

	.error {
		color: var(--red);
		font-size: 0.85rem;
	}

	#rating {
		width: 100%;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	#search {
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	.search-results {
		height: 20rem;
		overflow: auto;
	}

	.post-button {
		width: fit-content;
		padding-left: 3rem;
		padding-right: 3rem;
		font-size: 1rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 100vmax;
		margin-left: auto;
		margin-right: auto;
		margin-top: 3rem;
		box-shadow: 0px 0px 10px black;
		background: linear-gradient(to bottom right, var(--lavender), var(--blue));
	}

	#body {
		padding: 0.5rem;
	}

	.new-post-page {
		padding-top: 4rem;
		padding-left: 2rem;
		padding-right: 2rem;
		padding-bottom: 2rem;
		display: flex;
		flex-direction: column;
	}

	textarea, .preview {
		border-radius: 0.75rem;
		width: 100%;
		height: 10rem;
		font-size: 0.85rem;
		padding: 0.5rem;
		resize: none;
		flex-shrink: 0;

		:global(a) {
			color: #89b4fa;
		}
	}

	h2 {
		font-weight: normal;
		font-size: 0.85rem;
		padding-bottom: 0.5rem;
		color: var(--overlay-1);
	}
</style>

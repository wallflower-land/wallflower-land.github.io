<script lang="ts">
	import { getAuthor } from "../../api/authorapi";
	import { getBook, searchBooks, type Book } from "../../api/bookapi";
	import TrashIcon from "../icons/TrashIcon.svelte";
	import { getCurrentlyReading, user } from "../../api/userapi.svelte";

	let { 
		title = "Choose a book",
		books = $bindable([]),
		multiple = false,
		types = ["search", "current", "list"]
	}: {
		title?: string,
		multiple?: boolean,
		types?: BookSearch[]
		books?: Book[],
	} = $props();

	type BookSearch = "search" | "current" | "list";

	let bookSearchType: BookSearch = $state("search");

	function chooseBook(book: Book) {
		return function() {
			books.push(book);
			searchText = "";
			searchResults = [];
		}
	}

	let results = $derived.by(async () => {
		if (bookSearchType === "search") return Promise.resolve(searchResults);
		if (bookSearchType === "list") return Promise.resolve(user()!.readingList.map(isbn => getBook(isbn)));
		if (bookSearchType === "current") return getCurrentlyReading(user()!.id).then(isbns => isbns.map(isbn => getBook(isbn)));
		return Promise.resolve([]);
	});

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

	function removeBook(book: Book) {
		return function() {
			books = books.filter(other => other.isbn !== book.isbn);
		}
	}
</script>

<div class="outer">
	<h2>{title}</h2>
	
	{#if books.length > 0}
		<div class="books">
			{#each books as book (book.isbn) }
				<div class="book">
					<img alt="{book.title} cover" src={book.cover} />
					<div class="info">
						<span class="title">{book.title}</span>
						<span class="authors">
							{#await getAuthor(book.authorKey) then author}
								{author.name}
							{/await}
						</span>
					</div>
					<button class="close" onclick={removeBook(book)}>
						<TrashIcon stroke="var(--red)" style="width: 1.25rem; height: 1.25rem;" />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	{#if books.length === 0 || multiple}
		<div class="section">
			<div class="add-book-buttons">
				{#if types.includes("search")}
					<button
						disabled={bookSearchType === "search"}
						onclick={() => bookSearchType = "search"}
					>
						Search
					</button>
				{/if}
				{#if types.includes("current")}
					<button
						disabled={bookSearchType === "current"}
						onclick={() => bookSearchType = "current"}
					>
						Current
					</button>
				{/if}
				{#if types.includes("list")}
					<button
						disabled={bookSearchType === "list"}
						onclick={() => bookSearchType = "list"}
					>
						List
					</button>
				{/if}
			</div>

			{#if bookSearchType === "search"}
				<div class="book-search">
					<input
						id="search"
						type="text"
						bind:value={searchText}
						onkeyup={checkSearch}
						placeholder="Search for a book..."
						enterkeyhint="search"
					/>
				</div>
			{/if}
		</div>

		{#if searchText || bookSearchType !== "search"}
			<div class="search-results">
				{#await results}
					<span>Loading books...</span>
				{:then results}
					{#if results.length === 0}
						<div class="no-results">
							{#if bookSearchType === "current"}
								<h2>No current books</h2>
								<p>
									If you add a book to your "currently reading" list,
									it'll appear here.
								</p>
							{:else if bookSearchType === "list"}
								<h2>Reading list is empty</h2>
								<p>
									If you add a book to your reading list,
									it'll appear here.
								</p>
							{:else if bookSearchType === "search"}
								<h2>No results</h2>
								<p>
									Try checking your spelling or searching for a different term.
								</p>
							{/if}
						</div>
					{/if}
					{#each results as book (book.then(book => book.isbn))}
						{#await book}
							<div class="book search-book">
								<img alt="Book cover" src="" />
								<div class="info">
									<span class="title">Loading Title...</span>
									<span class="authors">Loading authors...</span>
								</div>
							</div>
						{:then book}
							{#if !books.map(book => book.isbn).includes(book.isbn)}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="book search-book" onclick={chooseBook(book)}>
									<img alt="{book.title} cover" src={book.cover} />
									<div class="info">
										<span class="title">{book.title}</span>
										<span class="authors">
											{#await getAuthor(book.authorKey) then author}
												{author.name}
											{/await}
										</span>
									</div>
								</div>
							{/if}
						{/await}
					{/each}
				{/await}
			</div>
		{/if}
	{/if}
</div>

<style>
	.outer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.search-book {
		cursor: pointer;
	}

	.book-search {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		input::placeholder {
			color: var(--overlay-1);
		}
	}

	#search {
		padding: 0.5rem;
		padding-left: 0.75rem;
		border-radius: 0.5rem;
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
	}


	.search-results {
		max-height: 15rem;
		overflow: auto;
		background: var(--crust);
		border-radius: 0.5rem;
		border: 1px solid var(--surface-0);
		display: flex;
		flex-direction: column;

		> * {
			padding-left: 1rem;

			&:hover {
				background-color: var(--mantle);
			}
		}
	}

	.add-book-buttons {
		display: flex;
		justify-content: space-evenly;
		gap: 1rem;
		margin-bottom: 0.5rem;
		width: 100%;
		margin-left: auto;
		margin-right: auto;

		> button {
			color: var(--crust);
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			border-radius: 0.5rem;
			width: 100%;
			transition: scale 0.1s;
			font-size: 0.85rem;

			&:not([disabled]) {
				background-image: linear-gradient(to bottom right, var(--lavender), var(--blue));
				box-shadow: 0px 0px 0.5rem var(--box-shadow);

				&:hover {
					scale: 105%;
				}
			}

			&[disabled] {
				background: var(--crust);
				color: var(--surface-2);
			}
		}
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		input {
			background-color: var(--crust);
			border: 1px solid var(--surface-0);
			color: var(--subtext-1);
		}
	}

	h2 {
		color: var(--overlay-1);
		font-size: 0.85rem;
		font-weight: normal;
	}

	.no-results {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem;
		gap: 0.25rem;

		h2 {
			color: var(--subtext-1);
			font-size: 1.2rem;
		}

		p {
			color: var(--overlay-1);
			font-size: 0.85rem;
		}
	}

	.book {
		display: flex;	
		align-items: center;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		gap: 1rem;
		background-color: var(--crust);
		padding: 1rem;
		border-radius: 0.5rem;

		.title {
			color: var(--subtext-1);
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
</style>

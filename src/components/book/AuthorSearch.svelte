<script lang="ts">
	import { searchAuthors, type Author } from "../../api/authorapi";
	import TrashIcon from "../icons/TrashIcon.svelte";

	let {
		title = "Choose an author",
		authors = $bindable([]),
		multiple = false,
	}: {
		title?: string;
		multiple?: boolean;
		authors?: Author[];
	} = $props();

	function chooseAuthor(author: Author) {
		return function () {
			authors.push(author);
			searchText = "";
			searchResults = [];
		};
	}

	let searchResults: Promise<Author>[] = $state([]);
	let searchText: string = $state("");

	async function search() {
		searchResults = await searchAuthors(searchText);
	}

	function checkSearch(event: KeyboardEvent) {
		if (event.key === "Enter") {
			search();
		}
	}

	function removeAuthor(author: Author) {
		return function () {
			authors = authors.filter(other => other.id !== author.id);
		};
	}
</script>

<div class="outer">
	<h2>{title}</h2>

	{#if authors.length > 0}
		<div class="books">
			{#each authors as author (author.id)}
				<div class="book">
					<img alt={author.name} src={author.picture} />
					<div class="info">
						<span class="title">{author.name}</span>
					</div>
					<button class="close" onclick={removeAuthor(author)}>
						<TrashIcon stroke="var(--red)" style="width: 1.25rem; height: 1.25rem;" />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	{#if authors.length === 0 || multiple}
		<div class="section">
			<div class="book-search">
				<input
					id="search"
					type="text"
					bind:value={searchText}
					onkeyup={checkSearch}
					placeholder="Search for an author..."
					enterkeyhint="search"
				/>
			</div>
		</div>

		{#if searchText}
			<div class="search-results">
				{#if searchResults.length === 0}
					<div class="no-results">
						<h2>No results</h2>
						<p>Try checking your spelling or searching for a different term.</p>
					</div>
				{/if}
				{#each searchResults as author (author.then(author => author.id))}
					{#await author}
						<div class="book search-book">
							<img alt="Book cover" src="" />
							<div class="info">
								<span class="title">Loading Title...</span>
								<span class="authors">Loading authors...</span>
							</div>
						</div>
					{:then author}
						{#if !authors.map(author => author.id).includes(author.id)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="book search-book" onclick={chooseAuthor(author)}>
								<img alt={author.name} src={author.picture} />
								<div class="info">
									<span class="title">{author.name}</span>
								</div>
							</div>
						{/if}
					{/await}
				{/each}
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

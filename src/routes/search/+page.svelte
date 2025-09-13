<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { searchBooks, type Book } from "../../api/bookapi";
	import { searchPosts, type InternalPost} from "../../api/postapi";
	import { searchUsers, type User } from "../../api/userapi";
	import Loading from "../../components/Loading.svelte";
	import AnyPost from "../../components/posts/AnyPost.svelte";
	import UserListing from "../../components/UserListing.svelte";
	import BookCover from "../../components/BookCover.svelte";
	import { getAuthor, searchAuthors, type Author } from "../../api/authorapi";
	import PageWithViews from "../../components/PageWithViews.svelte";

	type View = "posts" | "books" | "users" | "authors";

	let view: View = $state(new URLSearchParams(window.location.search).get("view") as View ?? "posts");

	let searchTerm: string = $state(new URLSearchParams(window.location.search).get("term") ?? "");

	async function search() {
		if (searchTimeout) clearTimeout(searchTimeout)
		searchTimeout = null;

		searchTerm = searchTerm.trim();

		const params = new URLSearchParams({ term: searchTerm, view });
		goto(`/search?${params}`);

		if (view === "posts") posts = searchPosts(searchTerm);
		else if (view === "books") books = searchBooks(searchTerm);
		else if (view === "authors") authors = searchAuthors(searchTerm);
		else if (view === "users") users = searchUsers(searchTerm);
	}

	onMount(() => {
		if (searchTerm) search();
	});

	let searchTimeout: number | null = $state(null);

	function handleSearch(event: KeyboardEvent) {
		if (event.key === "Enter") {
			search();
		} else {
			if (searchTimeout) clearTimeout(searchTimeout)
			searchTimeout = setTimeout(search, 1000) as unknown as number;
		}
	}

	let posts: Promise<InternalPost[]> = $state(Promise.resolve([]));
	let books: Promise<Promise<Book>[]> = $state(Promise.resolve([]));
	let authors: Promise<Promise<Author>[]> = $state(Promise.resolve([]));
	let users: Promise<User[]> = $state(Promise.resolve([]));

	function onViewChange(_name: View) {
		search();
	}
</script>

{#snippet input()}
	<section>
		<input
			type="text"
			bind:value={searchTerm}
			onkeyup={handleSearch}
			onblur={search}
			enterkeyhint="search"
			placeholder={{
				books: "Enter a title or ISBN",
				posts: "Enter some keywords",
				authors: "Enter an author's name",
				users: "Enter a username"
			}[view]}
		/>
	</section>
{/snippet}

<PageWithViews 
	fullpage
	bind:view
	views={["posts", "books", "authors", "users"]}
	afterHeader={input}
	header="Search"
	pagetype="search"
	{onViewChange}
>
	<!-- Posts -->
	<div>
		{#await posts}
			<div class="loading">
				<h1>Loading posts...</h1>
				<p>We promise Wallflower will be faster soon.</p>
				<Loading />
			</div>
		{:then posts}
			{#if searchTerm == ""}
				<div class="loading">
					<h1>Search for a post</h1>
					<p>
						Enter your search term to find relevant posts.
					</p>
				</div>
			{:else if posts.length === 0}
				<div class="loading">
					<h1>No posts found</h1>
					<p>
						No posts were found relating to your search term. Make sure you spelled everything right!
					</p>
				</div>
			{/if}
			{#each posts as post}
				<AnyPost {post} />
			{/each}
		{/await}
	</div>

	<!-- Books -->
	<div>
		{#if searchTerm == ""}
			<div class="loading">
				<h1>Search for a book</h1>
				<p>
					Enter your search term to find relevant books.
				</p>
			</div>
		{:else}
			{#await books}
				<div class="loading">
					<h1>Loading books...</h1>
					<p>We promise Wallflower will be faster soon.</p>
					<Loading />
				</div>
			{:then books}
				{#if books.length === 0}
					<div class="loading">
						<h1>No books found</h1>
						<p>
							No books were found relating to your search term. Make sure you spelled everything right!
						</p>
					</div>
				{/if}
				<div class="books">
					{#each books as book}
						{#await book}
							<div class="book">
								<div class="book-info">
									<div class="loading-title"></div>
									<div class="loading-authors"></div>
								</div>
								<div class="loading-cover"></div>
							</div>
						{:then book}
							<a href={`/book/${book.isbn}`} class="book">
								<div class="book-info">
									<h1>
										{book.title}
									</h1>
									<h2>
										{#await getAuthor(book.authorKey) then author}
											{author.name}
										{/await}
									</h2>
								</div>
								{#if book.cover}
									<BookCover {book} style="width: 3.5rem; margin-left: auto;" />
								{:else}
									<div class="loading-cover"></div>
								{/if}
							</a>
						{/await}
					{/each}
				</div>
			{/await}
		{/if}
	</div>
	
	<!-- Authors -->
	<div>
		{#await authors}
			<div class="loading">
				<h1>Loading authors...</h1>
				<p>We promise Wallflower will be faster soon.</p>
			</div>
		{:then authors}
			{#if searchTerm == ""}
				<div class="loading">
					<h1>Search for an author</h1>
					<p>
						Enter your search term to find relevant authors.
					</p>
				</div>
			{:else if authors.length === 0}
				<div class="loading">
					<h1>No users found</h1>
					<p>
						No users were found relating to your search term. Make sure you spelled everything right!
					</p>
				</div>
			{/if}
			<div class="authors">
				{#each authors as author}
					{#await author then author}
						{#if author.picture}
							<a href={`/author/${author.id}`} class="book">
								<div class="author-info">
									<h1>
										{author.name}
									</h1>
									<h2>
										Born {author.birthday}
									</h2>
								</div>
								{#if author.picture}
									<img alt={author.name} class="author-image" src={author.picture} />
								{:else}
									<div class="loading-cover"></div>
								{/if}
							</a>
						{/if}
					{/await}
				{/each}
			</div>
		{/await}
	</div>
	
	<!-- Users -->
	<div>
		{#await users}
			<div class="loading">
				<h1>Loading accounts...</h1>
				<p>We promise Wallflower will be faster soon.</p>
			</div>
		{:then users}
			{#if searchTerm == ""}
				<div class="loading">
					<h1>Search for a user</h1>
					<p>
						Enter your search term to find relevant users.
					</p>
				</div>
			{:else if users.length === 0}
				<div class="loading">
					<h1>No users found</h1>
					<p>
						No users were found relating to your search term. Make sure you spelled everything right!
					</p>
				</div>
			{/if}
			<div class="users">
				{#each users as user}
					<UserListing {user} />
				{/each}
			</div>
		{/await}
	</div>
</PageWithViews>

<style>
	section {
		background-color: var(--crust);
		view-transition-name: search-box;
	}

	.loading {
		padding-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding-left: 3rem;
		padding-right: 3rem;
		text-align: center;

		h1 {
			font-size: 1.5rem;
			color: var(--subtext-1);
		}

		p {
			font-size: 0.85rem;
			color: var(--overlay-1);
		}
	}

	a {
		text-decoration: none;
	}

	.book {
		display: flex;
		padding-left: 2rem;
		padding-top: 1rem;
		padding-bottom: 1rem;
		padding-right: 2rem;
		gap: 1rem;

		.loading-cover {
			width: 3.25rem;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2rem;
			font-weight: bold;
			background: var(--surface-0);
			margin-left: auto;
			aspect-ratio: 1 / 1.5;
			border-radius: 0.25rem;
		}

		.book-info {
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 0.25rem;

			.loading-title {
				background-color: var(--surface-2);
				width: 10rem;
				height: 1rem;
				border-radius: 100vmax;
			}

			.loading-authors {
				background-color: var(--surface-0);
				width: 5rem;
				height: 1rem;
				border-radius: 100vmax;
			}

			h1 {
				color: var(--text);
			}

			h2 {
				color: var(--overlay-1);
				font-size: 0.85rem;
			}
		}
	}

	.books {
		display: flex;
		flex-direction: column;

		h1,
		h2 {
			font-weight: normal;
			font-size: 1rem;
		}
	}

	input {
		margin-left: 2rem;
		margin-bottom: 1rem;
		border-radius: 100vmax;
		width: calc(100% - 4rem);
		padding-left: 1rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		background-color: var(--base);
		font-size: 1rem;
		color: var(--subtext-1);

		&::placeholder {
			color: var(--surface-2);
		}
	}

	.author-info {
		display: flex;
		flex-direction: column;
		width: 100%;

		h1 {
			color: var(--subtext-1);
			font-weight: normal;
			font-size: 1rem;
		}

		h2 {
			font-weight: normal;
			color: var(--overlay-1);
			font-size: 0.85rem;
		}
	}

	.author-image {
		width: 3rem;
		height: 4.5rem;
		border-radius: 0.25rem;
		margin-left: 1rem;
	}
</style>

<script lang="ts">
	import { goto } from "$app/navigation";
	import { getAuthor } from "../../../api/authorapi";
	import { getBookDiscussions, getBookRating } from "../../../api/bookapi";
	import { updateUser, user } from "../../../backend/auth.svelte";
	import BookCover from "../../../components/BookCover.svelte";
	import Page from "../../../components/Page.svelte";
	import PageWithViews from "../../../components/PageWithViews.svelte";
	import AnyPost from "../../../components/posts/AnyPost.svelte";
	import Sidebar from "../../../components/Sidebar.svelte";
	import StarRating from "../../../components/StarRating.svelte";

	let { data } = $props();
	let book = $derived(data.book);
	let author = $derived(getAuthor(book.authorKey));

	let view: "info" | "discussion" = $state("info");

	function setView(viewName: "info" | "discussion") {
		return function() {
			view = viewName;
			const params = new URLSearchParams({ view });
			goto(`/book/${book.isbn}?${params}`);
		}
	}

	let discussions = $derived(getBookDiscussions(book.isbn));
	let sidebar: Sidebar = $state(null!);
	let isInReadingList = $derived(user()?.readingList.includes(book.isbn) ?? false)

	async function addToReadingList() {
		const readingList = user()!.readingList;
		updateUser({ readingList: [...readingList, book.isbn]  })
		user()?.readingList.push(book.isbn);
	}

	async function removeFromReadingList() {
		const readingList = user()!.readingList.filter(isbn => isbn !== book.isbn);
		updateUser({ readingList })
		user()!.readingList = readingList;
	}

	function makeReadable(description: string, interval = 3) {
		description = description.replaceAll("--", "—");
		description = description.replaceAll(/\.(\S)/g, (_match, letter) => `. ${letter}`);

		let sentences = description.split(/([.!?])\s*/);

		const sentenceArray = [];
		for (let sentenceNumber = 0; sentenceNumber < sentences.length; sentenceNumber += 2) {
			const punctuation = sentenceNumber < sentences.length - 1 ? sentences[sentenceNumber + 1] : "";
			sentenceArray.push(sentences[sentenceNumber] + punctuation);
		}

		const mapped = sentenceArray.map((sentence, index) => {
				if ((index + 1) % interval === 0 && index !== sentenceArray.length - 1) {
					return sentence + "\n\n";
				}
				return sentence;
			});

		let formattedText = mapped.join("");
		formattedText = formattedText.replaceAll(/\.(\S)/g, (_match, letter) => `. ${letter}`);

		return formattedText;
	}
</script>

<Page type="search" bind:sidebar>
	<PageWithViews bind:view views={["info", "discussion"]} header={book.title} subheader={author.then(author => author.name)}>
		<div class="info">
			<div class="book-info">
				<div class="title">
					<h1>{book.title}</h1>
					{#await author}
						<h2>Loading...</h2>
					{:then author}
						<h2>{author.name}</h2>
					{/await}
				</div>
				<BookCover {book} style="width: 10rem" />
				{#await getBookRating(book.isbn) then { rating, count } }
					<button class="rating" onclick={setView("discussion")}>
						<StarRating {rating} /> {rating.toFixed(1)}
						<span class="count">({count})</span>
					</button>
				{/await}
				<p class="description">
					{makeReadable(book.description)}
				</p>
			</div>

			{#if user()}
				{#if isInReadingList}
					<button id="add-to-reading-list" class="remove-from-reading-list" onclick={removeFromReadingList}>
						Remove from Reading List
					</button>
				{:else}
					<button id="add-to-reading-list"onclick={addToReadingList}>
						Add to Reading List
					</button>
				{/if}
			{/if}

			<div class="product-info">
				<h2>Product Information</h2>
				<span><span>Title: </span>{book.title}</span>
				<span>
					<span>Author: </span>
					<span>
						{#await author then author}
							<a href="/author/{author.key}">{author.name}</a>
						{/await}
					</span>
				</span>
				<span><span>ISBN-13: </span>{book.isbn}</span>
				<span><span>Page Count: </span>{book.pageCount}</span>
				<span><span>Publish Date: </span>{book.publishDate}</span>
				<span><span>Publisher{book.publishers.length === 1 ? "" : "s"}: </span>{book.publishers.join(", ")}</span>
				{#if book.characters.length > 0}
					<span><span>Characters: </span>{book.characters.join(", ")}</span>
				{/if}
				<span><span>Tags: </span>{book.genres.join(", ")}</span>
			</div>

		</div>
		<div>
			{#await discussions then discussions}
				{#each discussions as post}
					<AnyPost {post} />
				{/each}
			{/await}
		</div>
	</PageWithViews>
</Page>

<style>
	.info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.rating {
		display: flex;
		align-items: center;
		color: var(--subtext-1);
		gap: 0.5rem;
		font-size: 0.85rem;

		.count {
			color: var(--surface-2);
		}
	}

	.product-info {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 1.5rem;
		gap: 0.25rem;
		margin-top: 0.5rem;

		h2 {
			color: var(--subtext-1);
			margin-bottom: 0.5rem;
		}

		span {
			font-size: 0.85rem;
		}

		> span {
			color: var(--overlay-1);

			a {
				color: var(--blue);
				text-decoration: none;
			}

			> span {
				color: var(--subtext-1);
				padding-right: 0.25rem;
			}
		}
	}

	#add-to-reading-list {
		padding: 0.5rem 1rem 0.5rem 1rem;
		border-radius: 100vmax;
		box-shadow: 0px 0px 0.5rem var(--box-shadow);
		transition: scale 0.1s;
		margin-top: 1rem;

		&:not(.remove-from-reading-list) {
			background: linear-gradient(to bottom right, var(--lavender), var(--blue));
		}

		&:hover {
			scale: 105%;
		}
	}

	.remove-from-reading-list {
		background: linear-gradient(to bottom right, var(--peach), var(--red));
	}

	.book-info {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		.title {
			display: flex;
			align-items: center;
			flex-direction: column;
			gap: 0.25rem;
			padding-bottom: 0.5rem;

			h1 {
				color: var(--text);
				font-weight: normal;
				text-align: center;
				font-size: 1.5rem;
			}

			h2 {
				color: var(--overlay-1);
				font-size: 1rem;
			}
		}
	}

	h2 {
		font-weight: normal;
	}

	.description {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		font-size: 0.85rem;
		white-space: pre-wrap;
		color: var(--overlay-1);
	}
</style>

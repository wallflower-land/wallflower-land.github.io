<script lang="ts">
	import { getAuthor } from "../../api/authorapi";
	import { getBook, type ISBN } from "../../api/bookapi";
	import type { User } from "../../api/userapi.svelte";
	import BookCover from "../book/BookCover.svelte";
	import StarRating from "../book/StarRating.svelte";
	import PostBody from "./PostBody.svelte";

	let {
		isbn,
		rating,
		review,
		user
	}: {
		isbn: ISBN,
		rating: number,
		review: string,
		user: User
	} = $props();

	let book = getBook(isbn);
</script>

<div>
	{#await book then book}
		<p class="rating-line">
			{user.displayName} rated
			<i>{book?.title}</i>
			<span>{rating} / 10</span>:
		</p>
		<div class="info">
			<div class="content">
				<a href={`/book/${book?.isbn}`} class="title">{book?.title}</a>
				<a href={`/book/${book?.isbn}`} class="author">
					{#await getAuthor(book.authorKey) then author}
						{author.name}
					{/await}
				</a>
				<div class="stars">
					<StarRating {rating} size={1.2} />
				</div>
				<h1 class="rating-number">
					{rating} / 10
				</h1>
			</div>
			<a href={`/book/${book?.isbn}`} aria-label={`Go to details for book "${book?.title}"`}>
				<BookCover clickable={false} {book} style="width: 6rem; margin-left: 1rem;" />
			</a>
		</div>
		<PostBody body={review} />
	{/await}
</div>

<style>
	.info {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		margin-bottom: 1rem;
	}

	a {
		text-decoration: none;
	}

	.rating-number {
		font-size: 1.75rem;
		color: var(--text);
	}

	.stars {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;

		.title,
		.author {
			text-decoration: none;
			text-align: center;
		}

		.author {
			font-size: 0.85rem;
			color: var(--surface-2);
		}

		.title {
			font-size: 1.2rem;
			color: var(--subtext-1);
		}
	}

	.rating-line {
		padding-bottom: 1rem;
		font-size: 0.85rem;
		color: var(--overlay-1);
		
		i {
			color: var(--subtext-1);
		}

		span {
			font-size: inherit;
			color: var(--yellow);
		}
	}
</style>

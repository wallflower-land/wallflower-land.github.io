<script lang="ts">
	import { getAuthor } from "../../api/authorapi";
	import type { Book } from "../../api/bookapi";
	import type { User } from "../../api/userapi.svelte";
	import BookCover from "./BookCover.svelte";
	import StarRating from "./StarRating.svelte";

	let { book, rating, user, onclick }: { book: Book, rating?: number, user: User, onclick?: () => void } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element data-rating="{rating}" id="outer" this={onclick ? "div" : "a"} href="/book/{book.isbn}" onclick={() => onclick?.()}>
	<div class="book-info">
		<h1>{book.title}</h1>
		<h2>{#await getAuthor(book.authorKey) then author}{author.name}{/await}</h2>
	</div>

	{#if rating !== undefined}
		<div class="rating">
			<span class="name">{user.displayName}'s rating:</span>
			<StarRating {rating} size={0.6}/>
			<span class="rating-number">{rating === 10 ? rating : rating.toFixed(1)} / 10</span>
		</div>
	{/if}

	<BookCover style="height: 100%; aspect-ratio: 8 / 11;" {book} />
</svelte:element>

<style>
	#outer {
		position: relative;
		cursor: pointer;
		text-decoration: none;
		display: flex;
		height: 6rem;
		padding: 1rem;
		padding-left: 2rem;
		align-items: center;
		justify-content: space-between;
		background-color: var(--base);
		border-bottom: 1px solid var(--surface-0);
	}

	.name {
		color: var(--text);
	}

	.rating-number {
		color: var(--overlay-1);
	}

	h1 {
		color: var(--subtext-1);
	}

	h2 {
		color: var(--overlay-1);
	}

	.rating {
		display: flex;
		align-items: center;
		text-align: center;
		font-size: 0.85rem;
		flex-direction: column;
		gap: 0.5rem;
		padding-right: 1rem;
		padding-left: 1rem;
	}

	.book-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 50%;

		h1,
		h2 {
			font-weight: normal;
		}

		h1 {
			font-size: 0.85rem;
		}

		h2 {
			font-size: 0.75rem;
		}
	}
</style>

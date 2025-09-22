<script lang="ts">
	import Page from "../../components/layout/Page.svelte";
</script>

<Page type="new" class="new-page" header="New Post">
	<p class="kind">What kind of post do you want to make?</p>

	<!-- General post -->
	<a href="/new/general">
		<h2>General</h2>
		<p>A general post with some text and optionally images or videos.</p>
	</a>

	<!-- Rating post -->
	<a href="/new/rating">
		<h2>Rating</h2>
		<p>Rate or review a book</p>
	</a>

	<!-- Update post -->
	<a href="/new/update">
		<h2>Update</h2>
		<p>An update on starting, finishing, or abandoning a book.</p>
	</a>
	<p class="note">
		If you rate a book, it'll automatically mark it as finished. Only post an update when you finish a book if you don't
		want to rate it.
	</p>
</Page>

<style>
	:global(.new-page) {
		padding-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.note {
		padding-left: 4rem;
		padding-right: 4rem;
		color: var(--overlay-1);
	}

	h2 {
		font-weight: normal;
		font-size: 1rem;
		color: var(--crust);
	}

	p {
		font-size: 0.8rem;
		color: var(--surface-2);
	}

	a {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 75%;
		border-radius: 1rem;
		text-align: center;
		gap: 0.25rem;
		height: 5.5rem;
		text-decoration: none;
		box-shadow: 0px 0px 1rem black;
		transition: scale 0.1s;
		background: linear-gradient(to bottom right, var(--lavender), var(--blue));

		&:hover {
			scale: 105%;
		}
	}

	.kind {
		margin-top: 3rem;
		color: var(--overlay-1);
	}
</style>

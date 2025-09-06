<script>
	import Header from "../../../components/Header.svelte";
	import Page from "../../../components/Page.svelte";
</script>

<Page class="about">
	<Header title="API Usage"/>

	<h2>API Usage</h2>

	<p>
		wallflower.land provides a RESTful JSON API for developers to access
		data from.
	</p>

	<h2>Books by ISBN</h2>

	<p>
		The <code>/api/book/[isbn]</code> endpoint can be used to fetch information about a book
		by it's ISBN-13. The endpoint provides the following fields:
	</p>

	<ul>
		<li>
			<code>title: string</code> - The title of the book
		</li>
		<li>
			<code>description: string</code> - A description for the book
		</li>
		<li>
			<code>authorKey: string</code> - An author key, which can be used to fetch
			author data at the <code>/api/author/&lt;key&gt;</code> endpoint.
		</li>
		<li>
			<code>pageCount: number</code> - The number of pages in the book
		</li>
		<li>
			<code>isbn: string</code> - The ISBN-13 that was searched
		</li>
		<li>
			<code>cover: string</code> - A link to the cover of the book
		</li>
		<li>
			<code>backupCover: string</code> - A link to a secondary cover for the book
		</li>
		<li>
			<code>genres: string[]</code> - Genres or subjects of the book
		</li>
		<li>
			<code>publishers: string[]</code> - The publishers of the book
		</li>
		<li>
			<code>publishDate: string</code> - The date the book was published
		</li>
		<li>
			<code>characters: string[]</code> - Characters in the book
		</li>
	</ul>

	<p>
		All of these fields are guaranteed to be present. Some arrays may be empty.
	</p>

	<h2>Books by Searching</h2>

	<p>
		The <code>/api/search/book?term=&lt;TERM&gt;</code> endpoint can be used to fetch 
		book search results from a search term <code>TERM</code>. The endpoint provides the 
		following fields:
	</p>

	<ul>
		<li>
			<code>results: string[]</code> - An array of ISBN-13s of the book search results.
			More information about each book from the results can be fetched from
			<code>/api/book/[isbn]</code> (see above).
		</li>
	</ul>

	<p>
		The results field is guaranteed to be present. If no results are found, it will be
		an empty array.
	</p>

	<p>
		The <code>/api/search/book</code> endpoint also takes the following search parameters:
	</p>

	<ul>
		<li>
			<code>term: string [required]</code> - The search term
		</li>
		<li>
			<code>limit: integer [optional]</code> - The maximum amount of search results 
			(<code>default = 10</code>).
		</li>
	</ul>
</Page>

<style>
	:global(.about) {
		padding: 2rem;
		padding-top: 4rem;
		font-size: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		p {
			color: var(--overlay-1);
		}
	}

	li {
		font-size: 0.85rem;
		color: var(--overlay-1);
		margin-bottom: 0.5rem;
	}


	ul {
		margin-left: 1rem;
	}

	h2 {
		color: var(--subtext-1);
		margin-bottom: -0.5rem;
		margin-top: 0.5rem;
	}

	code {
		font-family: monospace;
		background-color: var(--mantle);
		font-size: 0.8rem;
		color: var(--subtext-1);
		border-radius: 0.5em;
		padding: 0.25em;
	}
</style>

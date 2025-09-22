<script lang="ts">
	import CatIcon from "../components/icons/CatIcon.svelte";
	import Header from "../components/elements/Header.svelte";
	import Page from "../components/layout/Page.svelte";
</script>

<Page>
	<Header title="Uh oh!" />
	<section>
		<p>We couldn't find that page :c</p>
		<p>wallflower.land is still in development, and some pages are missing. They'll be here soon!</p>
		<p>Thanks for your patience :)</p>
		<CatIcon
			stroke="var(--mantle)"
			style="width: 50; height: 50%; margin-left: auto; margin-right: auto; margin-top: 2rem;"
		/>
		<a href="/">Go to Wallflower Home</a>
	</section>
</Page>

<style>
	section {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 3rem;

		p {
			color: var(--overlay-1);
			font-size: 0.85rem;
		}

		a {
			background-image: linear-gradient(to bottom right, var(--lavender), var(--blue));
			padding: 0.5rem 2rem 0.5rem 2rem;
			box-shadow: 0px 0px 0.5rem black;
			border-radius: 100vmax;
			color: var(--crust);
			width: fit-content;
			margin-top: 3rem;
			font-size: 0.85rem;
			text-decoration: none;
			margin-left: auto;
			margin-right: auto;
			transition: scale 0.2s;

			&:hover {
				scale: 105%;
			}
		}
	}
</style>

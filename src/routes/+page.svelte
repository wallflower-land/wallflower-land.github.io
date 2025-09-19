<script lang="ts">
	import { getFollowedPosts, getForYouPosts } from "../api/postapi";
	import CatIcon from "../components/icons/CatIcon.svelte";
	import { user } from "../api/userapi.svelte";
	import AnyPost from "../components/post/AnyPost.svelte";
	import PageWithViews, { wallflowerHeader } from "../components/layout/PageWithViews.svelte";

	type View = "following" | "discover";

	let view: View = $state(
		user() ? 
			new URLSearchParams(window.location.search).get("view") as View
			?? "following"
		: "discover"
	);

	let innerWidth: number = $state(window.innerWidth);

	let followedPosts = $derived(user() ? getFollowedPosts(user()!, true).then(posts => posts.toSorted((a, b) => b.timestamp - a.timestamp)) : Promise.resolve([]));
	let discoverPosts = getForYouPosts(user()!);
</script>

<svelte:window bind:innerWidth />

<PageWithViews
	fullpage
	pagetype="home"
	header={wallflowerHeader}
	bind:view
	views={["following", "discover"]}
	viewFilter={(name) => name === "discover" || !!user()}
>
	<!-- Following -->
	{#if user()}
		<div>
			{#await followedPosts then followedPosts}
				{#if followedPosts.length === 0}
					<div class="nofollowing">
						<h1>You're not following anyone.</h1>
						<p>When you follow people, their posts will appear here.</p>
						<CatIcon style="width: 10rem;" stroke="var(--mantle)" />
					</div>
				{/if}
				{#each followedPosts as post}
					<AnyPost {post} />
				{/each}
			{/await}
		</div>
	{/if}

	<!-- Discover -->
	<div>
		{#await discoverPosts then forYouPosts}
			{#each forYouPosts as post}
				<AnyPost {post} />
			{/each}
		{/await}
	</div>
</PageWithViews>

<style>
	.nofollowing {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-top: 3rem;
		gap: 1rem;
		padding-left: 2rem;
		padding-right: 2rem;

		h1 {
			font-size: 1.5rem;
			color: var(--text);
		}

		p {
			font-size: 0.85rem;
			color: var(--overlay-1);
		}
	}
</style>

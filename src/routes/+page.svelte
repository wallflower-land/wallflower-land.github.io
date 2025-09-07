<script lang="ts">
	import { getFollowedPosts, getForYouPosts } from "../api/postapi";
	import CatIcon from "../assets/images/icons/CatIcon.svelte";
	import PersonIcon from "../assets/images/icons/PersonIcon.svelte";
	import { user } from "../backend/auth.svelte";
	import Page from "../components/Page.svelte";
	import AnyPost from "../components/posts/AnyPost.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import Wallflower from "../assets/images/icons/Wallflower.svelte";
	import { getFile } from "../api/storageapi";
	import BellIcon from "../assets/images/icons/BellIcon.svelte";
	import PageWithViews from "../components/PageWithViews.svelte";

	let view: "following" | "for you" = $state(
		user() ? 
			new URLSearchParams(window.location.search).get("view") as "following" | "for you"
			?? "following"
		: "for you"
	);

	let innerWidth: number = $state(window.innerWidth);

	let followedPosts = $derived(user() ? getFollowedPosts(user()!, true).then(posts => posts.toSorted((a, b) => b.timestamp - a.timestamp)) : Promise.resolve([]));
	let forYouPosts = getForYouPosts(user()!);

	let sidebar: Sidebar = $state(null!);
	let spinLogo = $state(false);

	function spin() {
		if (!spinLogo) {
			spinLogo = true;
			setTimeout(() => spinLogo = false, 2000);
		}
	}
</script>

<svelte:window bind:innerWidth />

<Page bind:sidebar type="home">
	<nav>
		<div class="banner">
			<button onclick={() => sidebar.show()} aria-label="Open sidebar">
				{#if user()}
					{#await getFile(user()!.picture) then pfp}
						<img alt="Your profile" src={pfp} class="profile-link" />
					{/await}
				{:else}
					<PersonIcon stroke="var(--overlay-1)" style="width: 2.5rem;" />
				{/if}
			</button>

			<button onclick={spin}>
				<Wallflower class={spinLogo ? "spin" : ""} style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
			</button>

			<a href="/inbox">
				<BellIcon style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
			</a>
		</div>
	</nav>

	<PageWithViews bind:view views={["following", "for you"]}>

		<!-- Following -->
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

		<!-- Discover -->
		<div>
			{#await forYouPosts then forYouPosts}
				{#each forYouPosts as post}
					<AnyPost {post} />
				{/each}
			{/await}
		</div>

	</PageWithViews>
</Page>

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

	@keyframes spin {
		from {
			rotate: 0deg;
		}

		to {
			rotate: 360deg;
		}
	}
	
	:global(.spin) {
		animation-name: spin;
		animation-duration: 2s;
	}

	.banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;

		button {
			background-size: cover;
			background-position: center;
			overflow: hidden;

			img {
				border-radius: 50%;
				width: 3rem;
				height: 3rem;
			}
		}
	}

	nav {
		display: flex;
		flex-direction: column;
		width: 100%;
		background: var(--crust);
	}
</style>

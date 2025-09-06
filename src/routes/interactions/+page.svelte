<script lang="ts">
	import { goto } from "$app/navigation";
	import Page from "../../components/Page.svelte";
	import { getFile } from "../../api/storageapi";
	import { getUserReplies, user } from "../../backend/auth.svelte";
	import SearchIcon from "../../assets/images/icons/SearchIcon.svelte";
	import Wallflower from "../../assets/images/icons/Wallflower.svelte";
	import PersonIcon from "../../assets/images/icons/PersonIcon.svelte";
	import Sidebar from "../../components/Sidebar.svelte";
	import { getPostFromId, type InternalPost } from "../../api/postapi";
	import AnyPost from "../../components/posts/AnyPost.svelte";

	type View = "likes" | "replies" | "saved" | "shared" | "viewed";

	let sidebar: Sidebar = $state(null!);

	let view: View = $state(new URLSearchParams(window.location.search).get("view") as View ?? "likes");

	let viewed: InternalPost[] = $state([]);
	let liked: InternalPost[] = $state([]);
	let shared: InternalPost[] = $state([]);
	let saved: InternalPost[] = $state([]);
	let replies: Promise<InternalPost[]> = $state(Promise.resolve([]));

	$effect(() => {
		if (user()) load();
	})

	async function load() {
		if (view === "likes") {
			liked = (await Promise.all(user()!.likes.map(post => getPostFromId(post))))
				.map(post => post!)
				.filter(post => post)
				.toReversed()
		}
		if (view === "viewed") {
			viewed = (await Promise.all(user()!.views.map(post => getPostFromId(post))))
				.filter(post => post)
				.map(post => post!)
				.toReversed()
		}
		if (view === "replies") replies = getUserReplies(user()!);
		if (view === "shared") {
			shared = (await Promise.all(user()!.shares.map(post => getPostFromId(post))))
				.filter(post => post)
				.map(post => post!)
				.toReversed()
		}
		if (view === "saved") {
			saved = (await Promise.all(user()!.saved.map(post => getPostFromId(post))))
				.filter(post => post)
				.map(post => post!)
				.toReversed()
		}
	}

	function setView(viewName: View) {
		return async function() {
			const params = new URLSearchParams({ view: viewName });
			goto(`/interactions?${params}`);
			view = viewName;
			await load();
		}
	}
</script>

<Page bind:sidebar type="profile">
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

			<button>
				<Wallflower style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
			</button>

			<a class="search" href="/search">
				<SearchIcon style="width: 2rem; height: 2rem;" stroke="var(--subtext-1)" />
			</a>
		</div>
	</nav>
	<section>
		<div class="views">
			<button class={view === "viewed" ? "selected" : ""} onclick={setView("viewed")}>Viewed</button>
			<button class={view === "likes" ? "selected" : ""} onclick={setView("likes")}>Liked</button>
			<button class={view === "replies" ? "selected" : ""} onclick={setView("replies")}>Replies</button>
			<button class={view === "saved" ? "selected" : ""} onclick={setView("saved")}>Saved</button>
			<button class={view === "shared" ? "selected" : ""} onclick={setView("shared")}>Shared</button>
		</div>
	</section>
	{#if view === "viewed"}
		{#each viewed as viewedPost}
			<AnyPost post={viewedPost} />
		{/each}
	{:else if view === "likes"}
		{#each liked as likedPost}
			<AnyPost post={likedPost} />
		{/each}
	{:else if view === "replies"}
		{#await replies then replies}
			{#each replies as reply}
				<AnyPost post={reply} />
			{/each}
		{/await}
	{:else if view === "saved"}
		{#each saved as savedPost}
			<AnyPost post={savedPost} />
		{/each}
	{:else if view === "shared"}
		{#each shared as sharedPost}
			<AnyPost post={sharedPost} />
		{/each}
	{/if}
</Page>

<style>
	section {
		padding-top: 1rem;
		background-color: var(--crust);
		margin-top: 4.5rem;
	}

	a {
		text-decoration: none;
	}

	.views {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		padding-left: 1rem;
		padding-right: 1rem;

		> * {
			padding-bottom: 0.75rem;
			border-color: var(--lavender);
			color: var(--overlay-1);
			padding-left: 1rem;
			padding-right: 1rem;

			&.selected {
				color: var(--text);
				border-bottom: 3px solid var(--lavender);
			}
		}
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
		width: inherit;
		background: var(--crust);
		position: fixed;
		top: 0px;
	}

	@media(min-width: 700px) {
		nav {
			border-right: 1px var(--surface-0);
		}
	}
</style>

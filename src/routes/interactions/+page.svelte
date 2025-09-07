<script lang="ts">
	import Page from "../../components/Page.svelte";
	import { getFile } from "../../api/storageapi";
	import { getUserReplies, user } from "../../backend/auth.svelte";
	import SearchIcon from "../../assets/images/icons/SearchIcon.svelte";
	import Wallflower from "../../assets/images/icons/Wallflower.svelte";
	import PersonIcon from "../../assets/images/icons/PersonIcon.svelte";
	import Sidebar from "../../components/Sidebar.svelte";
	import { getPostFromId, type InternalPost } from "../../api/postapi";
	import AnyPost from "../../components/posts/AnyPost.svelte";
	import PageWithViews from "../../components/PageWithViews.svelte";

	type View = "liked" | "replied" | "saved" | "shared" | "viewed";

	let sidebar: Sidebar = $state(null!);

	let view: View = $state(new URLSearchParams(window.location.search).get("view") as View ?? "liked");

	let viewed: InternalPost[] = $state([]);
	let liked: InternalPost[] = $state([]);
	let shared: InternalPost[] = $state([]);
	let saved: InternalPost[] = $state([]);
	let replied: Promise<InternalPost[]> = $state(Promise.resolve([]));

	$effect(() => {
		if (user()) load();
	})

	async function load() {
		if (view === "liked") {
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
		if (view === "replied") replied = getUserReplies(user()!);
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

	<PageWithViews views={["viewed", "liked", "replied", "saved", "shared"]} bind:view>
		<div>
			{#each viewed as viewedPost}
				<AnyPost post={viewedPost} />
			{/each}
		</div>
		<div>
			{#each liked as likedPost}
				<AnyPost post={likedPost} />
			{/each}
		</div>
		<div>
			{#await replied then replied}
				{#each replied as reply}
					<AnyPost post={reply} />
				{/each}
			{/await}
		</div>
		<div>
			{#each saved as savedPost}
				<AnyPost post={savedPost} />
			{/each}
		</div>
		<div>
			{#each shared as sharedPost}
				<AnyPost post={sharedPost} />
			{/each}
		</div>
	</PageWithViews>
</Page>

<style>
	a {
		text-decoration: none;
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
		width: inherit;
		background: var(--crust);
	}

	@media(min-width: 700px) {
		nav {
			border-right: 1px var(--surface-0);
		}
	}
</style>

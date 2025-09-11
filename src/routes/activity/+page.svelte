<script lang="ts">
	import { getUserReplies, user } from "../../backend/auth.svelte";
	import { getPostFromId, type InternalPost } from "../../api/postapi";
	import AnyPost from "../../components/posts/AnyPost.svelte";
	import PageWithViews from "../../components/PageWithViews.svelte";

	type View = "liked" | "replied" | "saved" | "shared" | "viewed";

	let view: View = $state(new URLSearchParams(window.location.search).get("view") as View ?? "liked");

	let viewed: InternalPost[] = $state([]);
	let liked: InternalPost[] = $state([]);
	let shared: InternalPost[] = $state([]);
	let saved: InternalPost[] = $state([]);
	let replied: InternalPost[] = $state([]);

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
		else if (view === "viewed") {
			viewed = (await Promise.all(user()!.views.map(post => getPostFromId(post))))
				.filter(post => post)
				.map(post => post!)
				.toReversed()
		}
		else if (view === "replied") {
			replied = await getUserReplies(user()!);
		}
		else if (view === "shared") {
			shared = (await Promise.all(user()!.shares.map(post => getPostFromId(post))))
				.filter(post => post)
				.map(post => post!)
				.toReversed()
		}
		else if (view === "saved") {
			saved = (await Promise.all(user()!.saved.map(post => getPostFromId(post))))
				.filter(post => post)
				.map(post => post!)
				.toReversed()
		}
	}
</script>

<PageWithViews 
	views={["viewed", "liked", "replied", "saved", "shared"]} 
	bind:view
	fullpage
	pagetype="profile"
	header="Activity"
>
	<div>
		{#each viewed as viewedPost}
			<AnyPost post={viewedPost} />
		{/each}
		{#if viewed.length === 0}
			<div class="empty">
				<h2>No Viewed Posts</h2>
				<span>When you view post, it'll appear here.</span>
			</div>
		{/if}
	</div>
	<div>
		{#each liked as likedPost}
			<AnyPost post={likedPost} />
		{/each}
		{#if liked.length === 0}
			<div class="empty">
				<h2>No Liked Posts</h2>
				<span>When you like a post, it'll appear here.</span>
			</div>
		{/if}
	</div>
	<div>
		{#each replied as reply}
			<AnyPost post={reply} />
		{/each}
		{#if replied.length === 0}
			<div class="empty">
				<h2>No Replied Posts</h2>
				<span>When you reply to a post, it'll appear here.</span>
			</div>
		{/if}
	</div>

	<!-- Saved -->
	<div>
		{#each saved as savedPost}
			<AnyPost post={savedPost} />
		{/each}
		{#if saved.length === 0}
			<div class="empty">
				<h2>No Saved Posts</h2>
				<span>When you save a post, it'll appear here.</span>
			</div>
		{/if}
	</div>

	<div>
		{#each shared as sharedPost}
			<AnyPost post={sharedPost} />
		{/each}
		{#if shared.length === 0}
			<div class="empty">
				<h2>No Shared Posts</h2>
				<span>When you share a post, it'll appear here.</span>
			</div>
		{/if}
	</div>
</PageWithViews>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding-top: 2rem;

		h2 {
			color: var(--subtext-1);
			font-weight: normal;
		}

		span {
			color: var(--overlay-1);
		}
	}
</style>

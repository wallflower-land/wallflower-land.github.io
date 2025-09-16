<script lang="ts">
	import { getMentions, getNotifyingPosts, getRepliesToUser } from "../../api/userapi";
	import AnyPost from "../../components/post/AnyPost.svelte";
	import { user } from "../../backend/auth.svelte";
	import PageWithViews from "../../components/layout/PageWithViews.svelte";
	import GearIcon from "../../components/icons/GearIcon.svelte";

	type View = "mentions" | "replies" | "following";

	let view: View = $state(new URLSearchParams(window.location.search).get("view") as View ?? "mentions");

	const mentions = $derived(user() ? getMentions() : []);
	const replies = $derived(user() ? getRepliesToUser(user()!) : []);
	const following = $derived(user() ? getNotifyingPosts() : []);
</script>

<PageWithViews 
	bind:view 
	views={["mentions", "replies", "following"]} 
	header="Inbox"
	fullpage
	pagetype="inbox"
>
	<div>
		{#await mentions}
			<div class="loading">
				<h2>Loading Mentions...</h2>
				<p>We promise wallflower.land will be faster soon.</p>
			</div>
		{:then mentions}
			{#each mentions as mention}
				<AnyPost post={mention} />
			{/each}
		{/await}
	</div>

	<div>
		{#await replies}
			<div class="loading">
				<h2>Loading Replies...</h2>
				<p>We promise wallflower.land will be faster soon.</p>
			</div>
		{:then replies}
			{#each replies as reply}
				<AnyPost post={reply} />
			{/each}
		{/await}
	</div>

	<div>
		{#await following}
			<div class="loading">
				<h2>Loading Followed Posts...</h2>
				<p>We promise wallflower.land will be faster soon.</p>
			</div>
		{:then following}
			{#each following as followedPost}
				<AnyPost post={followedPost} />
			{/each}
		{/await}
	</div>
</PageWithViews>
<a class="settings" href="/settings/notifications">
	<GearIcon stroke="var(--overlay-1)" style="width: 1.5rem; height: 1.5rem;" />
</a>

<style>
	.loading {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;

		h2 {
			font-weight: normal;
			color: var(--subtext-1);
		}

		p {
			color: var(--overlay-1);
			font-size: 0.85rem;
		}
	}

	.settings {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 101;
	}
</style>

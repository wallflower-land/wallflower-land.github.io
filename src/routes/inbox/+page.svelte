<script lang="ts">
	import Page from "../../components/Page.svelte";
	import GearIcon from "../../assets/images/icons/GearIcon.svelte";
	import Header from "../../components/Header.svelte";
	import { getFollowingPosts, getMentions, getRepliesToUser } from "../../api/userapi";
	import AnyPost from "../../components/posts/AnyPost.svelte";
	import { user } from "../../backend/auth.svelte";
	import Views from "../../components/Views.svelte";

	type View = "mentions" | "replies" | "following";

	let view: View = $state(new URLSearchParams(window.location.search).get("view") as View ?? "mentions");

	const mentions = $derived(user() ? getMentions() : []);
	const replies = $derived(user() ? getRepliesToUser(user()!) : []);
	const following = $derived(user() ? getFollowingPosts() : []);

	// svelte-ignore state_referenced_locally
	let pageLeft = $state(`${["mentions", "replies", "following"].indexOf(view) * -100}%`);
</script>

<Page type="inbox">
	<Header title="Inbox" />
	<a class="settings" href="/settings/notifications">
		<GearIcon stroke="var(--overlay-1)" style="width: 1.5rem; height: 1.5rem;" />
	</a>

	<div class="view-wrapper">
		<Views bind:view views={["mentions", "replies", "following"]} bind:left={pageLeft} />
	</div>

	<div class="posts" style:left={pageLeft}>
		
		<div class="wrapper">
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

		<div class="wrapper">
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

		<div class="wrapper">
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
	</div>
</Page>

<style>
	.posts {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 300%;
		transition: left 0.2s;

		.wrapper {
			border-right: 1px solid var(--surface-0);
			min-width: 0px;
		}
	}

	.view-wrapper {
		margin-top: 3.2rem;
	}

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
	}
</style>

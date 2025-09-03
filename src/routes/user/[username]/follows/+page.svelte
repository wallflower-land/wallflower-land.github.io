<script lang="ts">
	import { getUserFromId, getUserFromUsername, getFollowers } from "../../../../api/userapi";
	import Header from "../../../../components/Header.svelte";
	import Page from "../../../../components/Page.svelte";
	import UserListing from "../../../../components/UserListing.svelte";

	let view: "following" | "followers" = $state("following");

	let { data }: { data: { username: string } } = $props();
	let { username } = data;

	let profileUser = $state(getUserFromUsername(username));
	let following = profileUser.then(user => Promise.all(user.following.map(following => getUserFromId(following))));
	let followers = profileUser.then(user => getFollowers(user));
</script>

<Page type="profile">
	<Header title="Follows" />

	{#await profileUser then}
		<div class="view">
			{#await following then following}
				<button
					style:color={view === "following" ? "var(--lavender)" : "var(--overlay-1)"}
					style:border-color={view === "following" ? "var(--lavender)" : "transparent"}
					onclick={() => (view = "following")}
				>
					Following ({following.length})
				</button>
			{/await}
			{#await followers then followers}
				<button
					style:color={view === "followers" ? "var(--lavender)" : "var(--overlay-1)"}
					style:border-color={view === "followers" ? "var(--lavender)" : "transparent"}
					onclick={() => (view = "followers")}
				>
					Followers ({followers.length})
				</button>
			{/await}
		</div>

		{#if view === "following"}
			{#await following then following}
				{#each following as child}
					<UserListing user={child} />
				{/each}
			{/await}
		{:else if view === "followers"}
			{#await followers then followers}
				{#each followers as child}
					<UserListing user={child} />
				{/each}
			{/await}
		{/if}
	{/await}
</Page>

<style>
	.view {
		display: flex;
		justify-content: space-evenly;
		background-color: var(--crust);
		margin-top: 1.5rem;

		button {
			border-bottom-style: solid;
			border-bottom-width: 2px;
			padding-top: 2rem;
			font-size: 0.85rem;
			padding-bottom: 0.75rem;
			padding-left: 2rem;
			padding-right: 2rem;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>

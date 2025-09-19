<script lang="ts">
	import { getUserFromId, getUserFromUsername, getFollowers } from "../../api/userapi.svelte";
	import PageWithViews from "../layout/PageWithViews.svelte";
	import UserListing from "../UserListing.svelte";

	type View = "following" | "followers";
	let view: View = $state("following");

	let { username }: { username: string } = $props();

	let profileUser = $derived(getUserFromUsername(username));
	let following = $derived(profileUser.then(user => Promise.all(user.following.map(following => getUserFromId(following)))));
	let followers = $derived(profileUser.then(user => getFollowers(user)));

	async function formatViewName(name: View): Promise<string> {
		if (name === "following") return `Following (${(await following).length})`;
		return `Followers (${(await followers).length})`;
	}
</script>

<PageWithViews
	bind:view 
	views={["following", "followers"]} 
	marginTop="3rem" 
	{formatViewName} 
	header="Follows"
	fullpage
	pagetype="profile"
>
	{#await profileUser then}
		<div>
			{#await following then following}
				{#each following as child}
					<UserListing user={child} />
				{/each}
			{/await}
		</div>
		<div>
			{#await followers then followers}
				{#each followers as child}
					<UserListing user={child} />
				{/each}
			{/await}
		</div>
	{/await}
</PageWithViews>

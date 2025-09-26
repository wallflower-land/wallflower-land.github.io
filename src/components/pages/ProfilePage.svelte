<script lang="ts">
	import { getUserFromId, getUserFromUsername, type UserId } from "../../api/userapi.svelte";
	import Page from "../layout/Page.svelte";
	import Profile from "../Profile.svelte";
	import Sidebar from "../Sidebar.svelte";

	let { userid = undefined, username = undefined }: { userid?: UserId; username?: string } = $props();

	let user = $derived(userid ? getUserFromId(userid) : getUserFromUsername(username!));
	let sidebar: Sidebar = $state(null!);
</script>

<Page bind:sidebar type="profile">
	{#await user then user}
		{#if user}
			<Profile {sidebar} {user} />
		{/if}
	{/await}
	<div></div>
</Page>

<style>
	div {
		height: 4rem;
	}
</style>

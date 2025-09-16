<script lang="ts">
	import { getUserFromId, getUserFromUsername } from "../../api/userapi";
	import Page from "../layout/Page.svelte";
	import Profile from "../Profile.svelte";
	import Sidebar from "../Sidebar.svelte";

	let { userid = undefined, username = undefined }: { userid?: string; username?: string } = $props();

	let userProfile = $derived(userid ? getUserFromId(userid) : getUserFromUsername(username!));
	let sidebar: Sidebar = $state(null!);
</script>

<Page bind:sidebar type="profile">
	{#await userProfile then userProfile}
		{#if userProfile}
			<Profile {sidebar} user={userProfile} />
		{/if}
	{/await}
	<div></div>
</Page>

<style>
	div {
		height: 4rem;
	}
</style>

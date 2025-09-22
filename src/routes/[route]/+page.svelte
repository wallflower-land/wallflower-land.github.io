<script lang="ts">
	import ProfilePage from "../../components/pages/ProfilePage.svelte";

	let { data } = $props();
	let route = $derived(data.route);
	let username = $derived(route.match(/^@(\w+)/)?.[1] ?? null);
</script>

{#if username}
	<ProfilePage {username} />
{/if}

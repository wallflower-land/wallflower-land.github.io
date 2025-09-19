<script lang="ts">
	import ProfilePage from '../../../components/pages/ProfilePage.svelte';

	let { data }: { data: { username: string } } = $props();

	let username = $derived(data.username);
</script>

<ProfilePage {username} />

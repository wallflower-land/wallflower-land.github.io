<script lang="ts">
	import ProfilePage from '../../../components/pages/ProfilePage.svelte';

	let { data } = $props();

	let username = $derived(data.username);
</script>

<ProfilePage {username} />

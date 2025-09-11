<script lang="ts">
	import Follows from "../../../../components/Follows.svelte";

	let { data }: { data: { username: string } } = $props();
</script>

<Follows username={data.username} />

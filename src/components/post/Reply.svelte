<script lang="ts">
	import PostBody from "./PostBody.svelte";

	let { body }: { body: string } = $props();
</script>

<section>
	<PostBody {body} />
</section>

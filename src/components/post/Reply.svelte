<script lang="ts">
	import PostBody from "./PostBody.svelte";

	let { body } = $props();
</script>

<section>
	<PostBody {body} />
</section>

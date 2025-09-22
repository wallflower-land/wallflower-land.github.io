<script lang="ts">
	import type { Snippet } from "svelte";
	import favicon from "../../assets/images/favicon.png";
	import globalCss from "../../global.css?url";

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href={globalCss} />
	<title>Wallflower | Settings</title>
</svelte:head>

{@render children()}

<script lang="ts">
	import favicon from "../../assets/images/favicon.png";
	import globalCss from "../../global.css?url";

	let { children, data } = $props();
	let route = $derived(data.route);
	let username = $derived(route.match(/^@(\w+)/)?.[1] ?? null);

	let title = $derived(username ? `Wallflower | @${username}` : "Wallflower");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href={globalCss} />
	<title>{title}</title>
</svelte:head>

{@render children()}

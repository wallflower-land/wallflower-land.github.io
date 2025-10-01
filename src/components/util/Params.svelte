<script lang="ts">
	let location = $state(window.location);
	let params = $derived(new URLSearchParams(location.search));
</script>

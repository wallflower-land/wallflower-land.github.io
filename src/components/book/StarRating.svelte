<script lang="ts">
	import StarIcon from "../icons/StarIcon.svelte";

	let { rating = $bindable(), size = 0.6, interactive = false }: { rating: number; size?: number, interactive?: boolean } = $props();

	function clampPercent(value: number) {
		return Math.max(Math.min(value, 1), 0);
	}

	function editRating(value: number) {
		return function() {
			if (!interactive) return;
			rating = rating === value ? value + 1 : value;
		}
	}
</script>

<span class="rating">
	<StarIcon
		onclick={editRating(0)}
		stroke="var(--yellow)"
		fill="var(--yellow)"
		fillEnd="var(--base)"
		fillPercent={clampPercent(rating / 2)}
		style="cursor: {interactive ? 'pointer' : 'default'}; width: {size * 1.5}rem; height: {size * 1.5}rem;"
	/>
	<StarIcon
		onclick={editRating(2)}
		stroke="var(--yellow)"
		fill="var(--yellow)"
		fillEnd="var(--base)"
		fillPercent={clampPercent((rating - 2) / 2)}
		style="cursor: {interactive ? 'pointer' : 'default'}; width: {size * 1.5}rem; height: {size * 1.5}rem;"
	/>
	<StarIcon
		onclick={editRating(4)}
		stroke="var(--yellow)"
		fill="var(--yellow)"
		fillEnd="var(--base)"
		fillPercent={clampPercent((rating - 4) / 2)}
		style="cursor: {interactive ? 'pointer' : 'default'}; width: {size * 1.5}rem; height: {size * 1.5}rem;"
	/>
	<StarIcon
		onclick={editRating(6)}
		stroke="var(--yellow)"
		fill="var(--yellow)"
		fillEnd="var(--base)"
		fillPercent={clampPercent((rating - 6) / 2)}
		style="cursor: {interactive ? 'pointer' : 'default'}; width: {size * 1.5}rem; height: {size * 1.5}rem;"
	/>
	<StarIcon
		onclick={editRating(8)}
		stroke="var(--yellow)"
		fill="var(--yellow)"
		fillEnd="var(--base)"
		fillPercent={clampPercent((rating - 8) / 2)}
		style="cursor: {interactive ? 'pointer' : 'default'}; width: {size * 1.5}rem; height: {size * 1.5}rem;"
	/>
</span>

<style>
	.rating {
		display: flex;
	}
</style>

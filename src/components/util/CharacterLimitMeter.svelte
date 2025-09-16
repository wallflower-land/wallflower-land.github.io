<script lang="ts">
	let { 
		limit, 
		threshold = 0.2, 
		text = $bindable(), 
		size = 1,
		display = "flex",
		...rest 
	} = $props();

	let thresholdValue = $derived(threshold * limit);

	let color = $derived.by(() => {
		const remaining = limit - text.length;
		if (remaining > thresholdValue) return "var(--surface-0)";
		if (remaining > 2/3 * thresholdValue) return "var(--yellow)";
		if (remaining > 1/3 * thresholdValue) return "var(--peach)";
		return "var(--red)";
	});
</script>

<div 
	style:--color={color} 
	style:--percent={100 * (1 - (limit - text.length) / limit)} 
	style:right="{size * 0.5}rem"
	style:bottom="{size * 0.5}rem"
	style:font-size="max({size * 0.75}rem, 0.7rem)"
	style:display
	{...rest}>
	{limit - text.length}
</div>

<style>
	div {
		position: absolute;
		right: 0.5rem;
		bottom: 0.5rem;
		height: 70%;
		aspect-ratio: 1;
		color: var(--color);
		align-items: center;
		justify-content: center;
		max-height: 2rem;
		max-width: 2rem;

		&::before {
			content: "";
			position: absolute;
			inset: 0;
			border-radius: 50%;
			padding: 2px;
			background: conic-gradient(var(--color) calc(var(--percent) * 1%), transparent 0);
			-webkit-mask: linear-gradient(#000000 0 0) content-box, linear-gradient(#000000 0 0);
			mask: linear-gradient(#000000 0 0) content-box, linear-gradient(#000000 0 0);
			-webkit-mask-composite: xor;
			mask-composite: exclude;
		}

	}
</style>

<script lang="ts">
	import { onMount } from "svelte";

	let { 
		gotoNext, 
		gotoPrevious, 
		left = $bindable(),
		swipeThreshold = 30,
	}: {
		gotoNext(): void,
		gotoPrevious(): void,
		left: string,
		swipeThreshold?: number,
	} = $props();

	onMount(() => {
		let touchStartX = 0;
		let touchEndX = 0;
		let touchStartY = 0;
		let touchEndY = 0;

		document.addEventListener("touchstart", (event) => {
			touchStartX = event.touches[0].clientX;
			touchStartY = event.touches[0].clientY;
		});

		document.addEventListener("touchmove", (event) => {
			if (touchEndX) {
				const delta = touchEndX - event.touches[0].clientX;
				left = `${Math.min(0, parseInt(left) - delta)}px`;
			}
			touchEndX = event.touches[0].clientX;
			touchEndY = event.touches[0].clientY;
		});

		document.addEventListener("touchend", () => {
			const swipeDistance = touchEndX - touchStartX;
			const swipeDistanceY = touchEndY - touchStartY;

			if (Math.abs(swipeDistanceY) < swipeThreshold) {

				// Swipe forward
				if (swipeDistance < -swipeThreshold) {
					gotoNext();
				} 

				// Swipe back
				else if (swipeDistance > swipeThreshold) {
					gotoPrevious();
				}
			} else {
				const leftAmount = parseInt(left);
				const newLeft = leftAmount % innerWidth < innerWidth / 2 ? leftAmount - leftAmount % innerWidth : leftAmount + (innerWidth - leftAmount % innerWidth);
				left = `${newLeft}px`;
				touchEndX = 0;
			}
		});
	});
</script>

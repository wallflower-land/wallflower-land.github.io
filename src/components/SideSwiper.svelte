<script lang="ts">
	let { 
		gotoNext, 
		gotoPrevious, 
		left = $bindable(),
		swipeThreshold = 30,
		content = undefined,
	}: {
		gotoNext(): void,
		gotoPrevious(): void,
		left: string,
		content?: HTMLElement,
		swipeThreshold?: number,
	} = $props();

	let touchStartX = 0;
	let touchEndX = 0;
	let touchStartY = 0;
	let touchEndY = 0;

	function touchstart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
	}

	function touchmove(event: TouchEvent) {
		if (touchEndX) {
			const delta = touchEndX - event.touches[0].clientX;
			left = `${Math.min(0, parseInt(left) - delta)}px`;
		}
		touchEndX = event.touches[0].clientX;
		touchEndY = event.touches[0].clientY;
	}

	function touchend() {
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
	}

	$effect(() => {
		content?.addEventListener("touchstart", touchstart);
		content?.addEventListener("touchmove", touchmove);
		content?.addEventListener("touchend", touchend);
	});

	function ontouchstart(event: TouchEvent) {
		if (content) return;
		touchstart(event);
	}

	function ontouchmove(event: TouchEvent) {
		if (content) return;
		touchmove(event);
	}

	function ontouchend() {
		if (content) return;
		touchend();
	}
</script>

<svelte:document {ontouchstart} {ontouchmove} {ontouchend} />

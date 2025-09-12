<script lang="ts">
	let {
		gotoNext,
		gotoPrevious,
		left = $bindable("0px"),
		content = undefined,
		swipeThreshold = 40,
	}: {
		gotoNext(): void,
		gotoPrevious(): void,
		left: string,
		content?: HTMLElement,
		swipeThreshold?: number,
	} = $props();

	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let baseLeft = 0;
	let axisLocked: "none" | "x" | "y" = "none";
	let dragging = $state(false);

	const AXIS_LOCK_THRESHOLD = 8;

	function pxToNumber(v: string) {
		return parseInt(v || "0", 10);
	}

	function touchstart(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
		lastX = startX;
		baseLeft = pxToNumber(left);
		axisLocked = "none";
		dragging = true;
	}

	function touchmove(e: TouchEvent) {
		if (!dragging) return;
		const curX = e.touches[0].clientX;
		const curY = e.touches[0].clientY;
		const dx = curX - startX;
		const dy = curY - startY;

		// lock axis
		if (axisLocked === "none") {
			if (Math.abs(dx) > AXIS_LOCK_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
				axisLocked = "x";
			} else if (Math.abs(dy) > AXIS_LOCK_THRESHOLD) {
				axisLocked = "y";
			}
		}

		if (axisLocked === "x") {
			e.preventDefault(); // block vertical scrolling
			left = `${baseLeft + dx}px`;
			lastX = curX;
		}
	}

	function touchend() {
		if (!dragging) return;
		dragging = false;

		if (axisLocked !== "x") {
			axisLocked = "none";
			return;
		}

		const dx = lastX - startX;

		if (dx > swipeThreshold) {
			gotoPrevious();
		} else if (dx < -swipeThreshold) {
			gotoNext();
		} else {
			// snap back to nearest "page"
			const width = content?.clientWidth || window.innerWidth;
			const pageIndex = Math.round(pxToNumber(left) / -width);
			left = `${-pageIndex * width}px`;
		}

		axisLocked = "none";
	}

	$effect(() => {
		const target = content ?? document;

		target.addEventListener("touchstart", touchstart as EventListener, { passive: true });
		target.addEventListener("touchmove", touchmove as EventListener, { passive: false });
		target.addEventListener("touchend", touchend, { passive: true });
		target.addEventListener("touchcancel", touchend, { passive: true });

		return () => {
			target.removeEventListener("touchstart", touchstart as EventListener);
			target.removeEventListener("touchmove", touchmove as EventListener);
			target.removeEventListener("touchend", touchend);
			target.removeEventListener("touchcancel", touchend);
		};
	});
</script>

<svelte:document />


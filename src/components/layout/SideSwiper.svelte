<script lang="ts">
	let {
		gotoNext,
		gotoPrevious,
		viewCount,
		left = $bindable("0px"),
		content = undefined,
		swipeThreshold = 40,
	}: {
		gotoNext(): void;
		gotoPrevious(): void;
		left: string;
		content?: HTMLElement;
		swipeThreshold?: number;
		viewCount: number;
	} = $props();

	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let baseLeft = 0;
	let axisLocked: "none" | "x" | "y" = "none";
	let dragging = $state(false);

	const AXIS_LOCK_THRESHOLD = 8;

	function pxToNumber(text: string) {
		return parseInt(text || "0", 10);
	}

	function touchstart(event: TouchEvent) {
		if (event.touches.length !== 1) return;
		startX = event.touches[0].clientX;
		startY = event.touches[0].clientY;
		lastX = startX;
		baseLeft = pxToNumber(left);
		axisLocked = "none";
		dragging = true;
	}

	function touchmove(event: TouchEvent) {
		if (!dragging) return;
		const curX = event.touches[0].clientX;
		const curY = event.touches[0].clientY;
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
			event.preventDefault(); // block vertical scrolling
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

	$effect.pre(() => {
		const totalWidth = content?.clientWidth || window.innerWidth;
		const panelWidth = totalWidth / viewCount;
		left = `${Math.max(Math.min(0, pxToNumber(left)), -(totalWidth - panelWidth))}px`;
	});

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

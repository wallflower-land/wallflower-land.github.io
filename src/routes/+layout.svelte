<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import globalCss from "../global.css?url";
	import favicon from "../assets/images/favicon.png";

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		const newIndex = getTabIndex(new URL(navigation.to?.url ?? location.href));
		if (
			newIndex === -1 || 
			currentIndex === -1 || 
			newIndex === currentIndex ||
			navigation.to?.url.pathname === navigation.from?.url.pathname
		) {
			document.documentElement.dataset.direction = "none";
			currentIndex = newIndex;
		} else {
			const direction = newIndex > currentIndex ? "forward" : "backward";
			currentIndex = newIndex;
			document.documentElement.dataset.direction = direction;
		}

		return new Promise(resolve => {
			document.startViewTransition(async() => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let currentIndex = 0; 

	function getTabIndex(url: URL) {
		if (url.pathname.match(/\/settings\/account\/(become\-a\-moderator|become\-a\-developer)/)) {
			return 102;
		}

		if (url.pathname.match(/\/settings\/(appearance|account|notifications)/)) {
			return 101;
		}

		if (url.pathname.startsWith("/settings")) {
			return 100;
		}		

		if (url.pathname.startsWith("/about")) {
			return 101;
		}		

		if (url.pathname.startsWith("/interactions")) {
			return 100;
		}

		if (url.pathname === "/") {
			return 100;
		}

		if (url.pathname.startsWith("/search")) {
			return 200;
		}

		if (url.pathname.startsWith("/author")) {
			return 250;
		}

		if (url.pathname.startsWith("/book")) {
			return 250;
		}

		if (url.pathname.match(/\/new\/(general|update|rating)/)) {
			return 301;
		}

		if (url.pathname.startsWith("/new")) {
			return 300;
		}

		if (url.pathname.startsWith("/inbox")) {
			return 400;
		}

		if (url.pathname.startsWith("/profile")) {
			return 500;
		}

		return -1;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon}/>
	<link rel="apple-touch-icon" href={favicon} />
	<link rel="stylesheet" href={globalCss} />
	<title>Wallflower</title>
</svelte:head>

{@render children()}

<style>
	@keyframes slide-from-right {
		from {
			transform: translateX(100%);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-100%);
		}
	}

	@keyframes slide-from-left {
		from {
			transform: translateX(-100%);
		}
	}

	@keyframes slide-to-right {
		to {
			transform: translateX(100%);
		}
	}

	:root[data-direction="forward"]::view-transition-old(root) {
		animation: 0.2s ease both slide-to-left;
	}

	:root[data-direction="forward"]::view-transition-new(root) {
		animation: 0.2s ease both slide-from-right;
	}

	:root[data-direction="backward"]::view-transition-old(root) {
		animation: 0.2s ease both slide-to-right;
	}

	:root[data-direction="backward"]::view-transition-new(root) {
		animation: 0.2s ease both slide-from-left;
	}

	:root[data-direction="none"]::view-transition-new(root) {
		animation: none;
	}

	:root[data-direction="none"]::view-transition-old(root) {
		animation: none;
	}

	@media (prefers-reduced-motion) {
		::view-transition-group(*),
		::view-transition-old(*),
		::view-transition-new(*) {
			animation: none !important;
		}
	}
</style>

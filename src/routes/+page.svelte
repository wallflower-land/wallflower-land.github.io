<script lang="ts">
	import { getFollowedPosts, getForYouPosts } from "../api/postapi";
	import CatIcon from "../assets/images/icons/CatIcon.svelte";
	import PersonIcon from "../assets/images/icons/PersonIcon.svelte";
	import { user } from "../backend/auth.svelte";
	import Page from "../components/Page.svelte";
	import AnyPost from "../components/posts/AnyPost.svelte";
	import Sidebar from "../components/Sidebar.svelte";
	import Wallflower from "../assets/images/icons/Wallflower.svelte";
	import { getFile } from "../api/storageapi";
	import BellIcon from "../assets/images/icons/BellIcon.svelte";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	let view: "following" | "for you" = $state(
		user() ? 
			new URLSearchParams(window.location.search).get("view") as "following" | "for you"
			?? "following"
		: "for you"
	);

	let followedPosts = $derived(user() ? getFollowedPosts(user()!, true).then(posts => posts.toSorted((a, b) => b.timestamp - a.timestamp)) : Promise.resolve([]));
	let forYouPosts = getForYouPosts(user()!);

	let sidebar: Sidebar = $state(null!);
	let spinLogo = $state(false);

	function spin() {
		if (!spinLogo) {
			spinLogo = true;
			setTimeout(() => spinLogo = false, 2000);
		}
	}

	let viewbarLeft = $derived.by(() => {
		return {
			following: "2.3rem",
			"for you": "13.2rem",
		}[view];
	});

	function setView(newView: "following" | "for you") {
		return function() {
			view = newView;
			const params = new URLSearchParams({ view });
			goto(`/?${params}`);
			pageLeft = `${["following", "for you"].indexOf(view) * -100}dvw`;
		}
	}

	// svelte-ignore state_referenced_locally
	let pageLeft = $state(`${["following", "for you"].indexOf(view) * -100}dvw`);

	onMount(() => {
		let touchStartX = 0;
		let touchEndX = 0;
		let touchStartY = 0;
		let touchEndY = 0;

		const SWIPE_THRESHOLD = 30;

		document.addEventListener("touchstart", (event) => {
			touchStartX = event.touches[0].clientX;
			touchStartY = event.touches[0].clientY;
		});

		document.addEventListener("touchmove", (event) => {
			touchEndX = event.touches[0].clientX;
			touchEndY = event.touches[0].clientY;
		});

		document.addEventListener("touchend", () => {
			const swipeDistance = touchEndX - touchStartX;
			const swipeDistanceY = touchEndY - touchStartY;

			if (Math.abs(swipeDistanceY) < SWIPE_THRESHOLD) {
				if (swipeDistance < -SWIPE_THRESHOLD) {
					if (view === "following") setView("for you")();
				} else if (swipeDistance > SWIPE_THRESHOLD) {
					if (view === "for you") setView("following")();
				}
			}
		});
	});
</script>

<Page bind:sidebar type="home">
	<nav>
		<div class="banner">
			<button onclick={() => sidebar.show()} aria-label="Open sidebar">
				{#if user()}
					{#await getFile(user()!.picture) then pfp}
						<img alt="Your profile" src={pfp} class="profile-link" />
					{/await}
				{:else}
					<PersonIcon stroke="var(--overlay-1)" style="width: 2.5rem;" />
				{/if}
			</button>

			<button onclick={spin}>
				<Wallflower class={spinLogo ? "spin" : ""} style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
			</button>

			<a href="/inbox">
				<BellIcon style="width: 2rem; height: 2rem;" stroke="var(--overlay-1)" />
			</a>
		</div>
	</nav>

	<section class="content">
		<div class="views">
			{#if user()}
				<button
					style:color={view === "following" ? "var(--lavender)" : "var(--overlay-1)"}
					onclick={setView("following")}
				>
					Following
				</button>
			{/if}
			<button
				style:color={view === "for you" ? "var(--lavender)" : "var(--overlay-1)"}
				onclick={setView("for you")}
			>
				Discover
			</button>
			<div class="viewline" style:left={viewbarLeft}></div>
		</div>

		<!-- Following -->
		<div class="posts" style:left={pageLeft}>
			<div class="wrapper">
				{#await followedPosts then followedPosts}
					{#if followedPosts.length === 0}
						<div class="nofollowing">
							<h1>You're not following anyone.</h1>
							<p>When you follow people, their posts will appear here.</p>
							<CatIcon style="width: 10rem;" stroke="var(--mantle)" />
						</div>
					{/if}
					{#each followedPosts as post}
						<AnyPost {post} />
					{/each}
				{/await}
			</div>
			<div class="wrapper">
				{#await forYouPosts then forYouPosts}
					{#each forYouPosts as post}
						<AnyPost {post} />
					{/each}
				{/await}
			</div>
		</div>
	</section>
</Page>

<style>
	.posts {
		display: grid;
		width: 200dvw;
		grid-template-columns: repeat(2, 1fr);
		position: relative;
		transition: left 0.2s;
	}

	.viewline {
		position: absolute;
		background-color: var(--lavender);
		bottom: 0px;
		height: 3px;
		width: 9rem;
		border-radius: 100vmax;
		transition: left 0.2s;
	}

	.nofollowing {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-top: 3rem;
		gap: 1rem;
		padding-left: 2rem;
		padding-right: 2rem;

		h1 {
			font-size: 1.5rem;
			color: var(--text);
		}

		p {
			font-size: 0.85rem;
			color: var(--overlay-1);
		}
	}

	@keyframes spin {
		from {
			rotate: 0deg;
		}

		to {
			rotate: 360deg;
		}
	}
	
	:global(.spin) {
		animation-name: spin;
		animation-duration: 2s;
	}

	.views {
		position: relative;
		display: flex;
		padding-right: 2rem;
		padding-left: 2rem;
		background-color: var(--crust);

		&:not(:has(> *:nth-child(2))) {
			justify-content: center;
		}

		&:has(> *:nth-child(2)) {
			justify-content: space-between;
		}

		button {
			padding-left: 3rem;
			padding-right: 3rem;
			font-weight: normal;
			font-size: 0.85rem;
			white-space: nowrap;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}
	}

	.content {
		font-family: sans-serif;
		color: #c6d0f5;
	}

	.banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;

		button {
			background-size: cover;
			background-position: center;
			overflow: hidden;

			img {
				border-radius: 50%;
				width: 3rem;
				height: 3rem;
			}
		}
	}

	nav {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: var(--max-width);
		background: var(--crust);
	}
</style>

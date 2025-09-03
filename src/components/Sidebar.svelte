<script lang="ts" module>
	let innerWidth = $state(window.innerWidth);

	function alwaysShowSidebar() {
		return innerWidth > 700;
	}
</script>

<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { getFile } from "../api/storageapi";
	import CloseIcon from "../assets/images/icons/CloseIcon.svelte";
	import EmptyHomeIcon from "../assets/images/icons/EmptyHomeIcon.svelte";
	import EnterIcon from "../assets/images/icons/EnterIcon.svelte";
	import ExitIcon from "../assets/images/icons/ExitIcon.svelte";
	import GearIcon from "../assets/images/icons/GearIcon.svelte";
	import InfoIcon2 from "../assets/images/icons/InfoIcon2.svelte";
	import PersonIcon from "../assets/images/icons/PersonIcon.svelte";
	import ProfileIcon from "../assets/images/icons/ProfileIcon.svelte";
	import { logOut, user } from "../backend/auth.svelte";
	import BarChartIcon from "../assets/images/icons/BarChartIcon.svelte";
	import WrenchIcon from "../assets/images/icons/WrenchIcon.svelte";

	let innerHeight = $state(window.innerHeight);

	// svelte-ignore state_referenced_locally
	let visible = $state(alwaysShowSidebar());

	// svelte-ignore state_referenced_locally
	let left = $derived(visible ? "0px" : alwaysShowSidebar() ? "-17rem" : "-23rem");
	let overlayOpacity = $derived(visible ? 0.5 : 0);

	$effect(() => {
		if (alwaysShowSidebar()) show();
		else hide();
	});

	export function show() {
		visible = true;
		overlayDisplay = "block";
	}

	export function hide() {
		visible = false;
		setTimeout(() => {
			overlayDisplay = "none";
		}, 200);
	}

	function nav(to: string) {
		return function () {
			goto(to);
			if (window.innerWidth < window.innerHeight) hide();
		};
	}

	function signOut() {
		logOut();
		goto("/");
		window.location.reload();
	}

	let overlayDisplay = $state("none");

	onMount(() => {
		let touchStartX = 0;
		let touchEndX = 0;

		const SWIPE_THRESHOLD = 30;
		const EDGE_ZONE = 100;

		document.addEventListener("touchstart", (event) => {
			touchStartX = event.touches[0].clientX;
		});

		document.addEventListener("touchmove", (event) => {
			touchEndX = event.touches[0].clientX;
		});

		document.addEventListener("touchend", () => {
			const swipeDistance = touchEndX - touchStartX;
			if (touchStartX < EDGE_ZONE && swipeDistance > SWIPE_THRESHOLD) {
				show();
			}
		});
	});

</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if !alwaysShowSidebar()}
	<div onclick={hide} class="overlay" style:opacity={overlayOpacity} style:display={overlayDisplay}></div>
{/if}
<section style:left>
	<div class="profile">
		<a class="profile-picture" href="/profile" aria-label="Go to profile">
			{#if user()}
				{#await getFile(user()!.picture) then pfp}
					<img alt="Your profile" src={pfp} class="profile-link" />
				{/await}
			{:else}
				<PersonIcon stroke="var(--overlay-1)" style="width: 4rem; height: 4rem;" />
			{/if}
		</a>
		<div>
			<a href="/profile">
				<h1>
					{user()?.displayName ?? "Guest"}
				</h1>
			</a>
			{#if user()}
				<a href="/profile">
					<h2>@{user()!.username}</h2>
				</a>
			{/if}
		</div>

		{#if !alwaysShowSidebar()}
			<button onclick={hide}>
				<CloseIcon stroke="var(--text)" style="width: 1.5rem; height: 1.5rem; position: absolute; top: 1.5rem; right: 1.5rem;" />
			</button>
		{/if}
	</div>

	<!-- Navigation buttons -->
	<button class="listing" style:color="var(--subtext-1)" onclick={nav("/")}>
		<EmptyHomeIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
		Home
	</button>
	<button class="listing" style:color="var(--subtext-1)" onclick={nav("/profile")}>
		<ProfileIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
		Profile
	</button>
	{#if user()}
		<button class="listing" style:color="var(--subtext-1)" onclick={nav("/interactions")}>
			<BarChartIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
			Interactions
		</button>
	{/if}
	{#if user() && user()!.tags.includes("mod")}
		<button class="listing" style:color="var(--subtext-1)" onclick={nav("/moderator-tools")}>
			<WrenchIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
			Moderator Tools
		</button>
	{/if}
	<button class="listing" style:color="var(--subtext-1)" onclick={nav("/settings")}>
		<GearIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
		Settings
	</button>
	<button class="listing" style:color="var(--subtext-1)" onclick={nav("/about")}>
		<InfoIcon2 stroke="var(--subtext-1)" style="width: 1.5rem;" />
		About
	</button>

	{#if user()}
		<button class="listing" style:color="var(--subtext-1)" onclick={signOut}>
			<ExitIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
			Log Out
		</button>
	{:else}
		<a class="listing" style:color="var(--subtext-1)" href="/login">
			<EnterIcon stroke="var(--subtext-1)" style="width: 1.5rem;" />
			Log In
		</a>
	{/if}
</section>

<style>
	section {
		position: fixed;
		height: 100dvh;
		top: 0px;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--surface-0);
		transition: left 0.25s;
		z-index: 999999;
		background-image: linear-gradient(to bottom, var(--base), var(--mantle));

		.listing {
			text-decoration: none;
			font-size: 1rem;
			display: flex;
			align-items: center;
			width: fit-content;
			gap: 2rem;
			padding-left: 2rem;
			padding-top: 1rem;
			padding-bottom: 1rem;
			width: 100%;

			&:hover {
				background: rgba(150, 150, 255, 10%);
			}

			&:last-child {
				margin-top: auto;
				background: var(--crust);
			}
		}
	}

	.profile-picture {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		margin-right: 1rem;
		margin-left: 2rem;
		background-size: cover;
		background-position: center;
		overflow: hidden;

		img {
			width: 4rem;
			height: 4rem;
		}
	}

	.profile {
		padding-top: 2rem;
		border-bottom: 1px solid var(--surface-0);
		padding-bottom: 2rem;
		display: flex;
		align-items: center;
		background: var(--crust);

		h1 {
			font-size: 1rem;
			color: var(--text);
			font-weight: normal;
		}

		h2 {
			font-weight: normal;
			font-size: 0.85rem;
			color: var(--overlay-1);
		}

		a {
			text-decoration: none;
		}
	}

	@media (max-width: 700px) {
		section {
			box-shadow: 0px 0px 10px black;
			width: 15rem;
		}
	}

	@media (min-width: 700px) {
		section {
			width: 20rem;
		}
	}

	.overlay {
		position: fixed;
		top: 0px;
		left: 0px;
		z-index: 99;
		width: 100dvw;
		height: 100dvh;
		background-color: black;
		transition: opacity 0.2s;
	}
</style>

<script lang="ts">
	import { getFile } from "../api/storageapi";
	import BellIcon from "../assets/images/icons/BellIcon.svelte";
	import EmptyHomeIcon from "../assets/images/icons/EmptyHomeIcon.svelte";
	import PlusIcon from "../assets/images/icons/PlusIcon.svelte";
	import ProfileIcon from "../assets/images/icons/ProfileIcon.svelte";
	import SearchIcon from "../assets/images/icons/SearchIcon.svelte";
	import { user } from "../backend/auth.svelte";

	let { selected = undefined }: { selected?: "home" | "profile" | "search" | "new" | "inbox" } = $props();
</script>

<div class="padding">&nbsp;</div>
<footer style:grid-template-columns="repeat({user() ? 5 : 3}, 1fr)">
	<a aria-label="Home" href="/">
		<EmptyHomeIcon stroke={selected === "home" ? "var(--text)" : "var(--overlay-1)"} style="width: 1.5rem;" />
	</a>
	<a aria-label="Search" href="/search">
		<SearchIcon stroke={selected === "search" ? "var(--text)" : "var(--overlay-1)"} style="width: 1.5rem;" />
	</a>
	{#if user()}
		<a aria-label="New" href="/new">
			<button>
				<PlusIcon stroke="var(--crust)" style="width: 1.25rem;" />
			</button>
		</a>
		<a aria-label="Notifications" href="/inbox">
			<BellIcon stroke={selected === "inbox" ? "var(--text)" : "var(--overlay-1)"} style="width: 1.5rem;" />
		</a>
	{/if}
	<a aria-label="Profile" href="/profile">
		{#if user()}
			{#await getFile(user()!.picture) then pfp}
				<img alt="Your profile" src={pfp} class="profile-link" />
			{/await}
		{:else}
			<ProfileIcon stroke={selected === "profile" ? "var(--text)" : "var(--overlay-1)"} style="width: 1.5rem;" />
		{/if}
	</a>
</footer>

<style>
	footer {
		position: fixed;
		bottom: 0px;
		left: 0px;
		display: grid;
		max-width: var(--max-width);
		background: var(--crust);
		view-transition-name: footer;

		a {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			display: flex;
			align-items: center;
			justify-content: center;

			&[aria-label="New"] button {
				background: linear-gradient(to bottom right, var(--mauve), var(--lavender), var(--blue));
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0.25rem;
				border-radius: 0.5rem;
			}
		}
	}

	@media (min-width: 700px) {
		footer {
			margin-left: 20rem;
			border-right: 1px solid var(--surface-0);
			width: calc(100% - 40rem);
		}
	}

	@media (max-width: 700px) {
		footer {
			width: 100%;
		}
	}

	.profile-link {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}
</style>

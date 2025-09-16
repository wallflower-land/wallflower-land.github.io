<script lang="ts">
	import { getFile } from "../api/storageapi";
	import type { User } from "../api/userapi";
	import Badges from "./Badges.svelte";

	let { user }: { user: User } = $props();
</script>

<a
	href={`/profile/${user.username}`}
	class="book"
>
	{#await getFile(user.picture) then pfp}
		<img alt="{user.displayName} profile" class="user-listing-profile-picture" src={pfp!} />
	{/await}
	<div class="person-info-wrapper">
		<div class="person-info">
			<h1>
				{user.displayName}
			</h1>
			<h2>
				@{user.username}
			</h2>
			<Badges forUser={user} size={1} />
		</div>
		<p>{user.bio}</p>
	</div>
</a>

<style>
	a {
		text-decoration: none;
	}

	.book {
		display: flex;
		padding: 1rem;
		border-bottom: 1px solid var(--surface-0);
	}

	h1 {
		color: var(--text);
	}

	h2 {
		color: var(--surface-2);
	}

	.person-info-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow-x: hidden;
	}

	.person-info {
		display: flex;
		gap: 0.5rem;

		h1,
		h2 {
			font-weight: normal;
			font-size: 0.85rem;
		}
	}

	.user-listing-profile-picture {
		height: 3rem;
		width: 3rem;
		border-radius: 50%;
		margin-right: 1rem;
	}

	p {
		color: var(--overlay-1);
		font-size: 0.85rem;
	}
</style>

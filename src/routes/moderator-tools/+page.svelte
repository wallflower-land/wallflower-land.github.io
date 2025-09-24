<script lang="ts">
	import { goto } from "$app/navigation";
	import { error } from "@sveltejs/kit";
	import { getMostReportedPosts } from "../../api/postapi";
	import { authStateIsReady, user } from "../../api/userapi.svelte";
	import CatIcon from "../../components/icons/CatIcon.svelte";
	import PageWithViews from "../../components/layout/PageWithViews.svelte";
	import AnyPost from "../../components/post/AnyPost.svelte";

	let view = $state("reported");

	let reported = getMostReportedPosts();

	$effect(() => {
		if (authStateIsReady() && !user()?.tags.includes("mod")) {
			error(403, "You do not have permission to access this page.");
		}
	});
</script>

<PageWithViews bind:view views={["reported", "deleted", "appeals"]} header="Moderator Tools" fullpage pagetype="profile">
	<div>
		<p>
			Below are the posts with the highest report counts on wallflower.land. If they violate the wallflower.land rules,
			delete them.
		</p>
		{#await reported then reported}
			{#if reported.length === 0}
				<div class="none">
					<h2>No reported posts</h2>
					<span>
						No posts have been reported that haven't been deleted yet. When some exist, they will appear here.
					</span>
					<CatIcon stroke="var(--mantle)" style="width: 50%;" />
				</div>
			{/if}
			{#each reported as post}
				<AnyPost {post} />
			{/each}
		{/await}
	</div>
	<div>
		<p>
			Below are the posts by other users that you've deleted. If you changed your mind and decide it doesn't violate
			the wallflower.land rules, you can un-delete it.
		</p>
	</div>
	<div>
		<p>
			Below are posts that have been deleted, but the user has asked for an appeal. This means that they believe their
			post was wrongfully removed by a moderator. You can review them and decide if they should be un-removed.
		</p>
	</div>
</PageWithViews>

<style>
	p {
		color: var(--overlay-1);
		padding: 1rem;
		border-bottom: 1px solid var(--surface-0);
		font-size: 0.85rem;
	}

	div {
		background-color: var(--base);
	}

	.none {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		gap: 0.5rem;

		h2 {
			color: var(--subtext-1);
			font-size: 1rem;
			font-weight: normal;
		}

		span {
			font-size: 0.85rem;
			color: var(--overlay-1);
			text-align: center;
		}
	}
</style>

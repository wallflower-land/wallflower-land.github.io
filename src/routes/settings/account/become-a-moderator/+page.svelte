<script lang="ts">
	import WrenchIcon from "../../../../components/icons/WrenchIcon.svelte";
	import Link from "../../../../components/util/Link.svelte";
	import Page from "../../../../components/layout/Page.svelte";
</script>

<Page class="about" header="Become a moderator">
	<div class="wrench">
		<WrenchIcon stroke="var(--crust)" style="width: 3rem; height: 3rem;" />
	</div>

	<h2>Becoming a Moderator</h2>

	<p>
		If you're interested in becoming a moderator for wallflower.land, reach out to <Link href="/@vi">@vi</Link> at <Link
			href="mailto:vi@wallflower.land"
		>
			vi@wallflower.land
		</Link>, or the whole staff team at
		<Link href="mailto:staff@wallflower.land">staff@wallflower.land</Link>. I'll try get in touch with you soon after.
	</p>

	<!-- Technical Details -->
	<h2>Moderating Details</h2>
	<p>
		Moderators for wallflower.land can delete other users posts, ban their accounts, unban their accounts, etc. It's a
		lot of responsibility.
	</p>

	<p>
		Because of that, I'm currently only accepting moderator requests from people I trust. This may change in the future
		as wallflower.land expands, but right now, I will admit that your chances of becoming a moderator&mdash;if I don't
		know you personally&mdash;are slim.
	</p>

	<p>
		That being said, it's not impossible. Reach out to me and we can chat. It helps if you have a long-standing active
		account on wallflower.land.
	</p>
</Page>

<style>
	:global(.about) {
		padding: 2rem;
		font-size: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 4.5rem;

		p {
			color: var(--overlay-1);
		}
	}

	.wrench {
		background: linear-gradient(to bottom right, var(--pink), var(--lavender));
		padding: 1rem;
		width: fit-content;
		border-radius: 1rem;
		margin-left: auto;
		margin-right: auto;
	}

	h2:not(.wallflower) {
		color: var(--subtext-1);
		margin-bottom: -0.5rem;
		margin-top: 0.5rem;
	}
</style>

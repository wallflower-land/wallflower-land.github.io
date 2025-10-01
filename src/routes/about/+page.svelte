<script>
	import WallflowerIcon from "../../components/icons/WallflowerIcon.svelte";
	import Link from "../../components/util/Link.svelte";
	import Page from "../../components/layout/Page.svelte";
</script>

<Page class="about" header="About">
	<div class="definition">
		<span>
			<h2 class="wallflower"><i>Wall&middot;flow&middot;er</i></h2>
			<span class="ipa" aria-label="US IPA">
				&#x2F;&#x2C8;w&#x0254;l&#x02CC;fla&#x028A;&#x025A;&#x2F;
			</span>
			<WallflowerIcon
				stroke="var(--overlay-1)"
				style="width: 1rem; height: 1rem; margin-left: auto; margin-right: 0.25rem;"
			/>
		</span>
		<p class="body">
			<i>(noun)</i>
			A shy person who is frightened to involve themselves in social activities and does not attract much
			interest or attention.
		</p>
	</div>

	<!-- About -->
	<h2>About</h2>
	<p>Like that other site, but for books.</p>

	<p>
		wallflower.land (or just Wallflower) is a social media website (and app soon!) for readers and
		writers. It's a space where us bookworms can make posts discussing, rating, reviewing, and updating
		our followers on books.
	</p>

	<p>
		The Wallflower team, the legal owner of wallflower.land, is a non-profit organization originally
		created by
		<Link href="/@vi" />
		as a passion project in college. The name
		<i>Wallflower</i>
		comes from
		<Link href="/@vi" />'s favorite book
		<Link href="/book/9780671027346" />
		by Stephen Chbosky.
	</p>
	<p>
		Powered by volunteers, no one on the Wallflower team makes a cent off of the project. wallflower.land
		is completely ad-free with zero in-app purchases.
	</p>

	<!-- Team & Values -->
	<h2>Team &amp; Values</h2>
	<p>
		Wallflower is still led by its original creator,
		<Link href="/@vi" />, a nonbinary reader, writer, and college student. Wallflower will always support
		kindness, acceptance, diversity, equity, and inclusion.
	</p>
	<p>Currently, Wallflower has no other team members.</p>
	<p>
		Wallflower does not support the use of AI, and will not be integrating AI features into the website or
		app.
	</p>

	<!-- Moderation -->
	<h2>Moderation</h2>
	<p>
		The Wallflower team moderates content posted to Wallflower. Harmful and hateful content will be
		removed. Wallflower also may remove content that's off-topic&mdash;Posting repeatedly with no relation
		to books or writing may get your account flagged. wallflower.land was designed to be a safe and cozy
		space for people to talk about and discover books. Nothing more, nothing less.
	</p>
	<p>
		Wallflower will never remove relevant constructive content based on opinion. Users are free to share
		as much dislike and distaste for books, writing styles, and author's specific works or styles. Do not
		attack authors themselves. Criticize the works, not the people.
	</p>
	<p>
		These moderation rules are loosely defined. Each situation will be handled by a case-by-case basis and
		judged by Wallflower's moderators, who are trusted to make educated judgements.
	</p>
	<p>
		If your account was suspended or banned and you feel it was wrongful, you can submit an appeal. Your
		content will be reviewed and a secondary, more thorough judgement will be passed to you.
	</p>

	<!-- Legal -->
	<h2>Legal</h2>
	<p>
		Wallflower is open source, meaning anyone can view and contribute to its code (<Link
			href="https://github.com/wallflower-app/wallflower-app.github.io"
		>
			here
		</Link>, if you're curious).
	</p>
	<p>
		Wallflower is licensed as <i>all rights reserved</i>
		, meaning you are legally not allowed to use, copy, or distribute its code without explicit authorization
		from its creator,
		<Link href="/@vi" />.
	</p>

	<p>
		You are free to contact <Link href="/@vi" />
		to ask for permission to use Wallflower's code for some specific circumstance. You can email me
		<i>personally</i>
		at
		<Link href="mailto:vi@wallflower.land" />. I don't bite, I promise. Alternatively, you can reach out
		to
		<Link href="mailto:staff@wallflower.land" />
		and it'll make its way to me.
	</p>
</Page>

<style>
	:global(.about) {
		padding: 2rem;
		padding-top: 4rem;
		font-size: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		p {
			color: var(--overlay-1);
		}
	}

	.definition {
		margin-top: 1rem;
		padding-top: 1rem;
		color: var(--overlay-1);
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--overlay-1);
		border-top: 1px solid var(--overlay-1);
		padding-bottom: 1rem;

		span {
			display: flex;
			align-items: center;
			gap: 1rem;
		}

		h2,
		h2 > i {
			color: var(--subtext-1);
			font-family: "Garamond";
		}

		.body {
			padding-top: 0.5rem;

			i {
				color: var(--surface-2);
			}
		}
	}

	h2:not(.wallflower) {
		color: var(--subtext-1);
		margin-bottom: -0.5rem;
		margin-top: 0.5rem;
	}
</style>

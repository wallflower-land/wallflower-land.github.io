<script lang="ts">
	import DeveloperIcon from "../../../../components/icons/DeveloperIcon.svelte";
	import Link from "../../../../components/util/Link.svelte";
	import Page from "../../../../components/layout/Page.svelte";
</script>

<Page class="about" header="Become a developer">
	<div class="icon">
		<DeveloperIcon stroke="var(--crust)" style="width: 3rem; height: 3rem;" />
	</div>

	<h2>Becoming a Developer</h2>

	<p>
		If you're interested in becoming a developer for wallflower.land, reach out
		to <Link href="/@vi">@vi</Link> at <Link href="mailto:vi@wallflower.land">vi@wallflower.land</Link>,
		or the whole staff team at
		<Link href="mailto:staff@wallflower.land">staff@wallflower.land</Link>.
		I'll try get in touch with you soon after.
	</p>

	<!-- Technical Details -->
	<h2>Development Details</h2>
	<p>
		On the front end, Wallflower is written using
		<Link href="https://svelte.dev/">Svelte</Link>
		and
		<Link href="https://svelte.dev/docs/kit/introduction">Sveltekit</Link>
		for the web (flavored with
		<Link href="https://www.typescriptlang.org/">TypeScript</Link>), 
		and ported to mobile with
		<Link href="https://v2.tauri.app/">Tauri</Link>.
	</p>
	<p>
		In the back, Wallflower uses <Link href="https://firebase.google.com/">Firebase</Link>
		to store data and manage authentication.
	</p>
	<p>
		This stack was chosen by
		<Link href="/profile/vi">@vi</Link>
		in the very beginning. The goal was a simple but powerful stack that allowed seamless porting
		between platforms.
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

	.icon {
		background-image: linear-gradient(to bottom right, var(--green), var(--teal));
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

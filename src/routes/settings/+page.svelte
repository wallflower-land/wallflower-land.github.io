<script lang="ts">
	import BellIcon from "../../components/icons/BellIcon.svelte";
	import DeveloperIcon from "../../components/icons/DeveloperIcon.svelte";
	import InfoIcon2 from "../../components/icons/InfoIcon2.svelte";
	import PaintRollerIcon from "../../components/icons/PaintRollerIcon.svelte";
	import ProfileIcon from "../../components/icons/ProfileIcon.svelte";
	import Page from "../../components/layout/Page.svelte";
</script>

<Page class="settings" header="Settings">

	<!-- Request author verification -->
	<a href="/settings/appearance">
		<div>
			<PaintRollerIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Appearance</span>
		</div>
		<p>Change your app theme, UI scaling, and customize your wallflower.land appearance in other ways.</p>
	</a>

	<a href="/settings/account">
		<div>
			<ProfileIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Account</span>
		</div>
		<p>Request author verification, request to be a moderator or developer, delete your account, and more.</p>
	</a>

	<a href="/settings/notifications">
		<div>
			<BellIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Notifications</span>
		</div>
		<p>Configure what kind of notifications you'd like to see in your inbox.</p>
	</a>

	<a href="/about">
		<div>
			<InfoIcon2 style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>About</span>
		</div>
		<p>The story behind wallflower.land, and what we're all about around here.</p>
	</a>

	<a href="/settings/api">
		<div>
			<DeveloperIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>API Usage</span>
		</div>
		<p>Use the wallflower.land API to get data on books and authors.</p>
	</a>
</Page>

<style>

	a {
		text-decoration: none;
		font-size: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		padding-left: 2rem;

		> div {
			display: flex;
			align-items: center;
			gap: 1rem;
			width: 100%;

			span {
				font-size: 1rem;
				color: var(--text);
			}
		}

		p {
			font-size: 0.8rem;
			color: var(--overlay-1);
		}

		&:first-of-type {
			margin-top: 3.5rem;
			padding-top: 1.5rem;
		}

		&:hover {
			background: rgba(150, 150, 255, 10%);
		}
	}
</style>

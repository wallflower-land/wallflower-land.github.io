<script lang="ts">
	import { goto } from "$app/navigation";
	import { logIn, user } from "../../api/userapi.svelte";
	import Page from "../../components/layout/Page.svelte";
	import Link from "../../components/util/Link.svelte";

	let email: string = $state("");
	let password: string = $state("");
	let errorMessage: string | null = $state(null);

	async function signIn() {
		let error = await logIn(email, password);
		if (error) {
			errorMessage = {
				"auth/invalid-email": "No account exists with this email.",
				"auth/wrong-password": "Email or password is incorrect."
			}[error.code] ?? "An unknown error has occurred.";
		} else {
			goto("/");
		}
	}

	$effect(() => {
		if (user()!) goto("/profile");
	});
</script>

<Page type="profile" header="Log In">
	<section class="main">
		<h2>Welcome Back.</h2>

		{#if errorMessage}
			<span class="error">{errorMessage}</span>
		{/if}

		<div>
			<div class="section">
				<p>Email</p>
				<input
					type="text"
					placeholder="example@website.com"
					bind:value={email}
				/>
			</div>
			<div class="section">
				<p>Password</p>
				<input
					type="password"
					placeholder="s3cr3tp4zzc0d3"
					bind:value={password}
				/>
				<Link href="/forgot-password">Forgot your password?</Link>
			</div>
		</div>
		<div class="bottom">
			<button disabled={!email || !password} onclick={signIn}>Log In</button>
			<p>Don't have an account? <Link href="/signup">Create one now.</Link></p>
		</div>
	</section>
</Page>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.error {
		font-size: 0.85rem;
		color: var(--red);
		width: 15rem;
	}

	h2 {
		color: var(--subtext-1);
		font-weight: normal;
	}

	p {
		color: var(--overlay-1);
		font-size: 0.85rem;
	}

	.bottom {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		height: 100%;

		> div {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			input {
				padding: 0.5rem;
				border-radius: 0.5rem;
				width: 15rem;
				font-size: 0.85rem;
				background-color: var(--crust);
				color: var(--subtext-1);
			}
		}

		button {
			margin-top: 2rem;
			padding: 0.5rem;
			width: 15rem;
			border-radius: 100vmax;

			&[disabled] {
				color: var(--surface-0);
				background-color: var(--crust);
				cursor: default;
			}

			&:not([disabled]) {
				box-shadow: 0px 0px 0.5rem black;
				background-image: linear-gradient(var(--lavender), var(--blue));
				transition: scale 0.2s;

				&:hover {
					scale: 105%;
				}
			}
		}

	}
</style>

<script lang="ts">
	import { goto } from "$app/navigation";
	import { usernameErrors } from "../../api/userapi";
	import { emailIsTaken, passwordErrors, signUp, user, usernameIsTaken } from "../../backend/auth.svelte";
	import Page from "../../components/layout/Page.svelte";
	import Header from "../../components/elements/Header.svelte";
	import Link from "../../components/util/Link.svelte";

	let email = $state("");
	let password = $state("");
	let password2 = $state("");
	let username = $state("");

	let passwordErrorList: string[] = $derived(passwordErrors(password));
	let usernameErrorList: string[] = $derived(usernameErrors(username));
	let emailErrorList: string[] = $state([]);
	let passwordMatchError = $derived(
		password.length > 0 && 
		password2.length > 0 && 
		password !== password2
	);

	let usernameIsAvailable = $state(true);
	let emailIsAvailable = $state(true);

	let usernameValid = $derived(usernameErrorList.length === 0 && usernameIsAvailable);
	let emailValid = $derived(emailErrorList.length === 0 && emailIsAvailable);
	let passwordValid = $derived(passwordErrorList.length === 0);
	let password2Valid = $derived(!passwordMatchError);

	let unknownError = $state(false);
	let waiver = $state(false);

	let valid = $derived(
		username.length > 0 &&
		email.length > 0 &&
		password.length > 0 &&
		password2.length > 0 &&
		usernameValid && 
		passwordValid && 
		password2Valid && 
		waiver
	);

	async function checkEmailAvailability(): Promise<boolean> {
		emailIsAvailable = email ? !await emailIsTaken(email) : true;
		return emailIsAvailable;
	}

	async function checkUsernameAvailability(): Promise<boolean> {
		usernameIsAvailable = username ? !await usernameIsTaken(username) : true;
		return usernameIsAvailable;
	}

	async function createAccount() {
		if (!valid) return;
		if (!await checkUsernameAvailability()) return;
		if (!await checkEmailAvailability()) return;

		let error = await signUp(email, password, username);
		if (error) {
			console.error(error);
			unknownError = true;
		} else {
			goto("/profile");
		}
	}

	$effect(() => {
		if (user()) {
			goto("/profile");
		}
	});
</script>

<Page type="profile">
	<Header title="Create Account" />
	<section class="main">
		<div class="header">
			<Link href="/about">Wait, what <i>is</i> wallflower.land?</Link>
		</div>
		<p class="warning">
			<strong>Hold up!</strong> wallflower.land is still in alpha, and bugs
			may be present. Proceed with the knowledge that stuff might break.
			<br />
			<br />
			(wallflower.land is secure, and despite any bugs, your information is
			guaranteed to be kept safe.)
		</p>

		<span class="login">
			Already have an account? <Link href="/login">Log in instead</Link>.
		</span>

		<div>
			<div class="section">
				{#if unknownError}
					<span class="unknown error">
						An unknown error occurred. Please refresh the
						page and try again.
					</span>
				{/if}
				<p>Username</p>
				<input
					type="text"
					placeholder="Username"
					bind:value={username}
					style:outline={usernameValid ? "none" : "2px solid var(--red)"}
					onblur={checkUsernameAvailability}
					autocomplete="off"
				/>
				{#each usernameErrorList as error}
					<span class="error">{error}</span>
				{/each}
				{#if !usernameIsAvailable}
					<span class="error">Username is taken.</span>
				{/if}
				<p class="canchange">You can change this at any time.</p>
			</div>

			<div class="section">
				<p>Email</p>
				<input
					type="text"
					placeholder="example@website.com"
					bind:value={email}
					style:outline={emailValid ? "none" : "2px solid var(--red)"}
					onblur={checkEmailAvailability}
				/>
				{#each emailErrorList as error}
					<span class="error">{error}</span>
				{/each}
				{#if !emailIsAvailable}
					<span class="error">Email is already in use.</span>
				{/if}
			</div>
			<div class="section">
				<p>Password</p>
				<input
					type="password"
					placeholder="sUp3rS3cr37!"
					bind:value={password}
					style:outline={passwordValid ? "none" : "2px solid var(--red)"}
				/>
				{#each passwordErrorList as error}
					<span class="error">{error}</span>
				{/each}
			</div>
			<div class="section">
				<p>Retype Password</p>
				<input
					type="password"
					placeholder="sUp3rS3cr37!"
					bind:value={password2}
					style:outline={password2Valid ? "none" : "2px solid var(--red)"}
				/>
				{#if passwordMatchError}
					<span class="error">Passwords much match</span>
				{/if}
			</div>
		
			<!-- im fucking cackling that i called this div class waiver -->
			<div class="waiver">
				<input type="checkbox" bind:checked={waiver} />
				I am prepared to use a buggy ass website
			</div>
		</div>

		<button disabled={!valid} onclick={createAccount}>
			Create Account
		</button>
	</section>
</Page>

<style>
	.login {
		color: var(--overlay-1);
		font-size: 0.85rem;
	}

	.error {
		font-size: 0.8rem;
		color: var(--red);

		&.unknown {
			margin-bottom: 1rem;
		}
	}

	.warning {
		color: var(--yellow);
		margin-left: 3rem;
		margin-right: 3rem;
		padding: 1rem;
		font-size: 0.85rem;
		border: 2px solid #FFFFCC;
		background: #202000;
		border-radius: 0.5rem;
		box-shadow: 0px 0px 0.5rem var(--yellow), inset 0px 0px 0.5rem var(--yellow);
	}

	.canchange {
		padding-bottom: 0.5rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;

		p {
			font-size: 0.85rem;
			color: var(--overlay-1);
		}
	}

	.main {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		gap: 2rem;
		position: relative;

		> div {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
			width: 50%;

			input[type="text"], input[type="password"] {
				padding: 0.5rem;
				border-radius: 0.5rem;
				width: 15rem;
				font-size: 0.85rem;
				color: var(--subtext-1);
				background-color: var(--crust);
			}
		}

		button {
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

	.waiver {
		color: var(--overlay-1);
		accent-color: var(--lavender);
		font-size: 0.85rem;
		
		input {
			margin-right: 0.5rem;
			width: fit-content;
			display: inline;
		}
	}

	.header {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-top: 5rem;
		gap: 0.5rem;
	}
</style>

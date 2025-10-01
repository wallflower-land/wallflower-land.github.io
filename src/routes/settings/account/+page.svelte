<script lang="ts">
	import { goto } from "$app/navigation";
	import AuthorIcon from "../../../components/icons/AuthorIcon.svelte";
	import ClosedEyeIcon from "../../../components/icons/ClosedEyeIcon.svelte";
	import CloseIcon from "../../../components/icons/CloseIcon.svelte";
	import DeveloperIcon from "../../../components/icons/DeveloperIcon.svelte";
	import EditMailIcon from "../../../components/icons/EditMailIcon.svelte";
	import EyeIcon from "../../../components/icons/EyeIcon.svelte";
	import PasswordIcon from "../../../components/icons/PasswordIcon.svelte";
	import TrashIcon from "../../../components/icons/TrashIcon.svelte";
	import WrenchIcon from "../../../components/icons/WrenchIcon.svelte";
	import {
		changeEmail,
		changePassword,
		deleteAccount,
		passwordErrors,
		updateUser,
		user,
	} from "../../../api/userapi.svelte";
	import Page from "../../../components/layout/Page.svelte";
	import Popup from "../../../components/Popup.svelte";
	import Notification from "../../../components/util/Notification.svelte";

	$effect(() => {
		if (!user()) {
			goto("/login");
		}
	});

	let params = new URLSearchParams(window.location.search);

	let waiting = $state(false);

	let email: string = $state("");
	let oldPassword = $state("");
	let newPassword = $state("");
	let newPassword2 = $state("");
	let deleteUsername = $state("");
	let emailPassword = $state("");
	let showOldPassword = $state(false);
	let showNewPassword = $state(false);
	let showNewPassword2 = $state(false);
	let newPasswordErrors = $derived(
		newPassword
			? [
					...passwordErrors(newPassword),
					...(newPassword === oldPassword
						? ["New password cannot be the same as old password."]
						: []),
				]
			: [],
	);
	let passwordMatchError = $derived(
		newPassword && newPassword2 && newPassword !== newPassword2 ? "Passwords must match" : null,
	);
	let canChangePassword = $derived(
		newPassword &&
			oldPassword &&
			newPassword2 &&
			!passwordMatchError &&
			newPasswordErrors.length === 0 &&
			newPassword !== oldPassword,
	);
	let changePasswordError = $state("");
	let changePasswordNotification: Notification;

	$effect(() => {
		if (!deleteAccountVisible) {
			const url = new URL(window.location.href);
			url.searchParams.delete("delete");
			window.history.replaceState({}, "", url);
		}
	});

	let changeEmailVisible = $state(false);
	let changeAuthorVisible = $state(false);
	let changePasswordVisible = $state(false);
	let deleteAccountVisible = $state(params.has("delete"));
	let usernameError = $derived(
		!deleteUsername || deleteUsername === user()?.username ? null : "Incorrect username",
	);
	let deletePassword = $state("");
	let confirmDeleteAccount = $state(false);
	let canDeleteAccount = $derived(!usernameError && deleteUsername && confirmDeleteAccount);

	async function submitDeleteAccount() {
		await deleteAccount(deletePassword);
		goto("/");
	}

	async function submitChangePassword() {
		if (!canChangePassword) return;
		waiting = true;
		let error = await changePassword(oldPassword, newPassword);
		if (error) {
			changePasswordError =
				{ "auth/wrong-password": "Old passord is Incorrect." }[error.code] ??
				"An unknown error has occurred. Please try again later.";
		} else {
			changePasswordVisible = false;
			changePasswordNotification.show();
			resetChangePasswordInputs();
		}
		waiting = false;
	}

	function resetChangePasswordInputs() {
		oldPassword = "";
		newPassword = "";
		newPassword2 = "";
	}

	async function submitChangeEmail() {
		changeEmailVisible = false;
		await changeEmail(email, emailPassword);
	}

	async function requestAuthorVerification() {
		await updateUser({ requestedAuthorVerification: true });
	}

	async function unrequestAuthorVerification() {
		await updateUser({ requestedAuthorVerification: false });
	}
</script>

<Page class="settings" header="Account">
	<!-- Change email -->
	<button class="first listing" onclick={() => (changeEmailVisible = true)}>
		<div>
			<EditMailIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Change email</span>
		</div>
		<p>
			Your email can be changed any number of times. Your current email is <span>{user()?.email}</span>
			.
		</p>
	</button>

	<Popup bind:visible={changeEmailVisible}>
		<div class="popup">
			<span class="title">Change Email</span>
			<p>
				Your current email is <span>{user()?.email}</span>
				.
			</p>
			<div class="section">
				<span>New Email</span>
				<input placeholder="new@example.com" type="text" bind:value={email} enterkeyhint="done" />
			</div>
			<div class="section">
				<span>Password</span>
				<input
					placeholder="password"
					type="password"
					bind:value={emailPassword}
					enterkeyhint="done"
				/>
			</div>
			<div class="buttons">
				<button class="cancel" onclick={() => (changeEmailVisible = false)}>Cancel</button>
				<button disabled={!email || !emailPassword} class="submit" onclick={submitChangeEmail}>
					Change
				</button>
			</div>
			<button class="close" onclick={() => (changeEmailVisible = false)}>
				<CloseIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
			</button>
		</div>
	</Popup>

	<!-- Change Password -->
	<button class="listing" onclick={() => (changePasswordVisible = true)}>
		<div>
			<PasswordIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Change Password</span>
		</div>
		<p>
			You can change your password any number of times. You will be asked to enter your current password
			first.
		</p>
	</button>

	<Popup bind:visible={changePasswordVisible} onclose={resetChangePasswordInputs}>
		<div class="popup">
			<span class="title">Change Password</span>
			<div class="section">
				<span>Old Password</span>
				<input
					placeholder="Old Password"
					type={showOldPassword ? "text" : "password"}
					bind:value={oldPassword}
					enterkeyhint="done"
				/>
				{#if showOldPassword}
					<button tabindex="-1" class="show-password" onclick={() => (showOldPassword = false)}>
						<ClosedEyeIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					</button>
				{:else}
					<button tabindex="-1" class="show-password" onclick={() => (showOldPassword = true)}>
						<EyeIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					</button>
				{/if}
				{#if changePasswordError}
					<span class="error">{changePasswordError}</span>
				{/if}
			</div>
			<div class="section">
				<span>New Password</span>
				<input
					placeholder="New Password"
					type={showNewPassword ? "text" : "password"}
					bind:value={newPassword}
					enterkeyhint="done"
				/>
				{#if showNewPassword}
					<button tabindex="-1" class="show-password" onclick={() => (showNewPassword = false)}>
						<ClosedEyeIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					</button>
				{:else}
					<button tabindex="-1" class="show-password" onclick={() => (showNewPassword = true)}>
						<EyeIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					</button>
				{/if}
				{#if newPasswordErrors.length > 0}
					<div class="errors">
						{#each newPasswordErrors as error}
							<span class="error">{error}</span>
						{/each}
					</div>
				{/if}
			</div>
			<div class="section">
				<span>Retype New Password</span>
				<input
					placeholder="Retype New Password"
					type={showNewPassword2 ? "text" : "password"}
					bind:value={newPassword2}
					enterkeyhint="done"
				/>
				{#if showNewPassword2}
					<button tabindex="-1" class="show-password" onclick={() => (showNewPassword2 = false)}>
						<ClosedEyeIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					</button>
				{:else}
					<button tabindex="-1" class="show-password" onclick={() => (showNewPassword2 = true)}>
						<EyeIcon stroke="var(--overlay-1)" style="width: 1rem; height: 1rem;" />
					</button>
				{/if}
				{#if passwordMatchError}
					<span class="error">{passwordMatchError}</span>
				{/if}
			</div>
			<div class="buttons">
				<button
					class="cancel"
					onclick={() => {
						changePasswordVisible = false;
						resetChangePasswordInputs();
					}}
				>
					Cancel
				</button>
				<button
					disabled={!canChangePassword || waiting}
					class="submit"
					onclick={submitChangePassword}
				>
					Change
				</button>
			</div>
			<button
				class="close"
				onclick={() => {
					changePasswordVisible = false;
					resetChangePasswordInputs();
				}}
			>
				<CloseIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
			</button>
		</div>
	</Popup>

	<!-- Request author verification -->
	<button class="listing" onclick={() => (changeAuthorVisible = true)}>
		<div>
			<AuthorIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Request author verification</span>
		</div>
		<p>Only published authors can recieve author verifications. Independent publishing is allowed.</p>
	</button>

	<Popup bind:visible={changeAuthorVisible}>
		<div class="popup">
			{#if user()?.tags.includes("author")}
				<span class="title">You are a verified author.</span>
				<p>
					Being a verified author gives you access to special author features in wallflower.land,
					and will display an author icon on your profile.
				</p>
			{:else}
				<span class="title">Request Author Verification</span>
				<p>
					Being a verified author gives you access to special author features in wallflower.land,
					and will display an author icon on your profile.
				</p>
				<p>
					Only published authors can receive author verification. Independent publishing is
					included.
				</p>
				{#if user()?.requestedAuthorVerification}
					<button class="unrequest become-author" onclick={unrequestAuthorVerification}>
						Unrequest Author Verification
					</button>
				{:else}
					<button class="request become-author" onclick={requestAuthorVerification}>
						Request Verification
					</button>
				{/if}
			{/if}
			<button class="close" onclick={() => (changeAuthorVisible = false)}>
				<CloseIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
			</button>
		</div>
	</Popup>

	<!-- Become a moderator -->
	<a class="listing" href="/settings/account/become-a-moderator">
		<div>
			<WrenchIcon style="width: 1rem; height: 1rem;" stroke="var(--text)" />
			<span>Become a moderator</span>
		</div>
		<p>
			Wallflower is powered by volunteering moderators who keep Wallflower content safe, relevant, and
			accessible.
		</p>
	</a>

	<!-- Become a developer -->
	<a class="listing" href="/settings/account/become-a-developer">
		<div>
			<DeveloperIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--text)" />
			<span>Become a developer</span>
		</div>
		<p>
			Wallflower is a non-profit organization powered by volunteers. Paying positions are currently not
			available.
		</p>
	</a>

	<!-- Delete account -->
	<button class="listing" onclick={() => (deleteAccountVisible = true)}>
		<div>
			<TrashIcon style="width: 1.25rem; height: 1.25rem;" stroke="var(--red)" />
			<span style:color="var(--red)">Delete your account</span>
		</div>
		<p>
			<b>This cannot be undone.</b>
			You will be shown a confirmation popup first.
		</p>
	</button>

	<Popup bind:visible={deleteAccountVisible}>
		<div class="popup">
			<span class="title">Delete Account</span>
			<p>Enter your username and password to confirm account deletion.</p>
			<div class="section">
				<span>Username</span>
				<input placeholder="username" type="text" bind:value={deleteUsername} enterkeyhint="done" />
			</div>
			{#if usernameError}
				<span class="error">{usernameError}</span>
			{/if}
			<div class="section">
				<span>Password</span>
				<input
					placeholder="password"
					type="password"
					bind:value={deletePassword}
					enterkeyhint="done"
				/>
			</div>
			<p class="confirm-delete">
				<input type="checkbox" bind:checked={confirmDeleteAccount} />
				I confirm that I want to delete my wallflower.land account permanently.
			</p>
			<div class="buttons">
				<button class="cancel" onclick={() => (deleteAccountVisible = false)}>Cancel</button>
				<button disabled={!canDeleteAccount} class="delete" onclick={submitDeleteAccount}>
					Delete
				</button>
			</div>
			<button class="close" onclick={() => (deleteAccountVisible = false)}>
				<CloseIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
			</button>
		</div>
	</Popup>
</Page>

<Notification message="Password updated" bind:this={changePasswordNotification} />

<style>
	input[type="checkbox"] {
		margin-right: 0.5rem;
		accent-color: var(--lavender);
	}

	.show-password {
		position: absolute;
		top: 2.3rem;
		right: 0.5rem;
	}

	.become-author {
		padding: 0.25rem 2rem 0.25rem 2rem;
		font-size: 0.85rem;
		border-radius: 100vmax;
		margin-top: 0.5rem;
		transition: scale 0.2s;
		box-shadow: 0px 0px 0.5rem black;

		&.unrequest {
			background: linear-gradient(to bottom right, var(--peach), var(--red));
		}

		&.request {
			background: linear-gradient(to bottom right, var(--lavender), var(--blue));
		}

		&:hover {
			scale: 105%;
		}
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;

		span:not(.error) {
			color: var(--overlay-1);
			font-size: 0.85rem;
		}
	}

	.error {
		color: var(--red);
		font-size: 0.85rem;
		width: 100%;
	}

	.errors {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
	}

	.popup {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;

		p {
			color: var(--overlay-1);
			font-size: 0.85rem;
			text-align: center;

			span {
				color: var(--subtext-1);
			}
		}

		.buttons {
			display: flex;
			justify-content: space-between;
			width: 100%;

			.cancel {
				background: linear-gradient(to bottom right, var(--peach), var(--red));
			}

			.delete {
				&:not([disabled]) {
					background: linear-gradient(to bottom right, var(--pink), var(--red));
				}

				&[disabled] {
					background-color: var(--crust);
					color: var(--surface-2);
					box-shadow: none;
					scale: 100%;
					cursor: default;
				}
			}

			.submit {
				&:not([disabled]) {
					background: linear-gradient(to bottom right, var(--lavender), var(--blue));
				}

				&[disabled] {
					background-color: var(--crust);
					color: var(--surface-2);
					box-shadow: none;
					scale: 100%;
					cursor: default;
				}
			}

			button {
				padding: 0.25rem 2rem 0.25rem 2rem;
				font-size: 0.85rem;
				border-radius: 100vmax;
				margin-top: 0.5rem;
				transition: scale 0.2s;
				box-shadow: 0px 0px 0.5rem black;

				&:hover {
					scale: 105%;
				}
			}
		}

		.title {
			color: var(--subtext-1);
			font-size: 1.2rem;
			text-align: center;
		}

		input[type="text"],
		input[type="password"] {
			background: var(--crust);
			color: var(--subtext-1);
			padding: 0.5rem;
			border-radius: 0.5rem;
			width: 15rem;
			border: 1px solid var(--surface-0);

			&::placeholder {
				color: var(--surface-2);
			}
		}
	}

	.listing {
		text-decoration: none;
		font-size: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		padding-left: 2rem;
		text-align: left;

		&.first {
			margin-top: 3.5rem;
			padding-top: 1.5rem;
		}

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

			span {
				color: var(--subtext-1);
			}
		}

		&:hover {
			background: rgba(150, 150, 255, 10%);
		}
	}
</style>

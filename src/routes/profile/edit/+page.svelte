<script lang="ts">
	import { goto } from "$app/navigation";
	import { getBook, type Book } from "../../../api/bookapi";
	import { getFile, type FileId } from "../../../api/storageapi";
	import { awaitUser, usernameErrors, updateUser, user, usernameIsTaken } from "../../../api/userapi.svelte";
	import AuthorIcon from "../../../components/icons/AuthorIcon.svelte";
	import DeveloperIcon from "../../../components/icons/DeveloperIcon.svelte";
	import EditIcon from "../../../components/icons/EditIcon.svelte";
	import SproutIcon from "../../../components/icons/SproutIcon.svelte";
	import WrenchIcon from "../../../components/icons/WrenchIcon.svelte";
	import BackButton from "../../../components/util/BackButton.svelte";
	import BookSearch from "../../../components/book/BookSearch.svelte";
	import CharacterLimitMeter from "../../../components/util/CharacterLimitMeter.svelte";
	import ImagePicker from "../../../components/util/ImagePicker.svelte";
	import LeavePagePopup from "../../../components/LeavePagePopup.svelte";
	import Page from "../../../components/layout/Page.svelte";
	import RadioInput from "../../../components/util/RadioInput.svelte";

	awaitUser.then(user => {
		displayName = user.displayName;
		username = user.username;
		bio = user.bio;
		pronouns = user.pronouns;
		picture = user.picture;
		banner = user.banner;
	});

	let displayName = $state("");
	let banner: FileId = $state("" as FileId);
	let username = $state("");
	let bio = $state("");
	let pronouns = $state("");
	let picture: FileId = $state("" as FileId)

	let popup: LeavePagePopup;

	let chosenCurrentBooks: Book[] = $state([]);

	(async() => {
		chosenCurrentBooks = user()!.currentBook ? [await getBook(user()!.currentBook!)] : [];
	})();

	let changedCurrentBook = $derived.by(() => {
		if (!user()!.currentBook) return chosenCurrentBooks.length !== 0;
		if (chosenCurrentBooks.length === 0) return true;
		return chosenCurrentBooks[0].isbn === user()!.currentBook;
	});

	async function resetCurrentBook() {
		if (!user()!.currentBook) chosenCurrentBooks = [];
		else chosenCurrentBooks = [await getBook(user()!.currentBook!)];
	}

	let saved = $state(false);

	let unsavedChanges = $derived.by(() => {
		if (!user() || saved) return false;

		if (displayName !== user()!.displayName) return true;
		if (banner !== user()!.banner) return true;
		if (bio !== user()!.bio) return true;
		if (pronouns !== user()!.pronouns) return true;
		if (picture !== user()!.picture) return true;
		if (changedCurrentBook) return true;

		return false;
	});

	let displayNameErrorList = $derived([
		...(displayName ? [] : ["Display name can't be empty"])
	]);

	let usernameErrorList = $derived([
		...usernameErrors(username),
		...(username ? [] : ["Username can't be empty"])
	]);

	let usernameTaken = $state(false);

	function onInput() {
		usernameTaken = false;
	}

	let canSave = $derived(
		unsavedChanges && 
		displayNameErrorList.length === 0 && 
		usernameErrorList.length === 0 && 
		!usernameTaken
	);

	async function update() {
		if (usernameErrorList.length > 0) {
			return;
		}

		if (username !== (await awaitUser).username && (await usernameIsTaken(username))) {
			usernameTaken = true;
			return;
		}

		await updateUser({ 
			displayName,
			bio,
			username,
			pronouns,
			picture,
			banner,
			currentBook: chosenCurrentBooks.length === 0 ? null : chosenCurrentBooks[0].isbn
		});
		saved = true;
		await goto("/profile");
		location.reload();
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === "s" && event.ctrlKey) {
			event.preventDefault();
			update();
		}
	}

	async function cancel() {
		if (!unsavedChanges || await popup.leaveWithoutSaving()) {
			goto("/profile");
		}
	}

</script>

<Page type="profile" {onkeydown}>
	<BackButton style="position: absolute; top: 0.5rem; left: 0.5rem;"/>
	{#await awaitUser then currentUser}
		<!-- Banner -->
		{#await getFile(banner) then bnr}
			<label for="set-banner" class="banner" style:background-image="url('{bnr}')">
				<div class="overlay"></div>
				<EditIcon
					stroke="#CCCCFF"
					style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 3rem; height: 3rem; z-index: 4;"
				/>
			</label>
		{/await}
		<ImagePicker circular id="set-banner" bind:imageId={banner} aspectRatio={3 / 1} />

		<div class="profile">
			<div>
				<!-- Profile Picture -->
				{#await getFile(picture) then pfp}
					<label for="set-profile-picture" class="profile-picture" style:background-image="url('{pfp}')">
						<div class="overlay"></div>
						<EditIcon
							stroke="#CCCCFF"
							style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 2rem; height: 2rem; z-index: 4;"
						/>
					</label>
				{/await}
				<ImagePicker id="set-profile-picture" bind:imageId={picture} aspectRatio={1 / 1} circular />

				<div class="saves">
					<button class="cancel save" onclick={cancel}>Cancel</button>
					<button disabled={!canSave} class="save" onclick={update}>Save</button>
				</div>
			</div>

			<label for="display-name">Display Name</label>
			<div class="text-container">
				<input 
					maxlength="20" 
					enterkeyhint="done" 
					type="text" 
					id="display-name" 
					bind:value={displayName} 
					style:outline={displayNameErrorList.length > 0 ? "2px solid var(--red)" : "none"}
				/>
				<CharacterLimitMeter size={0.7} limit={20} bind:text={displayName} />
			</div>
			{#each displayNameErrorList as displayNameError}
				<span class="error">{displayNameError}</span>
			{/each}

			<label for="username">Username</label>
			<div
				style:outline={usernameTaken || usernameErrorList.length > 0 ? "2px solid var(--red)" : "none"}
				class="username" 
			>
				<span class="at">@</span>
				<input
					maxlength="20"
					type="text"
					id="username"
					enterkeyhint="done"
					oninput={onInput}
					bind:value={username}
				/>
				<CharacterLimitMeter size={0.7} limit={20} bind:text={username} />
			</div>
			{#each usernameErrorList as usernameError}
				<span class="error">{usernameError}</span>
			{/each}
			{#if usernameTaken}
				<span class="error">Username already taken</span>
			{/if}

			<!-- Pronouns -->

			<hr />

			<label for="pronouns">Pronouns</label>
			<div class="text-container">
				<input maxlength="20" enterkeyhint="done" type="text" id="pronouns" bind:value={pronouns} />
				<CharacterLimitMeter size={0.7} limit={20} bind:text={pronouns} />
			</div>

			<span class="radio-input">
				<label for="display-pronouns">Display pronouns on your profile</label>
				<RadioInput 
					id="display-pronouns" 
					size={0.6} 
					bind:value={
						() => currentUser.showPronounsOnProfile,
						(value) => updateUser({ showPronounsOnProfile: value })
					}
				/>
			</span>

			<span class="radio-input">
				<label for="display-post-pronouns">Display pronouns on your posts</label>
				<RadioInput 
					id="display-post-pronouns" 
					size={0.6} 
					bind:value={
						() => currentUser.showPronounsOnPosts,
						(value) => updateUser({ showPronounsOnPosts: value })
					}
				/>
			</span>

			<!-- Bio -->

			<hr />

			<label for="bio">Bio</label>
			<div>
				<textarea maxlength="144" enterkeyhint="done" class="bio" id="bio" bind:value={bio}>
					{currentUser.bio}
				</textarea>
				<CharacterLimitMeter limit={144} bind:text={bio} />
			</div>

			<hr />

			<div class="book-search">
				<BookSearch
					title="Currently Reading"
					types={["search", "list"]} 
					bind:books={chosenCurrentBooks} 
				/>
				<button
					class="reset-current-book" 
					disabled={!changedCurrentBook}
					onclick={resetCurrentBook}
				>
					Reset
				</button>
			</div>

			<hr />

			<span class="badge-title">Badges</span>
			{#if currentUser.tags.includes("dev")}
				<span class="badge-line">
					<div class="developer badge">
						<DeveloperIcon stroke="var(--crust)" style="width: 1rem; height: 1rem;" />
					</div>
					Show developer badge
					<RadioInput 
						size={0.6}
						bind:value={
							() => currentUser.showDeveloperBadge,
							(value) => updateUser({ showDeveloperBadge: value })
						}
					/>
				</span>
			{/if}
			{#if currentUser.tags.includes("mod")}
				<span class="badge-line">
					<div class="moderator badge">
						<WrenchIcon stroke="var(--crust)" style="width: 1rem; height: 1rem;" />
					</div>
					Show moderator badge
					<RadioInput 
						size={0.6}
						bind:value={
							() => currentUser.showModeratorBadge,
							(value) => updateUser({ showModeratorBadge: value })
						}
					/>
				</span>
			{/if}
			{#if currentUser.tags.includes("author")}
				<span class="badge-line">
					<div class="author badge">
						<AuthorIcon stroke="var(--crust)" style="width: 1rem; height: 1rem;" />
					</div>
					Show author badge
					<RadioInput 
						size={0.6}
						bind:value={
							() => currentUser.showAuthorBadge,
							(value) => updateUser({ showAuthorBadge: value })
						}
					/>
				</span>
			{/if}
			{#if Date.now() - currentUser.birthmoment < 1000 * 60 * 60 * 24 * 7}
				<span class="badge-line">
					<div class="newbie badge">
						<SproutIcon stroke="var(--crust)" style="width: 1rem; height: 1rem;" />
					</div>
					Show newbie badge
					<RadioInput 
						size={0.6}
						bind:value={
							() => currentUser.showNewbieBadge,
							(value) => updateUser({ showNewbieBadge: value })
						}
					/>
				</span>
			{/if}
		</div>
	{/await}

	<div class="saves bottom">
		<button class="cancel save" onclick={cancel}>Cancel</button>
		<button disabled={!canSave} class="save" onclick={update}>Save</button>
	</div>
</Page>

<LeavePagePopup bind:this={popup} />

<style>
	.book-search {
		padding-left: 2rem;
		padding-right: 2rem;
	}

	.reset-current-book {
		margin-top: 1rem;
		padding: 0.25rem 2rem 0.25rem 2rem;
		border-radius: 100vmax;
		font-size: 0.85rem;
		transition: scale 0.1s;

		&[disabled] {
			color: var(--surface-2);
			background: var(--crust);
		}

		&:not([disabled]) {
			background-image: linear-gradient(to bottom right, var(--pink), var(--red));
			color: var(--crust);
			box-shadow: 0px 0px 0.5rem var(--box-shadow);
			
			&:hover {
				scale: 105%;
			}
		}
	}

	.username {
		width: calc(100% - 4rem);
		display: flex;
		align-items: center;
		margin-left: 2rem;
		padding-left: 0.5rem;
		border-radius: 0.5rem;
		margin-right: 2rem;
		background-color: var(--crust);
		position: relative;
	}

	.badge-title {
		margin-left: 2rem;
		color: var(--overlay-1);
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.badge-line {
		display :flex;
		margin-left: 2rem;
		align-items: center;
		margin-right: 2rem;
		font-size: 0.85rem;
		gap: 0.75rem;

		:global(> *:last-child) {
			margin-left: auto;
		}
	}

	.badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.5rem;

		&.developer {
			background-image: linear-gradient(to bottom right, var(--green), var(--teal));
		}

		&.moderator {
			background-image: linear-gradient(to bottom right, var(--pink), var(--lavender));
		}

		&.newbie {
			background-image: linear-gradient(to bottom right, var(--yellow), var(--green));
		}

		&.author {
			background-image: linear-gradient(to bottom right, var(--peach), var(--red));
		}
	}

	span {
		color: var(--overlay-1);
	}

	textarea {
		font-size: 0.85rem;
		width: 100%;
	}

	div:has(> textarea), .text-container {
		width: calc(100% - 4rem);
		display: flex;
		flex-direction: column;
		position: relative;
		padding: 0px;
		margin-right: 2rem;
		margin-left: 2rem;

		input {
			margin: 0px;
		}
	}

	.at {
		font-size: 0.85rem;
		height: 100%;
		color: var(--subtext-1);
	}

	hr {
		height: 1px;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		background-color: var(--surface-0);
	}

	.radio-input {
		display: flex;
		justify-content: space-between;
		padding-right: 2rem;
	}

	.banner {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 1;
		background-size: cover;
		background-position: center;
		position: relative;
	}

	.error {
		font-size: 0.85rem;
		color: var(--red);
		margin-left: 2rem;
		margin-right: 2rem;
	}

	input, textarea {
		background: var(--crust);
		color: var(--subtext-1);
	}

	.saves {
		display: flex;
		padding-right: 1rem;
		width: 100%;
		gap: 1rem;

		&:not(.bottom) {
			margin-top: -1.5rem;

			> *:first-child {
				margin-left: auto;
			}
		}

		&.bottom {
			justify-content: center;
			margin-bottom: 2rem;
			margin-top: 1rem;
		}
	}

	.save {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 100vmax;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 7rem;
		transition: scale 0.1s;
		text-decoration: none;

		&:hover {
			scale: 105%;
		}

		&.cancel {
			background: linear-gradient(to bottom right, var(--peach), var(--red));
		}

		&:not([disabled], .cancel) {
			background: linear-gradient(to bottom right, var(--lavender), var(--blue));
			box-shadow: 0px 0px 0.5rem black;
		}

		&[disabled] {
			background-color: var(--crust);
			color: var(--surface-2);
			box-shadow: none;
			scale: 100%;
			cursor: default;
		}
	}


	label:not(.banner),
	.profile-picture {
		margin-left: 2rem;
		font-size: 0.85rem;
	}

	input {
		margin-right: 2rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	label {
		color: var(--overlay-1);
	}

	.bio {
		margin-right: 2rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		height: 10rem;
		resize: none;
	}

	.profile {
		padding-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
	}

	.overlay {
		background-color: rgba(0, 0, 0, 0.7);
		width: 100%;
		height: 100%;
	}

	.profile-picture {
		border-radius: 50%;
		border: 0.5rem solid var(--base);
		width: 5rem;
		height: 5rem;
		z-index: 2;
		background-size: cover;
		margin-top: -2.5rem;
		background-position: center;
		overflow: hidden;
		position: relative;
		display: block;
	}
</style>

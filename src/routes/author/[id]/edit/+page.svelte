<script lang="ts">
	import { goto } from "$app/navigation";
	import { updateAuthor } from "../../../../api/authorapi";
	import { getFile } from "../../../../api/storageapi";
	import Page from "../../../../components/layout/Page.svelte";
	import ImagePicker from "../../../../components/util/ImagePicker.svelte";

	let { data } = $props();
	let author = $derived(data.author);

	// svelte-ignore state_referenced_locally
	let bio = $state(author.bio);
	// svelte-ignore state_referenced_locally
	let name = $state(author.name);
	// svelte-ignore state_referenced_locally
	let birthday = $state(author.birthday);
	// svelte-ignore state_referenced_locally
	let picture = $state(author.picture);

	let canSave = $derived(
		bio !== author.bio || name !== author.name || birthday !== author.birthday || picture !== author.picture,
	);

	async function update() {
		await updateAuthor(author, { bio, name, birthday, picture });
		goto(`/author/${author.id}`);
	}
</script>

<Page type="search" header="Edit Author">
	<div class="info">
		<h2>{author.name}</h2>

		<hr />

		<div class="section">
			<span>
				This page is available to wallflower.land moderators only. Note that changes you make to this author's
				details here will update <b>globally for everyone</b>
				. This is a moderator tool meant for fixing issues in the author details fetched from the Google or OpenLibrary
				APIs.
				<b>Use carefully</b>
				.
			</span>
		</div>

		<hr />

		<div class="section">
			<span>Name</span>
			<input type="text" bind:value={name} />
		</div>

		<hr />

		<div class="picture section">
			<span>Cover</span>
			<label for="choose-book-cover">
				{#if picture}
					{#await getFile(picture) then file}
						<img src={file ?? picture} alt={author.name} />
					{/await}
				{:else}
					<span>No picture</span>
				{/if}
			</label>
			<ImagePicker onupload={imageId => (picture = imageId)} id="choose-book-cover" aspectRatio={1 / 1.5} />
		</div>

		<hr />

		<div class="section">
			<span>Bio</span>
			<textarea class="description" bind:value={bio}></textarea>
		</div>

		<hr />

		<div class="section">
			<span>Birthday</span>
			<input type="text" bind:value={birthday} />
		</div>

		<div class="saves bottom">
			<a class="cancel save" href="/author/{author.id}">Cancel</a>
			<button disabled={!canSave} class="save" onclick={update}>Save</button>
		</div>
	</div>
</Page>

<style>
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
			margin-top: 1.5rem;
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

	.info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 3rem;
	}

	hr {
		height: 1px;
		width: 100%;
		background-color: var(--surface-0);
	}

	.description {
		padding: 0.5rem;
		font-size: 0.85rem;
		white-space: pre-wrap;
		color: var(--subtext-1);
		background-color: var(--crust);
		width: 100%;
		height: 10rem;
		resize: none;
		border-radius: 0.5rem;
		overflow-y: auto;
	}

	.section {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 1rem;
		gap: 0.5rem;

		span {
			color: var(--overlay-1);
			font-size: 0.85rem;
		}

		input {
			width: 100%;
			background-color: var(--crust);
			border-radius: 0.5rem;
			font-size: 0.85rem;
			padding: 0.5rem;
			color: var(--subtext-1);
		}

		&.picture {
			color: var(--overlay-1);
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			height: fit-content;

			img {
				height: 4rem;
				border-radius: 0.25rem;
			}
		}
	}

	h2 {
		color: var(--subtext-1);
		margin-top: 1.25rem;
		margin-bottom: 1rem;
		font-size: 1rem;
	}
</style>

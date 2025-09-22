<script lang="ts">
	import { goto } from "$app/navigation";
	import { format, post, type PostType } from "../../../api/postapi";
	import Page from "../../../components/layout/Page.svelte";
	import { type Book } from "../../../api/bookapi";
	import Select from "../../../components/util/Select.svelte";
	import EyeIcon from "../../../components/icons/EyeIcon.svelte";
	import CharacterLimitMeter from "../../../components/util/CharacterLimitMeter.svelte";
	import { updateUser, user } from "../../../api/userapi.svelte";
	import BookSearch from "../../../components/book/BookSearch.svelte";
	import ImagePicker from "../../../components/util/ImagePicker.svelte";
	import ImageCarousel from "../../../components/util/ImageCarousel.svelte";
	import type { FileId } from "../../../api/storageapi";

	let { data }: { data: { type: PostType } } = $props();
	let type = $derived(data.type);

	let bodyName = $derived(
		{
			general: "Post Body",
			rating: "Review (Optional)",
			update: "Comments (Optional)",
			reply: null!,
		}[type],
	);

	let body: string = $state("");
	let rating: string | null = $state(null);
	let updateType = $state("start");
	let chosenBooks: Book[] = $state([]);

	async function uploadPost() {
		if (!canPost) return;

		const chosenIsbns = chosenBooks.map(book => book.isbn);

		let object = { type, body, books: chosenIsbns };
		if (rating !== null) object = Object.assign(object, { rating: Number(rating) });
		if (type === "update") object = Object.assign(object, { updateType });

		const promises: Promise<unknown>[] = [post(object)];

		if (markAsFinished && user()!.currentlyReading.some(isbn => chosenIsbns.includes(isbn))) {
			const newCurrentlyReading = user()!.currentlyReading.filter(isbn => !chosenIsbns.includes(isbn));
			promises.push(updateUser({ currentlyReading: newCurrentlyReading }));
		}

		await Promise.all(promises);

		goto("/profile");
	}

	let showPreview = $state(false);

	let canPost = $derived(
		(type === "general" && /\S/.test(body)) ||
			(type === "rating" && chosenBooks.length > 0) ||
			(type === "update" && chosenBooks.length > 0) ||
			(type === "rating" && chosenBooks.length > 0 && rating && /^\d(\.\d)?$/.test(rating)),
	);

	let markAsFinished = $state(true);

	let images: FileId[] = $state([]);
</script>

<Page header="New {type} Post">
	<div class="new-post-page">
		{#if type === "rating"}
			<BookSearch title="Choose a book to rate" bind:books={chosenBooks} />

			<div class="section">
				<h2>Rating</h2>
				<input bind:value={rating} enterkeyhint="done" />
			</div>

			<div class="section">
				<h2>Mark as finished?</h2>
				<button
					class={["mark-as-finished", markAsFinished && "finished"]}
					onclick={() => (markAsFinished = !markAsFinished)}
				>
					{markAsFinished ? "Yes" : "No"}
				</button>
			</div>
		{:else if type === "update"}
			<h2 class="body-name">Update Type</h2>
			<Select options={["start", "finish", "abandon"]} bind:value={updateType} style="margin-bottom: 1rem;" />

			<BookSearch title="Choose a book" bind:books={chosenBooks} />
		{/if}

		<div class="section">
			<div class="body-header">
				<h2 class="body-name preview-body">{bodyName}</h2>
				{#if body}
					<button onclick={() => (showPreview = !showPreview)}>
						<EyeIcon
							stroke={showPreview ? "var(--lavender)" : "var(--overlay-1)"}
							style="width: 1rem; height: 1rem;"
						/>
					</button>
				{/if}
			</div>

			{#if showPreview}
				{#await format(body) then body}
					<div class="preview">{@html body}</div>
				{/await}
			{:else}
				<div class="text-container">
					<textarea maxlength="144" id="body" bind:value={body} enterkeyhint="done"></textarea>
					<CharacterLimitMeter limit={144} bind:text={body} />
				</div>
			{/if}
		</div>

		{#if type !== "rating" && type !== "update"}
			<BookSearch title="Add a book (Optional)" bind:books={chosenBooks} />
		{/if}

		<ImagePicker
			id="add-post-images"
			onupload={imageId => images.push(imageId)}
			aspectRatio={1}
			disabled={images.length >= 10}
		/>
		<ImageCarousel bind:images editable style="box-shadow: 0px 0px 0.5rem black;" />

		<label class={["add-image", images.length >= 10 && "disabled"]} for="add-post-images">Add Images</label>

		<button onclick={uploadPost} class="post-button" disabled={!canPost}>Post</button>
	</div>
</Page>

<style>
	input,
	textarea,
	.preview {
		background-color: var(--crust);
		color: var(--subtext-1);
		border: 1px solid var(--surface-0);
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.add-image {
		padding: 0.5rem;
		border-radius: 0.5rem;
		box-shadow: 0px 0px 0.5rem var(--box-shadow);
		transition: scale 0.1s;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		justify-content: center;

		&.disabled {
			background-color: var(--surface-0);
			color: var(--overlay-0);
		}

		&:not(.disabled) {
			background-image: linear-gradient(to bottom right, var(--lavender), var(--blue));

			&:hover {
				scale: 105%;
			}
		}
	}

	.body-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}

	.body-name:not(.preview-body) {
		margin-top: 1rem;
	}

	.text-container {
		position: relative;
	}

	.mark-as-finished {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 0.5rem;
		box-shadow: 0px 0px 0.5rem var(--box-shadow);
		transition: scale 0.1s;

		&:hover {
			scale: 105%;
		}

		&:not(.finished) {
			background-image: linear-gradient(to bottom right, var(--pink), var(--red));
		}

		&.finished {
			background-image: linear-gradient(to bottom right, var(--green), var(--teal));
		}
	}

	.post-button {
		width: fit-content;
		padding-left: 4rem;
		padding-right: 4rem;
		font-size: 0.85rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		border-radius: 100vmax;
		margin-left: auto;
		margin-right: auto;
		margin-top: 0.5rem;
		transition: scale 0.1s;

		&:not([disabled]) {
			background-image: linear-gradient(to bottom right, var(--lavender), var(--blue));
			box-shadow: 0px 0px 0.5rem var(--box-shadow);

			&:hover {
				scale: 105%;
			}
		}

		&[disabled] {
			background: var(--crust);
			color: var(--surface-2);
		}
	}

	#body {
		padding: 0.5rem;
	}

	.new-post-page {
		padding-top: 4rem;
		padding-left: 2rem;
		padding-right: 2rem;
		padding-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	textarea,
	.preview {
		border-radius: 0.75rem;
		width: 100%;
		height: 10rem;
		font-size: 0.85rem;
		padding: 0.5rem;
		resize: none;
		flex-shrink: 0;

		:global(a) {
			color: #89b4fa;
		}
	}

	h2 {
		font-weight: normal;
		font-size: 0.85rem;
		color: var(--overlay-1);
	}
</style>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { getFile, type FileId } from "../../api/storageapi";
	import TrashIcon from "../icons/TrashIcon.svelte";
	import TriangleLeftIcon from "../icons/TriangleLeftIcon.svelte";
	import TriangleRightIcon from "../icons/TriangleRightIcon.svelte";
	import ClickableImage from "./ClickableImage.svelte";

	let {
		images = $bindable(),
		clickable = true,
		editable = false,
		...rest
	}: {
		images: FileId[];
		clickable?: boolean;
		editable?: boolean;
	} & HTMLAttributes<HTMLDivElement> = $props();

	let imageIndex = $state(0);
	function cycleImage(amount: number) {
		return async () => (imageIndex = Math.max(Math.min(imageIndex + amount, images.length - 1), 0));
	}

	function deleteCurrentImage() {
		images = images.filter((_image, index) => imageIndex !== index);
	}
</script>

{#if images.length > 0}
	<div class="media" {...rest}>
		{#if editable}
			<button class="delete" onclick={deleteCurrentImage}>
				<TrashIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
			</button>
		{/if}
		<div class="images" style:margin-left="{-imageIndex * 100}%">
			{#each images as image}
				{#await getFile(image)}
					<div class="media-wrapper" style:background-color="var(--surface-0)"></div>
				{:then image}
					<ClickableImage {clickable} src={image!}>
						<div class="media-wrapper" style:background-image="url('{image}')"></div>
					</ClickableImage>
				{/await}
			{/each}
		</div>
		{#if images.length > 1}
			<button onclick={cycleImage(-1)} class="rotate-image left">
				<TriangleLeftIcon stroke="#FFFFFF" style="width: 1.5rem;" />
			</button>
			<button onclick={cycleImage(1)} class="rotate-image right">
				<TriangleRightIcon stroke="#FFFFFF" style="width: 1.5rem;" />
			</button>
		{/if}
	</div>
{/if}

<style>
	.delete {
		background-color: var(--crust);
		padding: 0.5rem;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--surface-0);
	}

	.media {
		margin-top: 1rem;
		aspect-ratio: 1.5;
		overflow: hidden;
		position: relative;
		margin-bottom: 1rem;
		max-width: 20rem;
		border-radius: 1rem;

		&:hover :global(.rotate-image) {
			opacity: 100%;
		}

		.rotate-image {
			color: red;
			position: absolute;
			top: 50%;
			width: fit-content;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2rem;
			font-weight: bolder;
			opacity: 0%;
			transition: opacity 0.2s;

			&.right {
				right: 0.5rem;
			}

			&.left {
				left: 0.5rem;
			}

			&::before {
				content: "";
				width: 100%;
				aspect-ratio: 1;
				background-color: rgba(0, 0, 0, 0.5);
				position: absolute;
				z-index: -1;
				border-radius: 50%;
				filter: blur(0.3rem);
			}
		}
	}

	.images {
		display: flex;
		width: fit-content;
		height: 100%;
		width: 100%;
		transition: margin-left 0.3s;

		.media-wrapper {
			height: 100%;
			aspect-ratio: 1.5;
			display: flex;
			align-items: center;
			justify-content: center;
			background-size: cover;
			background-position: center;
		}
	}
</style>

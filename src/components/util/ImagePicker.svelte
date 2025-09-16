<script lang="ts">
	import { onMount } from "svelte";
	import { uploadFile } from "../../api/storageapi";

	let files: FileList = $state(new DataTransfer().files);
	let preview: HTMLImageElement;
	let previewDiv: HTMLElement;
	let input: HTMLInputElement;

	let { 
		aspectRatio = undefined, 
		onupload = (_imageId: string) => {}, 
		imageId = $bindable(null),
		circular = false,
		allowEdit = true,
		...rest 
	}: {
		aspectRatio?: number;
		onupload?: (imageId: string) => void;
		imageId?: string | null;
		circular?: boolean;
		allowEdit?: boolean;
		[key: string]: unknown
	} = $props();

	let scale = $state(1);

	async function upload() {
		if (!file) return;
		const cropped = await crop();
		imageId = (await uploadFile(cropped))!;
		onupload(imageId);
		reset();
	}

	function reset() {
		files = new DataTransfer().files;
		file = null;
		previewDiv.style.display = "none";
	}

	function cancel() {
		reset();
	}

	function chooseAgain() {
		input.click();
	}

	let file: File | null = $state(null);
	
	async function openImage() {
		if (!allowEdit) {
			const chosen = files?.[0] ?? null;
			if (!chosen) return;
			imageId = (await uploadFile(chosen))!;
			onupload(imageId);
			reset();
		}

		file = files?.[0] ?? null;
		if (!file) return;

		const reader = new FileReader();

		reader.onloadend = function() {
			previewDiv.style.display = "flex";
			preview.src = reader.result as string;

			const imageAspectRatio = preview.naturalWidth / preview.naturalHeight;

			if (imageAspectRatio > 1) {
				imageWidth = imageContainer!.getBoundingClientRect().width;
				imageHeight = imageWidth * (1 / imageAspectRatio);
				imageTop = (imageContainer!.getBoundingClientRect().height - imageHeight) / 2;
				scale = imageContainer!.getBoundingClientRect().height / imageHeight;
			} else {
				imageHeight = imageContainer!.getBoundingClientRect().height;
				imageWidth = imageHeight * imageAspectRatio;
				imageLeft = (imageContainer!.getBoundingClientRect().width - imageWidth) / 2;
				scale = imageContainer!.getBoundingClientRect().width / imageWidth;
			}

			if (aspectRatio) {
				if (aspectRatio < 1) {
					cropperLeft = (imageContainer!.getBoundingClientRect().width - (imageContainer!.getBoundingClientRect().height * aspectRatio)) / 2;
					cropperRight = cropperLeft;
				} else {
					cropperTop = (imageContainer!.getBoundingClientRect().height - (imageContainer!.getBoundingClientRect().width / aspectRatio)) / 2;
					cropperBottom = cropperTop;
				}
			}
		}

		if (file) {
			reader.readAsDataURL(file)
		} else {
			preview.src =  "";
		}
	}

	function cropAspectRatio() {
		return cropperWidth / cropperHeight;
	}

	/**
	 * Despite my atheistic views, I found myself praying to a higher
	 * power quite frequently while writing this function. I can't express
	 * what a PAIN IN MY GIRLDICK getting these values right was. I pray
	 * that you (and I) never have to touch this logic again.
	 */
	function crop(): Promise<File> {
		return new Promise<File>((resolve, reject) => {
			const image = new Image();
			image.onload = () => {
				const canvas = document.createElement("canvas")
				canvas.width = preview.getBoundingClientRect().width;
				canvas.height = canvas.width * (1 / cropAspectRatio());
				const ctx = canvas.getContext('2d')!;
				const factor = preview.naturalWidth / canvas.width;
				ctx.drawImage(
					image,
					factor * (cropperLeft - imageLeft),
					factor * (cropperTop - imageTop),
					factor * cropperWidth,
					factor * cropperHeight,
					0,
					0,
					canvas.width,
					canvas.height,
				);

				canvas.toBlob(blob => {
					if (!blob) return reject(new Error("Canvas is empty"));
					const croppedFile = new File([blob], file!.name, { type: file!.type });
					resolve(croppedFile);
				}, file!.type);
			};

			image.onerror = reject;

			const reader = new FileReader();
			reader.onload = function() {
				image.src = reader.result as string;
			};
			reader.onerror = reject;
			reader.readAsDataURL(file!);
		});
	}

	let cropper: HTMLElement;

	let panning = $state(false);
	let draggingHandle: Handle | null = $state(null);

	let imageLeft = $state(0);
	let imageTop = $state(0);
	let imageWidth = $state(0);
	let imageHeight = $state(0);

	let topLeftHandle: HTMLElement;
	let topRightHandle: HTMLElement;
	let bottomLeftHandle: HTMLElement;
	let bottomRightHandle: HTMLElement;

	let imageContainer: HTMLElement | null = $state(null);

	let cropperTop = $state(0);
	let cropperLeft = $state(0);
	let cropperBottom = $state(0);
	let cropperRight = $state(0);

	let minimumScale = $state(1);

	let cropperWidth = $derived.by(() => {
		cropperTop;
		cropperBottom;

		if (imageContainer) {
			return imageContainer.getBoundingClientRect().width - cropperLeft - cropperRight;
		}
		return 0;
	});

	let cropperHeight = $derived.by(() => {
		cropperTop;
		cropperBottom;

		if (imageContainer) {
			return imageContainer.getBoundingClientRect().height - cropperTop - cropperBottom;
		}
		return 0;
	});

	type Handle = "top left" | "top right" | "bottom left" | "bottom right";

	function setDraggingHandle(handle: Handle) {
		return function() {
			draggingHandle = handle;
		}
	}

	onMount(() => {
		cropper.addEventListener("wheel", event => {
			scale = Math.min(Math.max(minimumScale, scale - event.deltaY / 5), 10);
		}, true);

		document.addEventListener("mousemove", event => {
			if (draggingHandle == "top left") {
				const amount = Math.min(event.movementX, event.movementY);
				cropperLeft = Math.max(0, cropperLeft + amount);

				if (aspectRatio) {
					const desiredHeight = cropperWidth * (1 / aspectRatio);
					const delta = Math.abs(imageContainer!.getBoundingClientRect().height - desiredHeight - cropperBottom);
					cropperTop = delta;
				}
			} 

			else if (draggingHandle == "top right") {
				const amount = Math.min(Math.abs(event.movementX), Math.abs(event.movementY));
				cropperRight = Math.max(0, cropperRight - amount * Math.sign(event.movementX));

				if (aspectRatio) {
					const desiredHeight = cropperWidth * (1 / aspectRatio);
					const delta = Math.abs(imageContainer!.getBoundingClientRect().height - desiredHeight - cropperBottom);
					cropperTop = delta;
				}
			} 

			else if (draggingHandle == "bottom left") {
				const amount = Math.min(Math.abs(event.movementX), Math.abs(event.movementY));
				cropperLeft = Math.max(0, cropperLeft + amount * Math.sign(event.movementX));
				if (aspectRatio) {
					const desiredHeight = cropperWidth * (1 / aspectRatio);
					const delta = Math.abs(imageContainer!.getBoundingClientRect().height - desiredHeight - cropperTop);
					cropperBottom = delta;
				}
			}

			else if (draggingHandle == "bottom right") {
				const amount = Math.min(Math.abs(event.movementX), Math.abs(event.movementY));
				cropperRight = Math.max(0, cropperRight - amount * Math.sign(event.movementX));
				if (aspectRatio) {
					const desiredHeight = cropperWidth * (1 / aspectRatio);
					const delta = Math.abs(imageContainer!.getBoundingClientRect().height - desiredHeight - cropperTop);
					cropperBottom = delta;
				}
			}

			else if (panning) {
				let rawLeft = imageLeft + event.movementX;
				let rawTop = imageTop + event.movementY;
				imageLeft = Math.max(Math.min(cropperLeft, rawLeft), cropperLeft + cropperWidth - imageWidth * scale);
				imageTop = Math.max(Math.min(cropperTop, rawTop), cropperTop + cropperHeight - imageHeight * scale);
			}
		}, true); // me when true
	})

	function onmouseup() {
		panning = false;
		draggingHandle = null;
	}

	const overlayLeftHeight = $derived.by(() => {
		cropperLeft;
		cropperTop;
		if (imageContainer) {
			return imageContainer.getBoundingClientRect().height;
		}

		return 0;
	});

	const overlayBottomTop = $derived.by(() => {
		if (imageContainer) {
			return cropperTop + cropperHeight;
		}

		return 0;
	});
</script>

<svelte:document {onmouseup} />

<input {...rest} bind:this={input} bind:files onchange={openImage} type="file" />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="preview" bind:this={previewDiv} onmousedown={() => panning = true}>
	<div class="image" bind:this={imageContainer}>
		<img
			style:cursor={panning ? "grabbing" : "grab"}
			bind:this={preview}
			alt="User content"
			style:left="{imageLeft}px"
			style:top="{imageTop}px"
			style:width="{imageWidth * scale}px"
			style:height="{imageHeight * scale}px"
			draggable="false"
		/>
		<div class="overlay left" 
			style:width="{(imageContainer?.getBoundingClientRect().width ?? 0) - cropperWidth - cropperRight}px"
			style:height="{overlayLeftHeight}px"
		></div>
		<div class="overlay right" 
			style:width="{(imageContainer?.getBoundingClientRect().width ?? 0) - cropperWidth - cropperLeft}px"
			style:height="{overlayLeftHeight}px"
		></div>
		<div class="overlay top" 
			style:left="{cropperLeft}px"
			style:width="{cropperWidth}px"
			style:height="{(imageContainer?.getBoundingClientRect().height ?? 0) - cropperHeight - cropperBottom}px"
		></div>
		<div class="overlay bottom" 
			style:right="{cropperRight}px"
			style:width="{cropperWidth}px"
			style:height="{(imageContainer?.getBoundingClientRect().height ?? 0) - cropperHeight - cropperTop}px"
			style:top="{overlayBottomTop}px"
		></div>
		<div 
			style:width="{cropperWidth}px"
			style:height="{cropperHeight}px"
			style:top="{cropperTop}px"
			style:left="{cropperLeft}px"
			style:cursor={panning ? "grabbing" : "grab"}
			bind:this={cropper} 
			onmousedown={() => panning = true}
			class="cropper {circular ? "circular" : ""}"
		>
			<div
				bind:this={topLeftHandle} 
				onmousedown={setDraggingHandle("top left")} 
				class="top left handle"
			></div>
			<div
				bind:this={topRightHandle}
				onmousedown={setDraggingHandle("top right")}
				class="top right handle"
			></div>
			<div
				bind:this={bottomLeftHandle}
				onmousedown={setDraggingHandle("bottom left")}
				class="bottom left handle"
			></div>
			<div
				bind:this={bottomRightHandle}
				onmousedown={setDraggingHandle("bottom right")}
				class="bottom right handle"
			></div>
		</div>
	</div>
	<button class="upload" onclick={upload}>Done</button>
	<button class="choose-again" onclick={chooseAgain}>Choose a different image</button>
	<button class="cancel" onclick={cancel}>Cancel</button>
</div>

<style>
	input {
		display: none;
	}

	.preview {
		width: 90dvw;
		aspect-ratio: 5/4;
		position: fixed;
		display: none;
		flex-direction: column;
		z-index: 9999;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--crust);
		padding: 2rem;
		border-radius: 0.5rem;
		border: 1px solid var(--surface-0);
		box-shadow: 0px 0px 0.5rem black;
		gap: 2rem;

		.image {
			overflow: hidden;
			width: 100%;
			aspect-ratio: 1;
			display: flex;
			position: relative;
		}

		.upload {
			padding: 0.5rem 1rem 0.5rem 1rem;
			border-radius: 0.5rem;
			background-image: linear-gradient(to bottom right, var(--green), var(--teal));
			transition: scale 0.1s;
			box-shadow: 0px 0px 0.5rem var(--box-shadow);

			&:hover {
				scale: 105%;
			}
		}

		.cancel {
			padding: 0.5rem 1rem 0.5rem 1rem;
			border-radius: 0.5rem;
			background-image: linear-gradient(to bottom right, var(--peach), var(--red));
			margin-top: -1rem;
			transition: scale 0.1s;
			box-shadow: 0px 0px 0.5rem var(--box-shadow);

			&:hover {
				scale: 105%;
			}
		}

		.choose-again {
			padding: 0.5rem 1rem 0.5rem 1rem;
			border-radius: 0.5rem;
			background-image: linear-gradient(to bottom right, var(--lavender), var(--blue));
			margin-top: -1rem;
			transition: scale 0.1s;
			box-shadow: 0px 0px 0.5rem var(--box-shadow);

			&:hover {
				scale: 105%;
			}
		}

		img {
			position: absolute;
			user-select: none;
		}

		.cropper {
			top: 0px;
			left: 0px;
			position: absolute;

			&.circular::after {
				content: "";
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 97%;
				height: 97%;
				outline: 3px dashed white;
				pointer-events: none;
				border-radius: 50%;
			}

			.handle {
				position: absolute;
				width: 1rem;
				height: 1rem;
			}

			.bottom {
				bottom: -1px;
				border-bottom: 3px solid white;
			}

			.top {
				top: -1px;
				border-top: 3px solid white;
			}

			.left {
				left: -1px;
				border-left: 3px solid white;
			}

			.right {
				right: -1px;
				border-right: 3px solid white;
			}

			.top.left {
				cursor: nw-resize;
			}

			.top.right {
				cursor: ne-resize;
			}

			.bottom.left {
				cursor: sw-resize;
			}

			.bottom.right {
				cursor: se-resize;
			}
		}
	}

	.overlay {
		position: absolute;
		background: rgba(0, 0, 0, 65%);
		pointer-events: none;
	}

	.overlay.left {
		top: 0px;
		left: 0px;
	}

	.overlay.top {
		top: 0px;
	}

	.overlay.right {
		top: 0px;
		right: 0px;
	}
</style>

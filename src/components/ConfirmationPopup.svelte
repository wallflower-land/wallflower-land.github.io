<script lang="ts">
	import CloseIcon from "./icons/CloseIcon.svelte";
	import Popup from "./Popup.svelte";

	let {
		visible = $bindable(false),
		confirmText = "Confirm",
		cancelText = "Cancel",
		onconfirm = () => {},
		oncancel = () => {},
		title,
		body,
	}: {
		/** The title of the popup */
		title: string;
		/**
		 * The body text for the popup. This is rendered as raw HTML,
		 * so formatting is allowed (like <i>italics</i> or <b>bold</b>),
		 * but it also means you have to be careful not to use pass raw
		 * unsanitized user input into this (I don't know why you would
		 * anyway, but... don't).
		 */
		body: string;
		/** The text on the confirm (right) button of the popup. */
		confirmText?: string;
		/** The text on the cancel (left) button of the popup. */
		cancelText?: string;
		/** A hook to be called when the user presses confirm. */
		onconfirm?(): void;
		/** A hook to be called when the user presses cancel. */
		oncancel?(): void;
		/** Whether the popup is open (bindable). */
		visible?: boolean;
	} = $props();

	/**
	 * The resolve function from `didConfirm`. Resolved when the user
	 * cancels or confirms.
	 */
	let confirmResolve: (value: boolean) => void;

	/**
	 * Whether the user confirmed the popup. Pending until
	 * The user confirms or cancels.
	 */
	let didConfirm = new Promise<boolean>(resolve => {
		confirmResolve = resolve;
	});

	/** Opens the popup. */
	export function open() {
		visible = true;
	}

	/** Called when the user presses cancel. */
	function cancel() {
		visible = false;
		confirmResolve(false);
		oncancel();
	}

	/** Called when the user presses confirm. */
	function confirm() {
		visible = false;
		confirmResolve(true);
		onconfirm();
	}

	/**
	 * Opens the popup if it's not already, and returns a promise that
	 * resolves when the user closes the popup, with the contained value
	 * being whether the user confirmed.
	 */
	export async function confirmed(): Promise<boolean> {
		if (!visible) open();
		return didConfirm;
	}
</script>

<Popup bind:visible>
	<div class="popup">
		<h2 class="title">{title}</h2>
		<p>{@html body}</p>
		<div class="buttons">
			<button class="cancel" onclick={cancel}>{cancelText}</button>
			<button class="submit" onclick={confirm}>{confirmText}</button>
		</div>
		<button class="close" onclick={cancel}>
			<CloseIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
		</button>
	</div>
</Popup>

<style>
	/* The popup container */
	.popup {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;

		/* The popup body */
		p {
			color: var(--overlay-1);
			font-size: 0.85rem;
			text-align: center;
		}

		/* The button container */
		.buttons {
			display: flex;
			justify-content: space-between;
			width: 100%;

			/* The cancel and submit buttons */
			button {
				padding-top: 0.25rem;
				width: 6.5rem;
				padding-bottom: 0.25rem;
				font-size: 0.85rem;
				border-radius: 100vmax;
				margin-top: 0.5rem;
				transition: scale 0.2s;
				box-shadow: 0px 0px 0.5rem black;
				color: var(--crust);

				&:hover {
					scale: 105%;
				}

				/* The cancel button */
				&.cancel {
					background: linear-gradient(to bottom right, var(--peach), var(--red));
				}

				/* The submit button */
				&.submit {
					background: linear-gradient(to bottom right, var(--lavender), var(--blue));
				}
			}
		}

		/* The large text at the top of the popup */
		.title {
			color: var(--subtext-1);
			font-size: 1.2rem;
			text-align: center;
		}

		/* The close button in the upper right corner of the popup */
		.close {
			position: absolute;
			top: 1rem;
			right: 1rem;
		}
	}
</style>

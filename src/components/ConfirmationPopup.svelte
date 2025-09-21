<script lang="ts">
	import CloseIcon from "./icons/CloseIcon.svelte";
	import Popup from "./Popup.svelte";

	type State = "pending" | "confirmed" | "canceled" | "closed";

	let { 
		visible = $bindable(false),
		confirmText = "Confirm",
		cancelText = "Cancel",
		state = "closed",
		onconfirm = () => {},
		oncancel = () => {},
		title,
		body,
	}: { 
		title: string,
		body: string,
		confirmText?: string,
		onconfirm? (): void,
		oncancel? (): void,
		cancelText?: string,
		visible?: boolean,
		state?: State,
	} = $props();

	let confirmLeave: (value: boolean) => void = (_value => {});

	export function open() {
		visible = true;
		state = "pending";
	}

	function cancel() {
		visible = false;
		confirmLeave(false);
		state = "canceled";
		oncancel();
	}

	function confirm() {
		visible = false;
		confirmLeave(true);
		state = "confirmed";
		onconfirm();
	}

	export async function confirmed(): Promise<boolean> {
		open();
		return new Promise((resolve) => {
			confirmLeave = resolve;
		});
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
		<button class="close" onclick={() => visible = false}>
			<CloseIcon stroke="var(--red)" style="width: 1rem; height: 1rem;" />
		</button>
	</div>
</Popup>

<style>
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
		}

		.buttons {
			display: flex;
			justify-content: space-between;
			width: 100%;

			.cancel {
				background: linear-gradient(to bottom right, var(--peach), var(--red));
			}

			.submit {
				background: linear-gradient(to bottom right, var(--lavender), var(--blue));
			}

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
			}
		}

		.title {
			color: var(--subtext-1);
			font-size: 1.2rem;
			text-align: center;
		}
		
		.close {
			position: absolute;
			top: 1rem;
			right: 1rem;
		}
	}
</style>

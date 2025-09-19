<script lang="ts">
	import CloseIcon from "./icons/CloseIcon.svelte";
	import Popup from "./Popup.svelte";

	let { 
		visible = $bindable(false) 
	}: { 
		visible?: boolean 
	} = $props();

	let confirmLeave: (value: boolean) => void = (_value => {});

	function cancel() {
		visible = false;
		confirmLeave(false);
	}

	function confirm() {
		visible = false;
		confirmLeave(true);
	}

	export async function leaveWithoutSaving(): Promise<boolean> {
		visible = true;
		return new Promise((resolve) => {
			confirmLeave = resolve;
		});
	}
</script>

<Popup bind:visible>
	<div class="popup">
		<h2 class="title">Leave without saving?</h2>
		<p>If you choose to leave this page now, your changes will be lost.</p>
		<div class="buttons">
			<button class="cancel" onclick={cancel}>Cancel</button>
			<button class="submit" onclick={confirm}>Leave</button>
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
		
		.close {
			position: absolute;
			top: 1rem;
			right: 1rem;
		}
	}
</style>

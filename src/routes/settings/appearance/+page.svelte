<script lang="ts">
	import { setTheme } from "../../../api/themes.svelte";
	import { getPreference, setPreference } from "../../../api/userapi";
	import MoonIcon from "../../../components/icons/MoonIcon.svelte";
	import ScaleIcon from "../../../components/icons/ScaleIcon.svelte";
	import Header from "../../../components/elements/Header.svelte";
	import Page from "../../../components/layout/Page.svelte";
	import RadioInput from "../../../components/util/RadioInput.svelte";
	import Select from "../../../components/util/Select.svelte";
</script>

<Page class="settings">
	<Header title="Appearance" />

	<div class="content">
		<label for="preference-dark-mode">
			<div>
			<span>
				<MoonIcon stroke="var(--subtext-1)" style="width: 1.25rem; height: 1.25rem;" />
				Dark Mode
			</span>
				<RadioInput 
					bind:value={
						() => getPreference("darkMode"), 
						(value: any) => {
							setPreference("darkMode", value);
							if (value) setTheme("Catppuccin Mocha");
							else setTheme("Catppuccin Latte");
						}
					} 
					id="preference-dark-mode" 
					size={0.8} 
				/>
			</div>
			<p>Toggle between using a dark theme and a light theme for wallflower.land.</p>
		</label>
		<label for="preference-ui-scale">
			<div>
			<span>
				<ScaleIcon stroke="var(--subtext-1)" style="width: 1.25rem; height: 1.25rem;" />
				UI Scale
			</span>
				<Select 
					options={["50%", "66%", "75%", "100%", "125%", "133%", "150%", "166%", "175%", "200%"]} 
					bind:value={
						() => `${getPreference("uiScale") * 100}%`, 
						(value: string) => {
							const percent = parseInt(value) / 100;
							setPreference("uiScale", percent);
							document.documentElement.style.fontSize = `${16 * percent}px`;
						}
					}
					id="preference-ui-scale"
				/>
			</div>
			<p>Control how big elements in the user interface are.</p>
		</label>
	</div>
</Page>

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	label {
		display: flex;
		flex-direction: column;
		padding: 0.5rem 2rem 0.5rem 2rem;
		gap: 0.25rem;

		p {
			color: var(--surface-2);
			font-size: 0.85rem;
		}

		> div {
			display: flex;
			justify-content: space-between;
			align-items: center;

			span {
				color: var(--subtext-1);
				display: flex;
				align-items: center;
				gap: 1rem;
			}
		}

		&:hover {
			background: rgba(150, 150, 255, 10%);
		}

		&:first-of-type {
			margin-top: 3.5rem;
			padding-top: 1rem;
		}
	}
</style>

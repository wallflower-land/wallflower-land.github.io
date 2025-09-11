const themes = [
	{
		name: "Catppuccin Mocha",
		colors: {
			crust: "#11111b",
			mantle: "#181825",
			base: "#1e1e2e",
			text: "#cdd6f4",
			"overlay-1": "#7f84ac",
			"surface-2": "#585b80",
			"surface-0": "#313244",
			"subtext-1": "#bac2de",
			lavender: "#b4befe",
			blue: "#89b4fa",
			yellow: "#f9e2af",
			green: "#a6e3a1",
			red: "#f38ba8",
			peach: "#fab387",
			teal: "#94e2d5",
			pink: "#f5c2e7",
			mauve: "#cba6f7",
			"box-shadow": "black",
		},
	},
	{
		name: "Catppuccin Latte",
		colors: {
			crust: "#dce0e8",
			mantle: "#e6e9ef",
			base: "#eff1f5",
			text: "#4c4f69",
			"overlay-1": "#8c8fa1",
			"surface-2": "#acb0be",
			"surface-0": "#ccd0da",
			"subtext-1": "#5c5f77",
			lavender: "#7287fd",
			blue: "#1e66f5",
			yellow: "#df8e1d",
			green: "#40a02b",
			red: "#d20f39",
			peach: "#fe640b",
			teal: "#179299",
			pink: "#ea76cb",
			mauve: "#8839ef",
			"box-shadow": "transparent",
		},
	},
] as const satisfies {
	name: string;
	colors: {
		crust: string;
		mantle: string;
		text: string;
		base: string;
		"overlay-1": string;
		"surface-2": string;
		"surface-0": string;
		"subtext-1": string;
		lavender: string;
		blue: string;
		yellow: string;
		green: string;
		red: string;
		peach: string;
		teal: string;
		pink: string;
		mauve: string;
		"box-shadow": string;
	};
}[];

type ThemeName = typeof themes extends (infer T)[]
	? T extends { name: string }
		? T["name"]
		: never
	: never;

export function setTheme(name: ThemeName): void {
	const theme = themes.find(theme => theme.name === name)!;

	Array.from(document.querySelectorAll("*[data-theme]")).forEach(element => element.remove());

	let style = document.createElement("style");
	style.setAttribute("data-theme", name);
	style.innerHTML = `* { ${Object.entries(theme.colors)
		.map(([name, value]) => `--${name}: ${value};`)
		.join(" ")} }`;

	document.head.appendChild(style);
}

export function cssVar(name: string) {
	if (!name.startsWith("--")) name = `--${name}`;
	return window.getComputedStyle(document.body).getPropertyValue(name);
}

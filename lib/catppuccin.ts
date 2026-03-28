export type Flavor = "latte" | "frappe" | "macchiato" | "mocha";
export type SwatchKey =
	| "rosewater"
	| "flamingo"
	| "pink"
	| "mauve"
	| "red"
	| "maroon"
	| "peach"
	| "yellow"
	| "green"
	| "teal"
	| "sky"
	| "sapphire"
	| "blue"
	| "lavender";
export type FlavorPalette = Record<
	| SwatchKey
	| "text"
	| "subtext0"
	| "subtext1"
	| "overlay1"
	| "surface0"
	| "surface1"
	| "surface2"
	| "base"
	| "mantle"
	| "crust",
	string
>;

export const FLAVORS: Flavor[] = ["latte", "frappe", "macchiato", "mocha"];
export const SWATCH_KEYS: SwatchKey[] = [
	"rosewater",
	"flamingo",
	"pink",
	"mauve",
	"red",
	"maroon",
	"peach",
	"yellow",
	"green",
	"teal",
	"sky",
	"sapphire",
	"blue",
	"lavender",
];
export const FLAVOR_VARS: Record<Flavor, FlavorPalette> = {
	mocha: {
		rosewater: "#f5e0dc",
		flamingo: "#f2cdcd",
		pink: "#f5c2e7",
		mauve: "#cba6f7",
		red: "#f38ba8",
		maroon: "#eba0ac",
		peach: "#fab387",
		yellow: "#f9e2af",
		green: "#a6e3a1",
		teal: "#94e2d5",
		sky: "#89dceb",
		sapphire: "#74c7ec",
		blue: "#89b4fa",
		lavender: "#b4befe",
		text: "#cdd6f4",
		subtext1: "#bac2de",
		subtext0: "#a6adc8",
		overlay1: "#7f849c",
		surface0: "#313244",
		surface1: "#45475a",
		surface2: "#585b70",
		base: "#1e1e2e",
		mantle: "#181825",
		crust: "#11111b",
	},
	macchiato: {
		rosewater: "#f4dbd6",
		flamingo: "#f0c6c6",
		pink: "#f5bde6",
		mauve: "#c6a0f6",
		red: "#ed8796",
		maroon: "#ee99a0",
		peach: "#f5a97f",
		yellow: "#eed49f",
		green: "#a6da95",
		teal: "#8bd5ca",
		sky: "#91d7e3",
		sapphire: "#7dc4e4",
		blue: "#8aadf4",
		lavender: "#b7bdf8",
		text: "#cad3f5",
		subtext1: "#b8c0e0",
		subtext0: "#a5adcb",
		overlay1: "#8087a2",
		surface0: "#363a4f",
		surface1: "#494d64",
		surface2: "#5b6078",
		base: "#24273a",
		mantle: "#1e2030",
		crust: "#181926",
	},
	frappe: {
		rosewater: "#f2d5cf",
		flamingo: "#eebebe",
		pink: "#f4b8e4",
		mauve: "#ca9ee6",
		red: "#e78284",
		maroon: "#ea999c",
		peach: "#ef9f76",
		yellow: "#e5c890",
		green: "#a6d189",
		teal: "#81c8be",
		sky: "#99d1db",
		sapphire: "#85c1dc",
		blue: "#8caaee",
		lavender: "#babbf1",
		text: "#c6d0f5",
		subtext1: "#b5bfe2",
		subtext0: "#a5adce",
		overlay1: "#838ba7",
		surface0: "#414559",
		surface1: "#51576d",
		surface2: "#626880",
		base: "#303446",
		mantle: "#292c3c",
		crust: "#232634",
	},
	latte: {
		rosewater: "#dc8a78",
		flamingo: "#dd7878",
		pink: "#ea76cb",
		mauve: "#8839ef",
		red: "#d20f39",
		maroon: "#e64553",
		peach: "#fe640b",
		yellow: "#df8e1d",
		green: "#40a02b",
		teal: "#179299",
		sky: "#04a5e5",
		sapphire: "#209fb5",
		blue: "#1e66f5",
		lavender: "#7287fd",
		text: "#4c4f69",
		subtext1: "#5c5f77",
		subtext0: "#6c6f85",
		overlay1: "#8c8fa1",
		surface0: "#ccd0da",
		surface1: "#bcc0cc",
		surface2: "#acb0be",
		base: "#eff1f5",
		mantle: "#e6e9ef",
		crust: "#dce0e8",
	},
};

export function applyFlavor(flavor: Flavor, accentKey: SwatchKey): void {
	const vars = FLAVOR_VARS[flavor];
	const accentColor = vars[accentKey as SwatchKey] ?? vars.blue;
	const root = document.documentElement;

	const prefix = `--catppuccin-${flavor}`;
	for (const [key, value] of Object.entries(vars)) {
		root.style.setProperty(`${prefix}-${key}`, value);
	}

	root.style.setProperty("--background", vars.base);
	root.style.setProperty("--foreground", vars.text);
	root.style.setProperty("--card", vars.surface0);
	root.style.setProperty("--card-foreground", vars.text);
	root.style.setProperty("--popover", vars.surface1);
	root.style.setProperty("--popover-foreground", vars.text);
	root.style.setProperty("--primary", accentColor);
	root.style.setProperty("--primary-foreground", vars.base);
	root.style.setProperty("--secondary", vars.surface1);
	root.style.setProperty("--secondary-foreground", vars.text);
	root.style.setProperty("--muted", vars.surface0);
	root.style.setProperty("--muted-foreground", vars.subtext0);
	root.style.setProperty("--accent", vars.surface2);
	root.style.setProperty("--accent-foreground", vars.text);
	root.style.setProperty("--destructive", vars.red);
	root.style.setProperty("--border", vars.surface1);
	root.style.setProperty("--input", vars.surface2);
	root.style.setProperty("--ring", accentColor);
	root.style.setProperty("--chart-1", accentColor);
	root.style.setProperty("--sidebar", vars.mantle);
	root.style.setProperty("--sidebar-foreground", vars.text);
	root.style.setProperty("--sidebar-primary", accentColor);
	root.style.setProperty("--sidebar-primary-foreground", vars.base);
	root.style.setProperty("--sidebar-accent", vars.surface0);
	root.style.setProperty("--sidebar-accent-foreground", vars.text);
	root.style.setProperty("--sidebar-border", vars.surface2);
	root.style.setProperty("--sidebar-ring", vars.overlay1);

	localStorage.setItem("catppuccin-flavor", flavor);
	localStorage.setItem("catppuccin-accent", accentKey);
}

"use client";

import { PaletteIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import {
	applyFlavor,
	FLAVOR_VARS,
	FLAVORS,
	type Flavor,
	SWATCH_KEYS,
	type SwatchKey,
} from "@/lib/catppuccin";

export function ThemeSelector() {
	const [flavor, setFlavor] = React.useState<Flavor>("mocha");
	const [accentKey, setAccentKey] = React.useState<SwatchKey>("blue");
	const [open, setOpen] = React.useState(false);
	const panelRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const savedFlavor = localStorage.getItem(
			"catppuccin-flavor",
		) as Flavor | null;
		const savedAccent = localStorage.getItem(
			"catppuccin-accent",
		) as SwatchKey | null;
		const resolvedFlavor =
			savedFlavor && FLAVORS.includes(savedFlavor) ? savedFlavor : "mocha";
		const resolvedAccent =
			savedAccent && SWATCH_KEYS.includes(savedAccent) ? savedAccent : "blue";
		setFlavor(resolvedFlavor);
		setAccentKey(resolvedAccent);
		applyFlavor(resolvedFlavor, resolvedAccent);
	}, []);

	React.useEffect(() => {
		const panel = panelRef.current;
		function handleClickOutside(event: MouseEvent) {
			if (panel && !panel.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open]);

	const vars = FLAVOR_VARS[flavor];
	const accentColor = vars[accentKey];

	function handleFlavor(selectedFlavor: Flavor) {
		setFlavor(selectedFlavor);
		applyFlavor(selectedFlavor, accentKey);
	}

	function handleSwatch(swatchKey: SwatchKey) {
		setAccentKey(swatchKey);
		applyFlavor(flavor, swatchKey);
	}

	return (
		<div
			ref={panelRef}
			className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
		>
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.92, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.92, y: 8 }}
						transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
						className="w-80 border border-border bg-background p-2.5 shadow-xl"
					>
						<div className="grid grid-cols-4 gap-1 bg-muted p-1 mb-2">
							{FLAVORS.map((flavorOption) => (
								<button
									key={flavorOption}
									type="button"
									onClick={() => handleFlavor(flavorOption)}
									className="relative py-0.5 text-[10px] font-mono capitalize"
								>
									{flavorOption === flavor && (
										<motion.div
											layoutId="theme-selector-flavor-pill"
											className="absolute inset-0 border border-primary bg-secondary"
											transition={{
												type: "spring",
												bounce: 0.15,
												duration: 0.4,
											}}
										/>
									)}
									<motion.span
										className="relative z-10"
										animate={{
											color:
												flavorOption === flavor ? accentColor : vars.subtext0,
										}}
										transition={{ duration: 0.2 }}
									>
										{flavorOption.charAt(0).toUpperCase() +
											flavorOption.slice(1)}
									</motion.span>
								</button>
							))}
						</div>

						<div className="grid grid-cols-7 gap-1.5">
							{SWATCH_KEYS.map((key) => {
								const color = vars[key];
								const isActive = key === accentKey;
								return (
									<motion.button
										key={key}
										type="button"
										onClick={() => handleSwatch(key)}
										className="relative aspect-square cursor-pointer"
										animate={{ backgroundColor: color }}
										whileHover={{ scale: 1.15 }}
										whileTap={{ scale: 0.88 }}
										transition={{ duration: 0.2 }}
									>
										<AnimatePresence>
											{isActive && (
												<motion.span
													layoutId="theme-selector-swatch-ring"
													className="absolute pointer-events-none -inset-0.5 border-2"
													animate={{ borderColor: color }}
													transition={{
														type: "spring",
														bounce: 0.2,
														duration: 0.35,
													}}
												/>
											)}
										</AnimatePresence>
									</motion.button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.button
				type="button"
				onClick={() => setOpen((previous) => !previous)}
				className="size-9 border shadow-lg flex items-center justify-center"
				animate={{
					backgroundColor: open ? accentColor : vars.surface1,
					borderColor: accentColor,
				}}
				whileHover={{ scale: 1.08 }}
				whileTap={{ scale: 0.92 }}
				transition={{ duration: 0.2 }}
				title="Theme"
			>
				<motion.div
					animate={{ color: open ? vars.base : accentColor }}
					transition={{ duration: 0.2 }}
				>
					<PaletteIcon className="size-4" />
				</motion.div>
			</motion.button>
		</div>
	);
}

"use client";

import * as React from "react";
import {
	hasAnyDirtyTab,
	INITIAL_FORMULA,
	isTabDirty,
	makeTab,
	type Tab,
	writeToHandle,
} from "@/lib/tabs";

export function useTabs() {
	const [tabs, setTabs] = React.useState<Tab[]>([
		makeTab("1", "tab 1", INITIAL_FORMULA),
	]);
	const [activeTabId, setActiveTabId] = React.useState("1");
	const [renamingTabId, setRenamingTabId] = React.useState<string | null>(null);
	const [renamingValue, setRenamingValue] = React.useState("");

	const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
	const isDirty = isTabDirty(activeTab);
	const anyTabDirty = hasAnyDirtyTab(tabs);

	React.useEffect(() => {
		function handleBeforeUnload(event: BeforeUnloadEvent) {
			if (anyTabDirty) {
				event.preventDefault();
			}
		}
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [anyTabDirty]);

	const switchToTab = React.useCallback(
		(tabId: string, setFormula: (formula: string) => void) => {
			const tab = tabs.find((t) => t.id === tabId);
			if (!tab) return;
			setActiveTabId(tabId);
			setFormula(tab.formula);
		},
		[tabs],
	);

	const closeTab = React.useCallback(
		(tabId: string, setFormula: (formula: string) => void) => {
			if (tabs.length === 1) {
				setTabs([makeTab(tabId, tabs[0].name, "")]);
				setFormula("");
				return;
			}
			const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
			setTabs(remainingTabs);
			if (tabId === activeTabId) {
				const closedIndex = tabs.findIndex((tab) => tab.id === tabId);
				const nextTab =
					remainingTabs[Math.min(closedIndex, remainingTabs.length - 1)];
				setActiveTabId(nextTab.id);
				setFormula(nextTab.formula);
			}
		},
		[tabs, activeTabId],
	);

	const addTab = React.useCallback(
		(setFormula: (formula: string) => void) => {
			const newId = String(Date.now());
			const newTabNumber = tabs.length + 1;
			setTabs((prev) => [...prev, makeTab(newId, `tab ${newTabNumber}`, "")]);
			setActiveTabId(newId);
			setFormula("");
		},
		[tabs.length],
	);
	const startRename = React.useCallback(
		(tabId: string, currentName: string) => {
			setRenamingTabId(tabId);
			setRenamingValue(currentName);
		},
		[],
	);

	const commitRename = React.useCallback(() => {
		if (!renamingTabId) return;
		setTabs((prev) =>
			prev.map((tab) =>
				tab.id === renamingTabId
					? { ...tab, name: renamingValue.trim() || tab.name }
					: tab,
			),
		);
		setRenamingTabId(null);
	}, [renamingTabId, renamingValue]);

	const cancelRename = React.useCallback(() => {
		setRenamingTabId(null);
	}, []);

	const updateActiveTabFormula = React.useCallback(
		(formula: string) => {
			setTabs((prev) =>
				prev.map((tab) => (tab.id === activeTabId ? { ...tab, formula } : tab)),
			);
		},
		[activeTabId],
	);

	const saveActiveTab = React.useCallback(async () => {
		const tab = activeTab;
		const { name, formula, fileHandle } = tab;
		const data = JSON.stringify({ name, formula }, null, 2);

		if (fileHandle) {
			await writeToHandle(fileHandle, name, formula);
		} else if (
			typeof window !== "undefined" &&
			"showSaveFilePicker" in window
		) {
			let handle: FileSystemFileHandle;
			try {
				handle = await (
					window as Window &
						typeof globalThis & {
							showSaveFilePicker: (
								opts: unknown,
							) => Promise<FileSystemFileHandle>;
						}
				).showSaveFilePicker({
					suggestedName: `${name}.bb`,
					types: [
						{
							description: "Bytebeat file",
							accept: { "application/json": [".bb"] },
						},
					],
				});
			} catch {
				return;
			}
			await writeToHandle(handle, name, formula);
			setTabs((prev) =>
				prev.map((t) =>
					t.id === tab.id
						? { ...t, savedFormula: formula, fileHandle: handle }
						: t,
				),
			);
			return;
		} else {
			const blob = new Blob([data], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `${name}.bb`;
			anchor.click();
			URL.revokeObjectURL(url);
		}

		setTabs((prev) =>
			prev.map((t) => (t.id === tab.id ? { ...t, savedFormula: formula } : t)),
		);
	}, [activeTab]);

	const handleFileLoad = React.useCallback(
		(
			event: React.ChangeEvent<HTMLInputElement>,
			setFormula: (formula: string) => void,
		) => {
			const file = event.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (loadEvent) => {
				try {
					const data = JSON.parse(loadEvent.target?.result as string) as {
						formula?: unknown;
						name?: unknown;
					};
					const formula = typeof data.formula === "string" ? data.formula : "";
					const name =
						typeof data.name === "string"
							? data.name
							: file.name.replace(/\.bb$/, "");
					setTabs((prev) =>
						prev.map((tab) =>
							tab.id === activeTabId
								? { ...tab, formula, savedFormula: formula, name }
								: tab,
						),
					);
					setFormula(formula);
				} catch {
					console.warn("invalid file");
				}
			};
			reader.readAsText(file);
			event.target.value = "";
		},
		[activeTabId],
	);

	const applyPreset = React.useCallback(
		(formula: string) => {
			setTabs((prev) =>
				prev.map((tab) =>
					tab.id === activeTabId
						? { ...tab, formula, savedFormula: formula }
						: tab,
				),
			);
		},
		[activeTabId],
	);

	return {
		tabs,
		activeTabId,
		activeTab,
		isDirty,
		anyTabDirty,
		renamingTabId,
		renamingValue,
		setTabs,
		setActiveTabId,
		setRenamingValue,
		switchToTab,
		closeTab,
		addTab,
		startRename,
		commitRename,
		cancelRename,
		updateActiveTabFormula,
		saveActiveTab,
		handleFileLoad,
		applyPreset,
	};
}

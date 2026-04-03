export interface Tab {
	id: string;
	name: string;
	formula: string;
	savedFormula: string;
	fileHandle?: FileSystemFileHandle;
}

export const INITIAL_FORMULA = "t*(42&t>>10)";

export function makeTab(id: string, name: string, formula: string): Tab {
	return { id, name, formula, savedFormula: formula };
}

export async function writeToHandle(
	handle: FileSystemFileHandle,
	name: string,
	formula: string,
) {
	const writable = await handle.createWritable();
	await writable.write(JSON.stringify({ name, formula }, null, 2));
	await writable.close();
}

export function isTabDirty(tab: Tab): boolean {
	return tab.formula !== tab.savedFormula;
}

export function hasAnyDirtyTab(tabs: Tab[]): boolean {
	return tabs.some(isTabDirty);
}

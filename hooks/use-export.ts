"use client";

import * as React from "react";
import { downloadBlob, renderMp3 } from "@/lib/export";

interface UseExportOptions {
	getFormula: () => string;
	sampleRate: number;
	exportDuration: number;
}

interface UseExportReturn {
	exportProgress: number | null;
	handleExport: () => Promise<void>;
}

export function useExport(options: UseExportOptions): UseExportReturn {
	const { getFormula, sampleRate, exportDuration } = options;
	const [exportProgress, setExportProgress] = React.useState<number | null>(
		null,
	);

	const handleExport = React.useCallback(async () => {
		if (exportProgress !== null) return;
		setExportProgress(0);
		try {
			const blob = await renderMp3(
				getFormula(),
				sampleRate,
				exportDuration,
				setExportProgress,
			);
			downloadBlob(blob, `bytebeat-${exportDuration}s.mp3`);
		} finally {
			setExportProgress(null);
		}
	}, [exportProgress, getFormula, sampleRate, exportDuration]);

	return {
		exportProgress,
		handleExport,
	};
}

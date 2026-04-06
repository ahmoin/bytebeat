"use client";

import * as React from "react";

interface AiState {
	instruction: string;
	result: string | null;
	error: string | null;
	isLoading: boolean;
}

export function useAi(getCurrentFormula: () => string) {
	const [state, setState] = React.useState<AiState>({
		instruction: "",
		result: "",
		error: null,
		isLoading: false,
	});

	const setInstruction = React.useCallback((instruction: string) => {
		setState((state) => ({ ...state, instruction }));
	}, []);

	const submit = React.useCallback(async () => {
		const { instruction, isLoading } = state;
		if (!instruction.trim() || isLoading) return;
		setState((prev) => ({
			...prev,
			isLoading: true,
			result: null,
			error: null,
		}));
		try {
			const response = await fetch("/api/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					instruction: instruction.trim(),
					currentFormula: getCurrentFormula() || undefined,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				setState((prev) => ({
					...prev,
					error: data.error ?? "Unknown error",
				}));
			} else {
				setState((prev) => ({ ...prev, result: data.formula }));
			}
		} catch {
			setState((prev) => ({
				...prev,
				error: "Failed to connect to the ai",
			}));
		} finally {
			setState((prev) => ({ ...prev, isLoading: false }));
		}
	}, [state, getCurrentFormula]);

	return {
		...state,
		setInstruction,
		submit,
	};
}

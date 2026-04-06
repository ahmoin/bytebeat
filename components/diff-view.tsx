// https://github.com/f/prompts.chat/blob/main/src/components/ui/diff-view.tsx

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type WordDiff = {
	type: "unchanged" | "added" | "removed";
	text: string;
};

function computeWordDiff(original: string, modified: string): WordDiff[] {
	const tokenize = (str: string): string[] => {
		const tokens: string[] = [];
		let current = "";
		for (const char of str) {
			if (/\s/.test(char)) {
				if (current) {
					tokens.push(current);
					current = "";
				}
				tokens.push(char);
			} else {
				current += char;
			}
		}
		if (current) tokens.push(current);
		return tokens;
	};

	const originalTokens = tokenize(original);
	const modifiedTokens = tokenize(modified);
	const m = originalTokens.length;
	const n = modifiedTokens.length;

	const dp: number[][] = Array(m + 1)
		.fill(null)
		.map(() => Array(n + 1).fill(0));

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			dp[i][j] =
				originalTokens[i - 1] === modifiedTokens[j - 1]
					? dp[i - 1][j - 1] + 1
					: Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}

	const temp: WordDiff[] = [];
	let i = m,
		j = n;
	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && originalTokens[i - 1] === modifiedTokens[j - 1]) {
			temp.push({ type: "unchanged", text: originalTokens[i - 1] });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			temp.push({ type: "added", text: modifiedTokens[j - 1] });
			j--;
		} else if (i > 0) {
			temp.push({ type: "removed", text: originalTokens[i - 1] });
			i--;
		}
	}

	const result: WordDiff[] = [];
	for (let k = temp.length - 1; k >= 0; k--) {
		const item = temp[k];
		const last = result[result.length - 1];
		if (last && last.type === item.type) {
			last.text += item.text;
		} else {
			result.push({ ...item });
		}
	}
	return result;
}

function CodeDiffContent({ wordDiff }: { wordDiff: WordDiff[] }) {
	const lines = useMemo(() => {
		const combined = wordDiff.map((d) => d.text).join("");
		const lineTexts = combined.split("\n");
		let charIndex = 0;
		return lineTexts.map((lineText) => {
			let hasAddition = false;
			let hasDeletion = false;
			const lineStart = charIndex;
			const lineEnd = charIndex + lineText.length;
			let pos = 0;
			for (const diff of wordDiff) {
				const diffStart = pos;
				const diffEnd = pos + diff.text.length;
				if (diffEnd > lineStart && diffStart < lineEnd + 1) {
					if (diff.type === "added") hasAddition = true;
					if (diff.type === "removed") hasDeletion = true;
				}
				pos = diffEnd;
			}
			charIndex = lineEnd + 1;
			return { text: lineText, hasAddition, hasDeletion };
		});
	}, [wordDiff]);

	return (
		<div className="max-h-64 overflow-auto text-xs font-mono">
			{lines.map((line, index) => (
				<div
					key={index}
					className={cn(
						"flex",
						line.hasAddition && !line.hasDeletion && "bg-green-500/10",
						line.hasDeletion && !line.hasAddition && "bg-red-500/10",
						line.hasAddition && line.hasDeletion && "bg-yellow-500/10",
					)}
				>
					<span className="w-8 shrink-0 select-none border-r bg-muted/30 py-0.5 pr-2 text-right text-muted-foreground/50">
						{index + 1}
					</span>
					<span
						className={cn(
							"w-4 shrink-0 py-0.5 text-center",
							line.hasAddition &&
								!line.hasDeletion &&
								"text-green-600 dark:text-green-400",
							line.hasDeletion &&
								!line.hasAddition &&
								"text-red-600 dark:text-red-400",
							line.hasAddition &&
								line.hasDeletion &&
								"text-yellow-600 dark:text-yellow-400",
						)}
					>
						{line.hasAddition && line.hasDeletion
							? "~"
							: line.hasAddition
								? "+"
								: line.hasDeletion
									? "-"
									: " "}
					</span>
					<pre className="flex-1 whitespace-pre-wrap break-all px-2 py-0.5">
						{line.text || " "}
					</pre>
				</div>
			))}
		</div>
	);
}

export function DiffViewer({
	oldText,
	newText,
	className,
}: {
	oldText: string;
	newText: string;
	className?: string;
}) {
	const wordDiff = useMemo(
		() => computeWordDiff(oldText, newText),
		[oldText, newText],
	);

	const stats = useMemo(() => {
		let added = 0;
		let removed = 0;
		for (const item of wordDiff) {
			const words = item.text.trim().split(/\s+/).filter(Boolean).length;
			if (item.type === "added") added += words;
			if (item.type === "removed") removed += words;
		}
		return { added, removed };
	}, [wordDiff]);

	const hasChanges = stats.added > 0 || stats.removed > 0;

	return (
		<div className={cn("overflow-hidden rounded-lg border", className)}>
			<div className="flex items-center gap-3 border-b bg-muted/50 px-3 py-1.5 text-xs">
				{hasChanges ? (
					<>
						<span className="font-medium text-green-600 dark:text-green-400">
							+{stats.added} words
						</span>
						<span className="font-medium text-red-600 dark:text-red-400">
							-{stats.removed} words
						</span>
					</>
				) : (
					<span className="text-muted-foreground">No changes</span>
				)}
			</div>
			<CodeDiffContent wordDiff={wordDiff} />
		</div>
	);
}

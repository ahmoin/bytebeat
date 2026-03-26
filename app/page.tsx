"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlayIcon, PauseIcon, RotateCcwIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useBytebeat } from "@/hooks/use-bytebeat";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PRESETS, SAMPLE_RATES } from "@/lib/bytebeat";

export default function Page() {
	const {
		isPlaying,
		error,
		time,
		formula,
		sampleRate,
		waveformData,
		setFormula,
		setSampleRate,
		play,
		stop,
		reset,
	} = useBytebeat();

	return (
		<div className="flex min-h-svh p-6">
			<div className="flex max-w-md min-w-0 flex-col gap-6">
				<h1 className="font-mono text-xl font-semibold tracking-tight">
					bytebeat composer
				</h1>

				{/* TODO: add a visualizer using waveformData */}

				<div className="flex flex-col gap-1.5">
					<Label className="font-mono text-xs text-muted-foreground">
						f(t)
					</Label>
					<Textarea
						value={formula}
						onChange={(e) => setFormula(e.target.value)}
						className="font-mono text-sm"
						rows={2}
						spellCheck={false}
						autoComplete="off"
						autoCorrect="off"
					/>
					{error && (
						<p className="font-mono text-xs text-destructive">{error}</p>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button
						onClick={isPlaying ? stop : play}
						variant={isPlaying ? "outline" : "default"}
						size="sm"
					>
						{isPlaying ? (
							<PauseIcon data-icon="inline-start" />
						) : (
							<PlayIcon data-icon="inline-start" />
						)}
						{isPlaying ? "Pause" : "Play"}
					</Button>

					<Button onClick={reset} variant="ghost" size="sm">
						<RotateCcwIcon data-icon="inline-start" />
						Reset
					</Button>

					<Separator orientation="vertical" className="mx-1 h-6" />

					<Select
						onValueChange={(name) => {
							const p = PRESETS.find((p) => p.name === name);
							if (p) setFormula(p.formula);
						}}
					>
						<SelectTrigger className="h-8 w-40 font-mono text-xs">
							<SelectValue placeholder="Presets…" />
						</SelectTrigger>
						<SelectContent>
							{PRESETS.map((p) => (
								<SelectItem
									key={p.name}
									value={p.name}
									className="font-mono text-xs"
								>
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={String(sampleRate)}
						onValueChange={(v) => setSampleRate(parseInt(v, 10))}
					>
						<SelectTrigger className="h-8 w-32 font-mono text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SAMPLE_RATES.map((r) => (
								<SelectItem
									key={r.value}
									value={String(r.value)}
									className="font-mono text-xs"
								>
									{r.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<span className="font-mono text-xs text-muted-foreground">
					t = {time.toLocaleString()}
				</span>
			</div>
		</div>
	);
}

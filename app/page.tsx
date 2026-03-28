"use client";

import {
	ChevronDownIcon,
	DownloadIcon,
	PauseIcon,
	PlayIcon,
	RotateCcwIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { useBytebeat } from "@/hooks/use-bytebeat";
import { PRESETS, SAMPLE_RATES } from "@/lib/bytebeat";
import { downloadBlob, renderMp3 } from "@/lib/export";

export default function Page() {
	const [exportDuration, setExportDuration] = React.useState(10);
	const [sampleRateComboboxOpen, setSampleRateComboboxOpen] =
		React.useState(false);
	const [sampleRateInputValue, setSampleRateInputValue] = React.useState("");
	const [exportProgress, setExportProgress] = React.useState<number | null>(
		null,
	);

	async function handleExport() {
		if (exportProgress !== null) return;
		setExportProgress(0);
		try {
			const blob = await renderMp3(
				formula,
				sampleRate,
				exportDuration,
				setExportProgress,
			);
			downloadBlob(blob, `bytebeat-${exportDuration}s.mp3`);
		} finally {
			setExportProgress(null);
		}
	}

	const {
		isPlaying,
		error,
		time,
		formula,
		sampleRate,
		volume,
		waveformData,
		setFormula,
		setSampleRate,
		setVolume,
		setTime,
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

				<WaveformVisualizer waveformData={waveformData} />

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

					<Label className="font-mono text-xs text-muted-foreground">
						Sample Rate
					</Label>
					<Popover
						open={sampleRateComboboxOpen}
						onOpenChange={setSampleRateComboboxOpen}
					>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="h-8 w-32 justify-between font-mono text-xs"
							>
								<span>
									{SAMPLE_RATES.find((rate) => rate.value === sampleRate)
										?.label ?? `${sampleRate} Hz`}
								</span>
								<ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-32 p-0">
							<Command shouldFilter={false}>
								<div className="p-1 pb-0">
									<Input
										placeholder="Custom (Hz)"
										className="h-8 font-mono text-xs"
										value={sampleRateInputValue}
										onChange={(changeEvent) =>
											setSampleRateInputValue(changeEvent.target.value)
										}
										onKeyDown={(
											keyboardEvent: React.KeyboardEvent<HTMLInputElement>,
										) => {
											if (keyboardEvent.key === "Enter") {
												keyboardEvent.stopPropagation();
												const parsed = parseInt(sampleRateInputValue, 10);
												if (!Number.isNaN(parsed) && parsed > 0) {
													setSampleRate(parsed);
													setSampleRateInputValue("");
													setSampleRateComboboxOpen(false);
												}
											}
										}}
									/>
								</div>
								<CommandList>
									<CommandEmpty className="font-mono text-xs">
										No match.
									</CommandEmpty>
									<CommandGroup>
										{SAMPLE_RATES.map((rate) => (
											<CommandItem
												key={rate.value}
												value={rate.label}
												className="font-mono text-xs"
												onSelect={() => {
													setSampleRate(rate.value);
													setSampleRateComboboxOpen(false);
												}}
											>
												{rate.label}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<Separator orientation="vertical" className="mx-1 h-6" />

					<Label className="font-mono text-xs text-muted-foreground">
						Volume
					</Label>
					<Slider
						value={[volume]}
						onValueChange={([value]) => setVolume(value)}
						min={0}
						max={1}
						step={0.01}
						className="w-32"
					/>
					<span className="font-mono text-xs text-muted-foreground">
						{Math.round(volume * 100)}%
					</span>
				</div>

				<div className="flex items-center gap-2">
					<Label className="font-mono text-xs text-muted-foreground">t =</Label>
					<Input
						type="number"
						value={time}
						onChange={(e) => setTime(parseInt(e.target.value, 10) || 0)}
						className="font-mono text-xs w-32"
					/>
				</div>

				<div className="flex items-center gap-2">
					<Label className="font-mono text-xs text-muted-foreground">
						Export
					</Label>
					<Input
						type="number"
						min={1}
						max={3600}
						value={exportDuration}
						onChange={(e) =>
							setExportDuration(Math.max(1, parseInt(e.target.value, 10) || 1))
						}
						className="font-mono text-xs w-24"
					/>
					<span className="font-mono text-xs text-muted-foreground">s</span>
					<Button
						onClick={handleExport}
						disabled={exportProgress !== null || !!error}
						variant="outline"
						size="sm"
					>
						<DownloadIcon data-icon="inline-start" />
						{exportProgress !== null
							? `${Math.round(exportProgress * 100)}%`
							: "MP3"}
					</Button>
				</div>
			</div>
		</div>
	);
}

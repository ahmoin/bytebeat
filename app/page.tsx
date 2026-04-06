"use client";

import {
	CheckIcon,
	ChevronDownIcon,
	DownloadIcon,
	FolderOpenIcon,
	PauseIcon,
	PlayIcon,
	PlusIcon,
	RotateCcwIcon,
	SaveIcon,
	SendIcon,
	SparklesIcon,
	XIcon,
} from "lucide-react";
import * as React from "react";
import { DiffViewer } from "@/components/diff-view";
import { ThemeSelector } from "@/components/theme-selector";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { useAi } from "@/hooks/use-ai";
import { useBytebeat } from "@/hooks/use-bytebeat";
import { useExport } from "@/hooks/use-export";
import { useTabs } from "@/hooks/use-tabs";
import { AI_SUGGESTIONS } from "@/lib/ai";
import { PRESETS, SAMPLE_RATES } from "@/lib/bytebeat";
import { isTabDirty } from "@/lib/tabs";

export default function Page() {
	const [exportDuration, setExportDuration] = React.useState(10);
	const [sampleRateComboboxOpen, setSampleRateComboboxOpen] =
		React.useState(false);
	const [sampleRateInputValue, setSampleRateInputValue] = React.useState("");

	const {
		isPlaying,
		error,
		time,
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

	const {
		tabs,
		activeTabId,
		activeTab,
		isDirty,
		renamingTabId,
		renamingValue,
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
	} = useTabs();

	const { exportProgress, handleExport } = useExport({
		getFormula: () => activeTab.formula,
		sampleRate,
		exportDuration,
	});

	function handleFormulaChange(value: string) {
		updateActiveTabFormula(value);
		setFormula(value);
	}

	const fileInputRef = React.useRef<React.ComponentRef<typeof Input>>(null);

	function handleTabSwitch(tabId: string) {
		switchToTab(tabId, setFormula);
	}

	function handleCloseTab(tabId: string, event: React.MouseEvent) {
		event.stopPropagation();
		closeTab(tabId, setFormula);
	}

	function handleAddTab() {
		addTab(setFormula);
	}

	function handleFileLoadWrapper(event: React.ChangeEvent<HTMLInputElement>) {
		handleFileLoad(event, setFormula);
	}

	const [aiSampleRate, setAiSampleRate] = React.useState(48000);

	const {
		instruction: aiInstruction,
		result: aiResult,
		error: aiError,
		isLoading: aiLoading,
		setInstruction: setAiInstruction,
		submit: submitAi,
	} = useAi(() => activeTab.formula, aiSampleRate);

	function handleApplyAiResult() {
		if (!aiResult) return;
		applyPreset(aiResult);
		setFormula(aiResult);
		setSampleRate(aiSampleRate);
	}

	return (
		<div className="flex min-h-svh flex-col">
			<div className="flex items-center justify-between px-8 py-4 sm:px-16">
				<h1 className="font-mono text-xl font-semibold tracking-tight">
					bytebeat composer
				</h1>

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

					<Separator orientation="vertical" className="mx-1 h-6" />

					<Select
						onValueChange={(name) => {
							const preset = PRESETS.find((preset) => preset.name === name);
							if (preset) {
								applyPreset(preset.formula);
								setFormula(preset.formula);
							}
						}}
					>
						<SelectTrigger className="h-8 w-40 font-mono text-xs">
							<SelectValue placeholder="Presets…" />
						</SelectTrigger>
						<SelectContent>
							{PRESETS.map((preset) => (
								<SelectItem
									key={preset.name}
									value={preset.name}
									className="font-mono text-xs"
								>
									{preset.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Separator orientation="vertical" className="mx-1 h-6" />

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
			</div>

			<div className="flex flex-1 gap-0">
				<div className="flex flex-1 flex-col">
					<div className="flex flex-col gap-1.5 px-8 sm:px-16">
						<Tabs value={activeTabId} onValueChange={handleTabSwitch}>
							<div className="flex items-center gap-1">
								<TabsList variant="line" className="h-auto gap-0 p-0">
									{tabs.map((tab) => {
										const tabDirty = isTabDirty(tab);
										return (
											<div
												key={tab.id}
												className="group/tab relative flex items-center"
											>
												{renamingTabId === tab.id ? (
													<div className="inline-flex h-8 items-center border-b-2 border-primary px-2">
														<Input
															className="w-20 border-0 bg-transparent p-0 font-mono text-xs shadow-none focus-visible:ring-0"
															value={renamingValue}
															ref={(inputElement) => inputElement?.focus()}
															onChange={(changeEvent) =>
																setRenamingValue(changeEvent.target.value)
															}
															onBlur={commitRename}
															onKeyDown={(keyboardEvent) => {
																if (keyboardEvent.key === "Enter")
																	commitRename();
																if (keyboardEvent.key === "Escape")
																	cancelRename();
																keyboardEvent.stopPropagation();
															}}
														/>
													</div>
												) : (
													<TabsTrigger
														value={tab.id}
														className="gap-1 pr-5 font-mono text-xs"
														onDoubleClick={() => startRename(tab.id, tab.name)}
													>
														{tab.name}
														{tabDirty && (
															<span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
														)}
													</TabsTrigger>
												)}
												<Button
													tabIndex={-1}
													variant="ghost"
													size="icon-xs"
													onClick={(mouseEvent) =>
														handleCloseTab(tab.id, mouseEvent)
													}
													className="absolute right-0.5 opacity-0 transition-opacity group-hover/tab:opacity-60 hover:opacity-100!"
												>
													<XIcon className="size-3" />
												</Button>
											</div>
										);
									})}
								</TabsList>
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={handleAddTab}
									title="New tab"
								>
									<PlusIcon className="size-3.5" />
								</Button>
							</div>
						</Tabs>

						<div className="flex items-center justify-between">
							<Label className="font-mono text-xs text-muted-foreground">
								f(t)
							</Label>
							<div className="flex items-center gap-1">
								<Button
									onClick={() => fileInputRef.current?.click()}
									variant="ghost"
									size="sm"
									className="h-6 gap-1 font-mono text-xs"
								>
									<FolderOpenIcon className="size-3" />
									Load
								</Button>
								<Button
									onClick={saveActiveTab}
									disabled={!isDirty}
									variant="ghost"
									size="sm"
									className="h-6 gap-1 font-mono text-xs"
								>
									<SaveIcon className="size-3" />
									Save
								</Button>
							</div>
						</div>
						<Input
							ref={fileInputRef}
							type="file"
							accept=".bb,.json"
							className="hidden"
							onChange={handleFileLoadWrapper}
						/>
						<Textarea
							value={activeTab.formula}
							onChange={(changeEvent) =>
								handleFormulaChange(changeEvent.target.value)
							}
							className="font-mono text-sm"
							rows={2}
							spellCheck={false}
							autoComplete="off"
							autoCorrect="off"
							placeholder="t*(t>>5|t>>8)"
						/>
						{error && (
							<p className="font-mono text-xs text-destructive">{error}</p>
						)}
					</div>

					<div className="px-8 py-4 sm:px-16">
						<WaveformVisualizer waveformData={waveformData} />
					</div>

					<div className="flex items-center gap-2 px-8 sm:px-16">
						<Button onClick={reset} variant="ghost" size="sm">
							<RotateCcwIcon data-icon="inline-start" />
							Reset
						</Button>

						<Separator orientation="vertical" className="mx-1 h-6" />

						<Label className="font-mono text-xs text-muted-foreground">
							t =
						</Label>
						<Input
							type="number"
							value={time}
							onChange={(changeEvent) =>
								setTime(parseInt(changeEvent.target.value, 10) || 0)
							}
							className="font-mono text-xs w-32"
						/>
					</div>

					<div className="flex-1" />
					<ThemeSelector />

					<div className="flex items-center gap-2 px-8 py-4 sm:px-16">
						<Label className="font-mono text-xs text-muted-foreground">
							Export
						</Label>
						<Input
							type="number"
							min={1}
							max={3600}
							value={exportDuration}
							onChange={(changeEvent) =>
								setExportDuration(
									Math.max(1, parseInt(changeEvent.target.value, 10) || 1),
								)
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

				<div className="flex w-96 flex-col gap-4 border-l p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<SparklesIcon className="size-4 text-muted-foreground" />
							<span className="font-mono text-sm font-medium">AI</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Label className="font-mono text-xs text-muted-foreground">
								Rate
							</Label>
							<Select
								value={String(aiSampleRate)}
								onValueChange={(value) => setAiSampleRate(Number(value))}
							>
								<SelectTrigger className="h-7 w-28 font-mono text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SAMPLE_RATES.map((rate) => (
										<SelectItem
											key={rate.value}
											value={String(rate.value)}
											className="font-mono text-xs"
										>
											{rate.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex flex-wrap gap-1.5">
						{AI_SUGGESTIONS.map((suggestion) => (
							<button
								key={suggestion}
								type="button"
								onClick={() => setAiInstruction(suggestion)}
								className="rounded-full border px-2.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							>
								{suggestion}
							</button>
						))}
					</div>

					<div className="flex flex-col gap-1.5">
						<Textarea
							value={aiInstruction}
							onChange={(changeEvent) =>
								setAiInstruction(changeEvent.target.value)
							}
							onKeyDown={(keyboardEvent) => {
								if (keyboardEvent.key === "Enter" && !keyboardEvent.shiftKey) {
									keyboardEvent.preventDefault();
									submitAi();
								}
							}}
							placeholder="Slow it down, make it louder, change to minor scale…"
							className="font-mono text-xs resize-none"
							rows={3}
							spellCheck={false}
						/>
						<Button
							size="sm"
							onClick={submitAi}
							disabled={!aiInstruction.trim() || aiLoading}
							className="w-full font-mono text-xs"
						>
							{aiLoading ? (
								<>
									<SparklesIcon className="size-3 animate-pulse" />
									Generating…
								</>
							) : (
								<>
									<SendIcon className="size-3" />
									Send
								</>
							)}
						</Button>
					</div>

					{aiError && (
						<p className="font-mono text-xs text-destructive">{aiError}</p>
					)}

					{aiResult && (
						<div className="flex flex-col gap-1.5">
							<Label className="font-mono text-xs text-muted-foreground">
								Diff
							</Label>
							<DiffViewer oldText={activeTab.formula} newText={aiResult} />
							<Button
								size="sm"
								variant="secondary"
								className="w-full font-mono text-xs"
								onClick={handleApplyAiResult}
							>
								<CheckIcon className="size-3" />
								Apply
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

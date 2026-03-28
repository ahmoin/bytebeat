"use client";

import * as React from "react";

function resolveVar(variable: string, fallback: string) {
	const computed = getComputedStyle(document.documentElement);
	let value = computed.getPropertyValue(variable).trim();
	const match = value.match(/^var\((--[\w-]+)\)$/);
	if (match) {
		value = computed.getPropertyValue(match[1]).trim();
	}
	return value || fallback;
}

export function WaveformVisualizer({
	waveformData,
}: {
	waveformData: number[];
}) {
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = React.useRef(0);
	const dataRef = React.useRef(waveformData);

	React.useEffect(() => {
		dataRef.current = waveformData;
	}, [waveformData]);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const update = () => {
			const boundingClientRect = canvas.getBoundingClientRect();
			const devicePixelRatio = window.devicePixelRatio ?? 1;
			canvas.width = boundingClientRect.width * devicePixelRatio;
			canvas.height = boundingClientRect.height * devicePixelRatio;
		};

		update();

		const resizeObserver = new ResizeObserver(update);
		resizeObserver.observe(canvas);
		return () => resizeObserver.disconnect();
	}, []);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) return;

		const draw = () => {
			animationFrameRef.current = requestAnimationFrame(draw);

			const { width, height } = canvas;
			const devicePixelRatio = window.devicePixelRatio ?? 1;
			const data = dataRef.current;

			const backgroundColor = resolveVar("--background", "#1e1e2e");
			const accentColor = resolveVar("--primary", "#89b4fa");
			const gridColor = resolveVar("--border", "#45475a");

			context.fillStyle = backgroundColor;
			context.fillRect(0, 0, width, height);

			context.lineWidth = 1;
			context.strokeStyle = `${gridColor}28`;
			for (const fraction of [0.25, 0.5, 0.75]) {
				context.beginPath();
				context.moveTo(0, fraction * height);
				context.lineTo(width, fraction * height);
				context.stroke();
			}
			for (let x = 0; x <= 1; x += 0.125) {
				context.beginPath();
				context.moveTo(x * width, 0);
				context.lineTo(x * width, height);
				context.stroke();
			}

			context.strokeStyle = `${gridColor}55`;
			context.beginPath();
			context.moveTo(0, height / 2);
			context.lineTo(width, height / 2);
			context.stroke();

			if (data.length > 0) {
				context.shadowColor = accentColor;
				context.shadowBlur = 5 * devicePixelRatio;
				context.strokeStyle = accentColor;
				context.lineWidth = 1.5 * devicePixelRatio;
				context.lineJoin = "round";
				context.beginPath();

				for (let i = 0; i < data.length; i++) {
					const x = (i / (data.length - 1)) * width;
					const y = (1 - data[i] / 255) * height;
					if (i === 0) context.moveTo(x, y);
					else context.lineTo(x, y);
				}

				context.stroke();
				context.shadowBlur = 0;
			}
		};

		draw();
		return () => cancelAnimationFrame(animationFrameRef.current);
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="block h-40 w-full rounded-sm border border-border"
		/>
	);
}

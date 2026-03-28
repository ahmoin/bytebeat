"use client";

import { Mp3Encoder } from "@breezystack/lamejs";
import { buildFnBody } from "@/lib/bytebeat";

const CHUNK_SIZE = 1024 * 8;
const MP3_BLOCK_SIZE = 576 * 2;
const INT16_MAX = 2 ** 15 - 1;

export async function renderMp3(
	formula: string,
	sampleRate: number,
	durationSeconds: number,
	onProgress: (ratio: number) => void,
): Promise<Blob> {
	const formulaFunction = new Function("t", buildFnBody(formula));
	const totalSamples = Math.floor(sampleRate * durationSeconds);
	const pcmBuffer = new Int16Array(totalSamples);

	for (let offset = 0; offset < totalSamples; offset += CHUNK_SIZE) {
		const chunkEnd = Math.min(offset + CHUNK_SIZE, totalSamples);
		for (let timeIndex = offset; timeIndex < chunkEnd; timeIndex++) {
			const sample = formulaFunction(timeIndex) & 255;
			pcmBuffer[timeIndex] = (sample - 128) * 128 * INT16_MAX;
		}
		onProgress(chunkEnd / totalSamples);
		await new Promise((resolve) => setTimeout(resolve, 0));
	}

	const encoder = new Mp3Encoder(1, sampleRate, 128);
	const mp3Chunks: Uint8Array[] = [];

	for (
		let blockOffset = 0;
		blockOffset < totalSamples;
		blockOffset += MP3_BLOCK_SIZE
	) {
		const sampleBlock = pcmBuffer.subarray(
			blockOffset,
			blockOffset + MP3_BLOCK_SIZE,
		);
		const encodedMp3Chunk = encoder.encodeBuffer(sampleBlock);
		if (encodedMp3Chunk.length > 0) mp3Chunks.push(encodedMp3Chunk);
	}

	const encodedTail = encoder.flush();
	if (encodedTail.length > 0) mp3Chunks.push(encodedTail);

	return new Blob(mp3Chunks as BlobPart[], { type: "audio/mpeg" });
}

export function downloadBlob(blob: Blob, filename: string) {
	const objectUrl = URL.createObjectURL(blob);
	const anchorElement = document.createElement("a");
	anchorElement.href = objectUrl;
	anchorElement.download = filename;
	anchorElement.click();
	URL.revokeObjectURL(objectUrl);
}

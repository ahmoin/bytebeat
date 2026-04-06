
// https://scrapbox.io/0b5vr/128_Voices_Generator_by_0b5vr

import { type NextRequest, NextResponse } from "next/server";

const MODIFICATION_GUIDES: { pattern: RegExp; guide: string }[] = [
	{
		pattern: /slow\s*(er|er down|it down|down)?/i,
		guide: `Modification: Slow down the tempo.
Change the time variable definition s=t/5e3 by increasing the denominator (e.g., use t/8e3 or t/1e4). This stretches the timing of the kick, sidechain, and chord progression.`,
	},
	{
		pattern: /speed\s*(er|it up|up)?|faster/i,
		guide: `Modification: Speed up the tempo.
Change the time variable definition s=t/5e3 by decreasing the denominator (e.g., use t/2e3 or t/3e3). Ensure the sin in the kick drum still sounds natural at the new speed.`,
	},
	{
		pattern: /less\s*repet|not\s*so\s*repet|more\s*var/i,
		guide: `Modification: Reduce repetitiveness.
Change the magic number 57454323 inside the F function to a different large 32-bit integer to generate a new chord progression. Additionally, modify the step logic (s>>3&4) to change how often the chords transpose.`,
	},
	{
		pattern: /more\s*cohes|better\s*mix|tighter|blend/i,
		guide: `Modification: Improve mix cohesion.
Reduce the detuned unison amount (the i/4/H or i/90 term) in the Arp and Chord sections to make the sound tighter. Shorten the sidechain decay by changing exp(-s%1*2) to exp(-s%1*4) for a more percussive rhythm.`,
	},
	{
		pattern: /loud(er)?|more\s*volume|boost/i,
		guide: `Modification: Increase output volume.
Change the final normalization inside the loop. Instead of dividing by H (128), divide by a smaller number such as H/2 (effectively 64) to increase amplitude. Be careful not to cause digital clipping.`,
	},
	{
		pattern: /quiet(er)?|softer|lower\s*volume|reduce\s*volume/i,
		guide: `Modification: Decrease output volume.
Change the final normalization inside the loop. Instead of dividing by H, divide by a larger number such as H*2 (effectively 256) to reduce amplitude.`,
	},
	{
		pattern: /higher\s*pitch|pitch\s*up|transpose\s*up/i,
		guide: `Modification: Transpose the track up.
Add a constant value (e.g., +1 or +2) to the exponents inside the 2** expressions found in the Bass, Arp, and Chord formulas. Do not change the Kick formula.`,
	},
	{
		pattern: /lower\s*pitch|pitch\s*down|transpose\s*down/i,
		guide: `Modification: Transpose the track down.
Subtract a constant value (e.g., -1 or -2) from the exponents inside the 2** expressions found in the Bass, Arp, and Chord formulas. Do not change the Kick formula.`,
	},
	{
		pattern:
			/start(?:ing)?\s*after\s*(\d+)\s*sec|delay\s*(\d+)\s*sec|\d+\s*sec(?:ond)?\s*delay/i,
		guide: `Modification: Add a delay before music starts.
Calculate the sample count for the requested delay at the current sample rate (e.g., at 48kHz, 10 seconds = 480000 samples; scale accordingly for other rates). Wrap the main loop logic in a conditional so it only executes if t exceeds that sample count. Before that time, ensure o remains [H,H] (silence/center).`,
	},
	{
		pattern: /minor|pentat|scale|dorian|phrygian|lydian|mixolyd|locrian/i,
		guide: `Modification: Change the musical scale.
Alter the F function to map pitches to the requested scale. Adjust the bitwise logic or values returned by the function, ensuring notes fit 12-tone equal temperament (/12). For example, for minor pentatonic, map to intervals [0,3,5,7,10].`,
	},
];

function buildPrompt(
	userInstruction: string,
	currentFormula: string | null,
	sampleRate: number,
): string {
	const matchedGuides: string[] = [];

	for (const { pattern, guide } of MODIFICATION_GUIDES) {
		if (pattern.test(userInstruction)) {
			matchedGuides.push(guide);
		}
	}

	const basePrompt = `Act as an expert Bytebeat composer. Generate a single-line compatible (using comma operators), C-syntax-style JavaScript expression for a ${sampleRate / 1000}kHz audio environment.

Technical Constraints:
1. Sample Rate: ${sampleRate / 1000}kHz (${sampleRate} Hz).
2. Syntax: Use a terse C-like syntax compatible with JavaScript evaluation. You can use multi-line formatting separated by commas.
3. Structure: You MUST follow the exact architectural skeleton defined below.

Mandatory Code Skeleton:
1. Header: H=i=128, s=t/5e3, o=[H,H],
2. Pitch Function: F=i=>((57454323>>4*i&31)-(s>>3&4))/12,
3. The Loop: (_=>{while(i--)o[i%2]+= ... })(),
4. Output: Return o at the end.

Reference Example:
H=i=128,
s=t/5e3,
o=[H,H],
F=i=>((57454323>>4*i&31)-(s>>3&4))/12,
(_=>{while(i--)o[i%2]+=
  sin(40*log(s%4)+9*s)/3
  +s%4*(
    exp(-s%1*2)*(
      (t*2**[
        F(7)-2,
        5+i/90,
        F(~~s-4*(i<48))+i%4/H
      ][i%3]+s%1*i/5&H)-64
    )
    +(t*2**(F(i%7)-(i/2&1))+1e4*sin(i+s/H))%H-64
  )/H
})(),
o

Keep the Kick, Sidechain, Bass, Hihat, Arp, and Chord logic intact. You may vary mathematical parameters to create a new variation.`;

	const formulaContext = currentFormula
		? `\nCurrent formula to modify:\n${currentFormula}\n`
		: "";

	const modificationSection =
		matchedGuides.length > 0
			? `\n${matchedGuides.join("\n\n")}\n\nUser request: "${userInstruction}"`
			: `\nUser request: "${userInstruction}"\nApply this change while preserving the mandatory skeleton structure.`;

	return `${basePrompt}${formulaContext}${modificationSection}

IMPORTANT: Respond with ONLY the raw bytebeat formula expression. No explanation, no markdown, no code blocks. Format it across multiple lines like the reference example above, with each major part on its own line and inner expressions indented. The expression must start with H=i=128 and end with o.`;
}

export async function POST(request: NextRequest) {
	const apiKey = process.env.HACK_CLUB_AI_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "HACK_CLUB_AI_API_KEY is not configured" },
			{ status: 500 },
		);
	}

	const body = await request.json();
	const { instruction, currentFormula, sampleRate } = body as {
		instruction: string;
		currentFormula?: string;
		sampleRate?: number;
	};

	if (!instruction?.trim()) {
		return NextResponse.json(
			{ error: "instruction is required" },
			{ status: 400 },
		);
	}

	const prompt = buildPrompt(
		instruction.trim(),
		currentFormula ?? null,
		sampleRate ?? 48000,
	);

	const response = await fetch(
		"https://ai.hackclub.com/proxy/v1/chat/completions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "google/gemini-2.5-flash",
				messages: [{ role: "user", content: prompt }],
				temperature: 0.8,
			}),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		return NextResponse.json(
			{ error: `OpenRouter error: ${response.status} ${errorText}` },
			{ status: 502 },
		);
	}

	const data = await response.json();
	const formula = data.choices?.[0]?.message?.content?.trim() ?? "";

	return NextResponse.json({ formula });
}

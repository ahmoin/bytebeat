export const PRESETS = [
	{ name: "Sierpinski", formula: "t*(t>>5|t>>8)" },
	{ name: "42 Melody", formula: "t*((t>>12|t>>8)&63&t>>4)" },
	{ name: "Rhythm", formula: "t*(t>>11&t>>8&123&t>>3)" },
	{ name: "Kragen", formula: "t>>4|t>>8|t&t>>10" },
	{ name: "Simple", formula: "t&t>>8" },
	{ name: "Glitch", formula: "(t>>7|t|t>>6)*10+4*(t&t>>13|t>>6)" },
	{ name: "Melodic", formula: "((t>>1)^((t>>1)+(t>>7))|t>>4)-1" },
];

export const SAMPLE_RATES = [
	{ label: "8000 Hz", value: 8000 },
	{ label: "11025 Hz", value: 11025 },
	{ label: "22050 Hz", value: 22050 },
	{ label: "44100 Hz", value: 44100 },
	{ label: "48000 Hz", value: 48000 },
];

export const MATH_ALIASES = `
  const sin=Math.sin,cos=Math.cos,tan=Math.tan,abs=Math.abs,
        floor=Math.floor,ceil=Math.ceil,round=Math.round,
        pow=Math.pow,sqrt=Math.sqrt,log=Math.log,PI=Math.PI,
        random=Math.random,min=Math.min,max=Math.max;
`;

export function buildFnBody(formula: string): string {
	return `"use strict"; ${MATH_ALIASES} return (${formula}) & 255;`;
}

export function compileFormula(
	formula: string,
): ((t: number) => number) | null {
	try {
		const fn = new Function("t", buildFnBody(formula)) as (t: number) => number;
		fn(0);
		return fn;
	} catch {
		return null;
	}
}

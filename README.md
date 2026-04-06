# Bytebeat

A bytebeat playground where you can type a formula, hit play, and hear and visualize it. There's also a hack club ai powered assistant for formula generation and modification.

## Usage

Enter a JavaScript expression using t as the time variable. Changes to the formula don't take effect immediately without stopping playback.

### Controls

- Play & Pause: start or stop audio output
- Presets: load a classic bytebeat formula
- Sample Rate: select from common values or enter a custom Hz value
- Volume: adjust output level
- t: view or manually set the current time value and Reset returns it to 0

### Tabs

Open multiple formulas at once using tabs. Double click a tab to rename it. A dot on a tab indicates unsaved changes. Use Load / Save to import or export .bb or .json files.

### AI Assistant

The AI panel on the right generates or modifies formulas based on instructions. Pick a suggestion or write your own prompt. The result is shown as a diff and you can click apply to use it.

### Export

Set a duration in seconds and click the MP3 download button for the rendered audio MP3 file of the current formula.

## Credits

Diff viewer adapted from [prompts.chat](https://github.com/f/prompts.chat/blob/main/src/components/ui/diff-view.tsx)
AI bytebeat skeleton based on [128 Voices Generator by 0b5vr](https://scrapbox.io/0b5vr/128_Voices_Generator_by_0b5vr)

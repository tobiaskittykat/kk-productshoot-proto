

# Translate Hex Codes to Descriptive Color Names

## Problem
When users enter a custom hex code (e.g. `#FF69B4`) that doesn't match an existing preset, the color name is set to "Custom". This shows up confusingly in the UI and flows into prompts as just the raw hex code, which the AI struggles with.

## Solution
Add a `hexToColorName` utility that finds the **nearest named color** from an extended palette. This replaces "Custom" with a real descriptive name (e.g., "Hot Pink") both in the UI and in prompts.

## Approach: Nearest-Color Matching via Delta-E (simplified)

Create a utility function that:
1. First checks the existing `COLOR_PRESETS` for an exact match
2. If no exact match, converts hex to RGB and finds the **perceptually closest** color from an extended named-color palette (~140 CSS named colors + the Birkenstock presets)
3. Returns the closest color name (e.g., `#FF10F0` -> "Magenta", `#8B4513` -> "Saddle Brown")

Uses simple Euclidean distance in RGB space (good enough for color naming, no external dependencies needed).

## Files

### 1. `src/lib/colorNames.ts` (new)
- Extended color name palette (~140 entries from CSS named colors + Birkenstock presets)
- `hexToColorName(hex: string): string` -- returns nearest color name
- `hexToRgb(hex: string): [number, number, number]` helper
- Distance function using weighted RGB (human perception weighting: R*0.3, G*0.59, B*0.11)

### 2. `src/lib/birkenstockMaterials.ts`
- Export a `findColorPreset` that also checks extended names (or keep as-is since the new util covers it)

### 3. `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`
- In `handleCustomHexChange`: instead of setting `selectedColor` to `'Custom'`, call `hexToColorName(hex)` to get a descriptive name
- In the native color picker `onChange`: same treatment
- UI now shows e.g. "Selected: Hot Pink (#FF69B4)" instead of "Selected: Custom (#FF69B4)"

### 4. `supabase/functions/generate-image/index.ts`
- Replace the hardcoded `colorNames` map in `getColorDescription()` with the same nearest-color logic (duplicated server-side since edge functions can't import from `src/`)
- This ensures prompts say "Saddle Brown (#8B4513)" instead of just "#8B4513"

## Key Details

- The extended palette includes all CSS named colors (Tomato, Salmon, Orchid, Sienna, etc.) plus Birkenstock-specific names (Taupe, Habana, Cognac, etc.)
- Birkenstock presets take priority in matching so brand-specific names are preferred
- No new dependencies -- pure math (weighted RGB distance)
- The color name is stored alongside the hex in the override, so both travel together through the system




# Fix: Include Hex Code in Prompt for Custom-Picked Colors

## Problem
When a user picks a color via the hex code input, `hexToColorName()` resolves it to a descriptive name (e.g., "Rosy Brown") and stores that as the `color` field. Later, `getColorDescription()` in the generate-image function checks if `color === 'Custom'` -- since it's now "Rosy Brown", it returns early with just the name, dropping the hex code from the prompt entirely.

## Root Cause
Line 282 in `generate-image/index.ts`:
```
if (override.color !== 'Custom' && override.color !== 'custom') {
  return override.color;  // <-- exits here, hex is lost
}
```

## Fix

### File: `supabase/functions/generate-image/index.ts`
Update `getColorDescription` to also append the hex when the color name is NOT a known preset (meaning it was resolved from a custom hex pick). Logic:

```
function getColorDescription(override) {
  // If colorHex is present and color is NOT a standard preset name,
  // it was resolved from a hex pick -- include the hex
  if (override.colorHex && !isKnownPreset(override.color)) {
    return `${override.color} (${override.colorHex.toUpperCase()})`;
  }
  return override.color;
}
```

Add a small `isKnownPreset` helper that checks against the `COLOR_PRESETS` array already duplicated in the edge function.

### File: `src/lib/birkenstockMaterials.ts`
Apply the same fix to the client-side `getColorDescription` helper, using the imported `COLOR_PRESETS` to distinguish preset picks from hex-derived names.

## Result
- Preset color pick (e.g., "Taupe"): prompt says `Taupe` (unchanged)
- Hex color pick (e.g., `#BC8F8F`): prompt says `Rosy Brown (#BC8F8F)` (fixed)

## Scope
Two small function updates, no new files, no database changes.


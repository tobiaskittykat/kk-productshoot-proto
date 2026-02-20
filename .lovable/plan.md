

# Add "Last Used" Colors Section to Component Override Popover

## Overview
Replace the current flat grid of the first 10 color presets with two distinct sections:
1. **Last Used** -- the 5 most recently applied colors (persisted in localStorage)
2. **Standard Colors** -- the full Birkenstock color palette

## Changes

### File: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

**1. Add localStorage persistence for recent colors**

- Define a localStorage key: `'component-override-recent-colors'`
- On mount, read the stored array (max 5 entries, each with `name` and `hex`)
- When the user clicks "Apply" with a color change, prepend the selected color to the recent list (deduplicating by hex), trim to 5, and save back to localStorage

**2. Restructure the color picker UI**

Replace the current layout (first 10 swatches + "More colors..." expandable) with:

- **"Last Used" row** (only shown if there are recent colors): 5 swatches in a single row with a "LAST USED" label
- **"Standard Colors" section**: All `COLOR_PRESETS` shown in a scrollable grid (no more "More colors..." accordion -- just show them all in a scrollable area with max-height)

**3. Update `handleApply`**

Before closing, save the applied color to the recent colors list in localStorage.

### No other files change

This is a UI-only change within the popover component. The color data structure (`COLOR_PRESETS`) in `birkenstockMaterials.ts` stays the same.

## Technical Details

- Recent colors stored as JSON in localStorage under key `'component-override-recent-colors'`
- Format: `[{ name: "Hot Pink", hex: "#FF69B4" }, ...]` -- max 5 entries
- Deduplication by hex value (case-insensitive)
- Custom hex colors are stored too (name will be "Custom" or the resolved preset name)
- If localStorage is unavailable, the section simply won't appear (graceful fallback)


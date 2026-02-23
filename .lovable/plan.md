

# Sync Component Colors to Product Subtitle

## Problem
When you edit the upper color (e.g., changing "Burgundy" to "Zinfandel") in the component editor, the product list still shows "Burgundy Suede" because the subtitle is derived from `description.colors` -- a separate field that doesn't update when components change.

## Solution
When saving the product, automatically sync the primary color from the edited components into `description.colors` so the product list always reflects the latest color.

## Changes

### File: `src/pages/ProductEdit.tsx`

In the `handleSave` function (around line 150), before building `finalDescription`, sync the upper component's color into the description's colors array:

```text
// Before building finalDescription, sync upper color into description.colors
const syncedDescription = { ...(editedDescription || {}) };
if (editedComponents?.upper?.color) {
  syncedDescription.colors = [editedComponents.upper.color];
}
if (editedComponents?.upper?.material) {
  syncedDescription.materials = [editedComponents.upper.material];
}
const finalDescription = { ...syncedDescription, summary: description };
```

This replaces the current line:
```text
const finalDescription = { ...(editedDescription || {}), summary: description };
```

### What This Does
- When you save after changing the upper color to "Zinfandel", `description.colors` becomes `["Zinfandel"]`
- The product list calls `parseSkuDisplayInfo(name, description)` which reads `description.colors[0]`
- The subtitle will now correctly show "Birkenstock - Zinfandel Suede"

### Files Summary

| File | Change |
|------|--------|
| `src/pages/ProductEdit.tsx` | Sync upper color and material into description.colors/materials on save |

No database or backend changes needed.

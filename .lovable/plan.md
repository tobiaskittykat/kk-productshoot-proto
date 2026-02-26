
# Add Edit Capability to Saved Color Samples

## Problem
When the AI analysis of a color/material swatch gets something wrong (e.g., identifies the wrong material or color name), there's no way to correct it. Users are stuck with inaccurate metadata on their saved swatches.

## Solution
Add an `updateSample` function to the `useColorSamples` hook, then add an edit mode to the saved swatches section in the ComponentOverridePopover. When a user long-presses or clicks an edit icon on a saved swatch, they can modify the material, color, and color hex fields inline.

## Changes

### 1. Add `updateSample` to `useColorSamples` hook

**File**: `src/hooks/useColorSamples.ts`

Add a new `updateSample` callback that updates material, color, color_hex, and auto-regenerates the `name` field:

```typescript
const updateSample = useCallback(async (id: string, updates: {
  material?: string;
  color?: string;
  color_hex?: string;
}) => {
  const existing = samples.find(s => s.id === id);
  const merged = {
    material: updates.material ?? existing?.material,
    color: updates.color ?? existing?.color,
    color_hex: updates.color_hex ?? existing?.color_hex,
  };
  const name = [merged.material, merged.color].filter(Boolean).join(' – ') || 'Untitled';

  const { error } = await supabase
    .from('color_samples' as any)
    .update({ ...merged, name })
    .eq('id', id);

  if (!error) {
    setSamples(prev => prev.map(s => s.id === id
      ? { ...s, ...merged, name }
      : s
    ));
  }
  return !error;
}, [samples]);
```

Return `updateSample` alongside the existing exports.

### 2. Add edit UI for saved swatches

**File**: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

In the "Saved Swatches" grid section (lines 440-468), add:

- A small **edit icon button** (Pencil) that appears on hover over each swatch thumbnail
- When clicked, it opens an **inline edit panel** below the grid showing:
  - The swatch image (small thumbnail)
  - Material text input (pre-filled with current value)
  - Color name text input (pre-filled)
  - Hex input (pre-filled)
  - Save and Cancel buttons
- On save, call `updateSample(id, { material, color, color_hex })` and close the edit panel
- A delete button (Trash2 icon) also visible in edit mode to remove bad swatches entirely

### UI Layout (edit mode)

```text
+-------------------------------------------+
| SAVED SWATCHES                            |
| [swatch] [swatch] [swatch] [swatch]      |
+-------------------------------------------+
| Editing: [thumbnail]                      |
| Material: [_______________]               |
| Color:    [_______________]               |
| Hex:      [#______]                       |
| [Delete]              [Cancel] [Save]     |
+-------------------------------------------+
```

### State Management

Add to ComponentOverridePopover:
- `editingSampleId: string | null` -- which swatch is being edited
- `editMaterial`, `editColor`, `editHex` -- local edit fields

## Scope
- `src/hooks/useColorSamples.ts` -- add `updateSample` function
- `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` -- add edit UI for saved swatches

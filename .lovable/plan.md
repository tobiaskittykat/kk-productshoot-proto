
# Add "Metal (Color-Matched)" Buckle Option

## What This Does

Adds a new buckle material called **"Metal (Color-Matched)"** that behaves identically to the existing "Matte Plastic (Color-Matched)" option: when selected, the buckle color automatically syncs with the upper's color and the manual color picker is locked.

## Changes

### 1. `src/lib/birkenstockMaterials.ts` -- Add new material entry

Add a new buckle material in the **Metal** category:
```
{ value: 'Metal (Coordinated)', label: 'Metal (Color-Matched)', category: 'Metal' }
```

### 2. `src/hooks/useShoeComponents.ts` -- Extend sync logic

Update the buckle auto-sync `useEffect` (line 123) to trigger for **both** coordinated materials:

```
Before: overrides.buckles?.material === 'Matte Plastic (Coordinated)'
After:  overrides.buckles?.material === 'Matte Plastic (Coordinated)' ||
        overrides.buckles?.material === 'Metal (Coordinated)'
```

### 3. `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` -- Extend locked-color detection

Update the `isColorMatched` check (line 51) to recognize both coordinated materials:

```
Before: selectedMaterial === 'Matte Plastic (Coordinated)'
After:  selectedMaterial === 'Matte Plastic (Coordinated)' ||
        selectedMaterial === 'Metal (Coordinated)'
```

## How It Works

When a user selects "Metal (Color-Matched)" for buckles:
- The color picker locks and shows "Matches Upper: [Color]"
- The buckle color auto-syncs with the upper (checking overrides first, then original)
- The prompt will describe it as e.g. "Metal (Coordinated) in Moss Green" so the AI generates a color-matched metal buckle

## Files Changed

- `src/lib/birkenstockMaterials.ts` (1 line added)
- `src/hooks/useShoeComponents.ts` (1 condition expanded)
- `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` (1 condition expanded)

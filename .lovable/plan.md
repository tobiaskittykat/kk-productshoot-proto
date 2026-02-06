
# Fix: Hot Pink Color Override Not Working

## Problem Summary

When you selected "Hot Pink" via hex color picker (`#FF69B4`), the override was correctly stored with `colorHex: "#FF69B4"`, but the prompt sent to the AI just said:

```
UPPER: Suede in Custom (was: Suede in Taupe)
```

The AI doesn't know what "Custom" means, so it ignores the instruction and uses the original Taupe color from the reference images.

---

## Root Cause

The `colorHex` field is captured in the override data but **never used** when building the prompt text:

```typescript
// Current code (line 516-517 in generate-image/index.ts)
changedComponents.push(
  `${type.toUpperCase()}: ${override.material} in ${override.color} (was: ...)`
  //                                                 ^^^^^^^^^^^ Just "Custom"
);
```

Same issue exists in the client-side helper (`birkenstockMaterials.ts` line 171).

---

## Fix Overview

Update both the edge function and client helper to include the hex code when the color name is "Custom" or when `colorHex` is available:

```text
BEFORE:  UPPER: Suede in Custom (was: Suede in Taupe)
AFTER:   UPPER: Suede in Hot Pink (#FF69B4) (was: Suede in Taupe)
```

---

## Technical Changes

### 1. Edge Function: `supabase/functions/generate-image/index.ts`

**Location:** Lines 510-523

**Add hex color name resolution helper (near top of file):**
```typescript
// Helper to get a descriptive color name from override data
function getColorDescription(override: { color: string; colorHex?: string }): string {
  if (override.color !== 'Custom' && override.color !== 'custom') {
    return override.color;
  }
  if (!override.colorHex) {
    return override.color;
  }
  // Try to find a matching named color, otherwise describe the hex
  const hex = override.colorHex.toUpperCase();
  // Common color name mapping for hex values
  const colorNames: Record<string, string> = {
    '#FF69B4': 'Hot Pink',
    '#FF1493': 'Deep Pink',
    '#FFC0CB': 'Pink',
    '#FFB6C1': 'Light Pink',
    '#FF0000': 'Red',
    '#00FF00': 'Lime Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  const namedColor = colorNames[hex];
  return namedColor ? `${namedColor} (${hex})` : hex;
}
```

**Update the override loop (lines 510-523):**
```typescript
for (const type of componentTypes) {
  const override = overrides[type];
  const orig = original[type];
  
  if (override && orig) {
    // Get descriptive color (resolves "Custom" to actual hex/name)
    const colorDisplay = getColorDescription(override);
    
    if (override.material !== orig.material || override.color !== orig.color) {
      changedComponents.push(
        `${type.toUpperCase()}: ${override.material} in ${colorDisplay} (was: ${orig.material} in ${orig.color})`
      );
    }
  } else if (override && !orig) {
    const colorDisplay = getColorDescription(override);
    changedComponents.push(`${type.toUpperCase()}: ${override.material} in ${colorDisplay}`);
  }
}
```

### 2. Client Helper: `src/lib/birkenstockMaterials.ts`

**Location:** `buildComponentOverridePrompt` function (lines 146-183)

**Add the same helper and update the function:**
```typescript
// Helper to get a descriptive color name from override data
function getColorDescription(override: { color: string; colorHex?: string }): string {
  if (override.color !== 'Custom' && override.color !== 'custom') {
    return override.color;
  }
  if (!override.colorHex) {
    return override.color;
  }
  const hex = override.colorHex.toUpperCase();
  const colorNames: Record<string, string> = {
    '#FF69B4': 'Hot Pink',
    '#FF1493': 'Deep Pink',
    '#FFC0CB': 'Pink',
    '#FFB6C1': 'Light Pink',
    '#FF0000': 'Red',
    '#00FF00': 'Lime Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  const namedColor = colorNames[hex];
  return namedColor ? `${namedColor} (${hex})` : hex;
}

// In buildComponentOverridePrompt, update line 171:
if (isChanged) {
  const colorDisplay = getColorDescription(override);
  lines.push(`${type.toUpperCase()}: ${override.material} in ${colorDisplay}`);
  // ...
}
```

---

## Expected Result After Fix

When you select Hot Pink (#FF69B4) for the upper:

**Prompt sent to AI:**
```
=== PRODUCT COMPONENT OVERRIDES ===
⚠️ IMPORTANT: The user has customized specific shoe components.
Generate the product with THESE modifications while maintaining
the original silhouette and proportions from reference images:

UPPER: Suede in Hot Pink (#FF69B4) (was: Suede in Taupe)
SOLE: EVA in Hot Pink (#FF69B4) (was: EVA in Dark Brown)

Keep all OTHER components exactly as shown in reference images.
The overall shoe silhouette/shape must remain unchanged.
```

The AI now receives a clear, unambiguous color instruction it can act on.

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Add `getColorDescription()` helper and use it in override loop |
| `src/lib/birkenstockMaterials.ts` | Add same helper and update `buildComponentOverridePrompt()` |

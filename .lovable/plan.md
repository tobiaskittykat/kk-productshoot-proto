

# Fix Confusing Remix Color/Material Override Prompts

## Problem

When changing shoe colors in the Remix flow, the prompt sent to the AI is bare-bones and confusing compared to the rich, structured prompt used in New Shoot. Specifically:

- **No contrast language**: Remix just says "upper: Hot Pink Suede" with no context about what the original was, making it ambiguous
- **No "Custom" hex resolution**: If a user picks a custom color via the color picker, the prompt may pass "Custom" literally instead of resolving it to a descriptive name like "Hot Pink (#FF69B4)"
- **No toe post synchronization**: For thong-style sandals (Gizeh, Ramses), the toe post color isn't synced with sole/buckle overrides
- **No buckle preservation instructions**: Missing the critical "change ONLY material/color, keep shape and inscriptions" guard
- **Missing original component context**: The AI doesn't know what it's changing FROM, so it can't properly differentiate

## Solution

Refactor the override prompt construction in the edge function so the remix path reuses the same detailed logic as New Shoot, adapted for the editing context.

## Changes

### File: `supabase/functions/generate-image/index.ts`

**Replace the bare-bones remix override block (lines 1128-1139)** with a proper override section that:

1. **Resolves custom hex colors to descriptive names** using the same `getColorDescription` helper already defined in the prompt agent path (lines 608-633). Extract this helper to a shared scope so both paths can use it.

2. **Uses contrast language** showing what changed: `"UPPER: Suede in Hot Pink (original was: Oiled Leather in Taupe)"` -- same format as the New Shoot path but adapted for the remix context.

3. **Includes toe post sync** for thong-style sandals when `originalComponents.strapConstruction === 'thong'`.

4. **Includes buckle shape/inscription preservation** when buckle overrides are present.

5. **Skips phantom overrides** -- if the original shoe doesn't have a component (e.g., no lining), don't inject an override for it.

Specifically:
- Move the `getColorDescription` helper function out of the prompt agent's closure (currently defined inside `craftPromptWithAgent` at ~line 608) to a module-level utility so it can be shared.
- Create a shared `buildOverrideLines(overrides, originalComponents)` function that returns an array of prompt lines, reusable by both the prompt agent path and the remix path.
- In the remix prompt block, call this shared function instead of the current bare-bones loop.

### No other files change

This is entirely an edge function prompt quality fix. The client-side code already sends `componentOverrides` and `originalComponents` correctly in the remix request body (via `buildRequestBody`).

## Before vs After (example)

**Before (confusing)**:
```
IMPORTANT COLOR/MATERIAL CHANGES: Apply these modifications to the 
replacement shoe -- upper: Hot Pink Suede. Use contrast language: 
render these instead of whatever the reference images show.
```

**After (clear)**:
```
=== PRODUCT COMPONENT OVERRIDES ===
The user has customized specific shoe components.
Apply these modifications to the replacement shoe while maintaining the original silhouette:

UPPER: Suede in Hot Pink (original was: Oiled Leather in Taupe)

TOE POST STRAP: Black (must match sole color exactly -- thong-style sandal)

BUCKLE SHAPE AND INSCRIPTIONS: Change ONLY the material and color.
The buckle SHAPE, SIZE, and any INSCRIBED TEXT must remain as shown in references.

Keep all OTHER components exactly as shown in reference images.
```

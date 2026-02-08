

# Add Toe Post Awareness to Shoe Component System

## Background

On Birkenstock thong-style sandals (Gizeh, Ramses, Mayari), there is a **toe post** -- the vertical strap between the big toe and second toe, with a small **pin/rivet** at its base.

Based on research of actual Birkenstock products:
- The **toe post strap** color follows the **sole** color (not the upper, as previously assumed)
- The **toe post pin/rivet** follows the **buckle** hardware color and finish

This means when users customize the sole color or buckle finish, the AI needs to know about these relationships to render the product correctly.

## Approach: Prompt Awareness (No New Component)

The toe post does not need its own standalone component in the UI because:
- Its strap color is always derived from the sole
- Its pin color is always derived from the buckles
- Users can already control both sole and buckle colors

Instead, we add **relationship rules** to the prompts so the AI correctly renders the toe post when generating images.

## Changes

### 1. `supabase/functions/analyze-shoe-components/index.ts`

Update the BUCKLES section of the system prompt to note that on thong-style sandals, the toe post pin is part of the buckle hardware system and should match.

Add a new general note about the toe post strap following the sole color.

```
**BUCKLES** (Optional - only if present)
Adjustment hardware on straps.
Types: Metal (brass/gold, silver, copper, antique brass) or Matte Plastic (EVA models)
Note: Some styles like the Boston clog have 1 buckle, Arizona has 2
Note for thong-style sandals (Gizeh, Ramses, Mayari): The small pin/rivet 
at the top of the toe post is part of the buckle hardware system. It should 
match the buckle finish (e.g., both brass, both silver). Report the buckle 
material/color to cover both the strap buckle AND the toe post pin.
```

Add a general note in the IMPORTANT section:

```
- For thong-style sandals: the toe post STRAP typically matches the SOLE color, 
  while the toe post PIN/RIVET matches the BUCKLE hardware finish.
```

### 2. `supabase/functions/interpret-shoe-customization/index.ts`

Add rule 16 to the system prompt:

```
16. For thong-style sandals (Gizeh, Ramses, Mayari): The toe post strap color 
    follows the SOLE color, and the toe post pin/rivet follows the BUCKLE hardware. 
    When changing sole color, the toe post strap automatically matches. 
    When changing buckle finish, the toe post pin automatically matches.
    No separate component needed.
```

### 3. `src/lib/birkenstockMaterials.ts`

In `buildComponentOverridePrompt()`, after listing all component overrides, add contextual notes:
- If sole overrides are present: `"Note: On thong-style sandals (Gizeh, Ramses, Mayari), the toe post strap matches the sole color."`
- If buckle overrides are present: `"Note: On thong-style sandals, the toe post pin/rivet matches the buckle finish."`

### 4. `supabase/functions/generate-image/index.ts`

In the component overrides section (around line 580), add the same toe post relationship notes when sole or buckle overrides are present, so the prompt agent knows to render the toe post accordingly.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-shoe-components/index.ts` | Add toe post notes to BUCKLES section and IMPORTANT section |
| `supabase/functions/interpret-shoe-customization/index.ts` | Add rule 16 about toe post relationships |
| `src/lib/birkenstockMaterials.ts` | Add conditional toe post notes in `buildComponentOverridePrompt()` |
| `supabase/functions/generate-image/index.ts` | Add toe post relationship notes to override prompt section |

## What This Achieves

- When a user changes the **sole** to white, the AI knows the toe post strap should also be white
- When a user changes the **buckle** to silver, the AI knows the toe post pin should also be silver
- Analysis correctly reports buckle hardware as covering the toe post pin
- No new UI components or database changes needed -- all handled through prompt intelligence



# Fix: Auto Background Should Randomly Pick a Specific Preset

## Root Cause

When the user selects "Auto (AI)" on the Outdoor tab, the system sends `outdoor-auto` as the `backgroundId`. Both the client-side prompt builder and the server-side `=== BACKGROUND/SETTING ===` section then inject a vague instruction like:

> "AI selects the most appropriate outdoor/natural background for this product"

This is too weak -- the Prompt Agent defaults to studio-like settings because "outdoor" isn't concrete enough to override its training bias toward clean product photography.

When the user selects a **specific** outdoor preset (e.g., `outdoor-park`), it works perfectly because the prompt contains vivid, concrete text like "wild meadow grass with wildflowers, dappled golden sunlight through mature trees."

## Solution

When `outdoor-auto` or `studio-auto` is received, **randomly pick a specific preset** from the matching category and use its full descriptive prompt. This gives the AI a concrete, vivid setting every time, while still providing variety across a batch.

### Changes

**File: `supabase/functions/generate-image/index.ts`**

1. Add two arrays of outdoor and studio preset keys extracted from the `backgroundPresets` object
2. In the `outdoor-auto` branch (~line 488), randomly select one key from the outdoor array and use `backgroundPresets[randomKey]` as the description
3. In the `studio-auto` branch (~line 484), randomly select one key from the studio array and use its description
4. Log which preset was randomly selected for debugging

**File: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`**

Same approach in all three prompt builders (`buildOnFootPrompt`, `buildProductFocusPrompt`, `buildLifestylePrompt`):

1. In the `outdoor-auto` branch, randomly pick from `outdoorBackgrounds` array (already imported) and use that preset's `.prompt` value
2. In the `studio-auto` branch, randomly pick from `studioBackgrounds` and use its `.prompt` value
3. Also resolve the appropriate weather/lighting for the randomly selected preset

This ensures both the inline prose prompt AND the server-side BACKGROUND/SETTING section contain the same concrete, vivid description -- matching the behavior that already works for specific presets.

### What stays the same

- The Auto (AI) tile UI and state management (still sends `outdoor-auto` / `studio-auto`)
- Specific preset selection (unchanged -- already works)
- Custom background prompt (unchanged)

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Randomly resolve `outdoor-auto` and `studio-auto` to a specific preset from the matching category |
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Same random resolution in all three prompt builder functions |


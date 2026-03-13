

# Rewrite Roulette Variation Tiers — Correct Definitions + Source Image Attachment Fix

## Problem

1. **Tier definitions are wrong**: The current descriptions and prompt instructions don't match what you actually want:
   - Close Recreation says "only footwear changes" — but you want slight angle variation too
   - Subtle Variation says "subtle pose shift" — but you want very different pose, similar background
   - Creative Reimagining says "bolder pose, dramatic angle" — but you want new model, new pose, same set/location showing different things

2. **Source image not properly attached**: In `generate-image/index.ts` (line 1590-1595), the roulette path attaches the source image but has NO framing instruction before it — unlike the remix path which says "Replace the shoes/footwear..." The model sees a bare image + prompt with no context on how to use it. This is why results look disconnected from the original.

## Solution

### 1. `supabase/functions/reference-roulette-prompts/index.ts` — Rewrite all tier prompts

**New tier definitions:**

- **Close Recreation (faithful)**: Same shoot, same everything — maybe a slightly different camera angle or the model shifted weight between frames. The grain, light, color grade, wardrobe, background are IDENTICAL. Like the next frame on the same roll of film.

- **Different Moment (moderate)**: Same session, same set, same lighting rig, same film stock — but a clearly different pose. Model has moved, weight shifted dramatically, hands repositioned. Background and atmosphere are identical. Like a shot from 5 minutes later in the same session.

- **Same Set, Fresh Take (creative)**: Same physical location/set, same lighting setup, same film stock and color grade — but a completely new composition. Could be a different model, a bold new pose, camera repositioned to show a different part of the set. Still unmistakably the same shoot day, same photographer, same campaign — but the hero editorial pick vs a test frame.

**Update `tierDescriptions` array** to match the new definitions.

**Update labels**: `Close Recreation` / `Different Moment` / `Same Set, Fresh Take`

### 2. `supabase/functions/generate-image/index.ts` (~lines 1588-1595) — Fix source image framing for roulette

Currently the roulette path just pushes the image with no instruction. Add a framing instruction identical in spirit to the remix path:

```typescript
if (body.skipPromptAgent && body.structuredPrompt && body.sourceImageUrl?.startsWith('http')) {
  messageContent.unshift(
    { type: "image_url", image_url: { url: body.sourceImageUrl } },
  );
  messageContent.unshift({
    type: "text",
    text: "This is the reference image from the photo session. Your edit must preserve its exact visual DNA — grain, color grade, film stock, lighting quality, and atmosphere. The prompt below describes what to change:"
  });
}
```

This tells the model HOW to use the attached image (as a style/session anchor), rather than leaving it ambiguous.

### 3. `src/components/creative-studio/product-shoot/RoulettePromptCards.tsx` — Update labels/descriptions

Update the `tierColors` icon mapping and ensure the card displays the new labels and descriptions from the response.

### 4. `src/components/creative-studio/product-shoot/types.ts` — No structural changes needed

The `RoulettePrompt` type already has `naturalPrompt`, `label`, `description` — the new labels/descriptions come from the edge function response.

### Files to change
1. **`supabase/functions/reference-roulette-prompts/index.ts`** — Rewrite all 4 prompt builders (faithful, moderate, creative, phase B) + update labels/descriptions
2. **`supabase/functions/generate-image/index.ts`** (~line 1588-1595) — Add framing instruction before source image in roulette path


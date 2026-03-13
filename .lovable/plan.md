

# Fix: Roulette variations produce identical images

## Root Cause

The roulette flow correctly generates 3 different structured JSON prompts (Faithful/Moderate/Creative with different poses, angles, compositions), and the `skipPromptAgent` bypass works — the JSON is used as the prompt text. **However**, the problem is in how the source image is sent to the image generator.

At line 1585-1596 of `generate-image/index.ts`, when `editMode: true`, the source image is prepended with:
```
"Edit the following image according to these instructions:"
```

This tells Gemini to treat the source as an **image-to-image edit target**, which anchors the output heavily to the original — same pose, same angle, same everything. The structured JSON differences between tiers are effectively ignored because the model prioritizes preserving the source image pixels.

For roulette mode, the source image should be sent as a **scene reference/inspiration** (not an edit target), so the model treats the structured JSON as the primary creative direction and uses the source only for scene context.

Additionally, the `remixRemoveText` flag is passed from the frontend but never injected into the structured prompt or the message content in the roulette code path. This explains why the Creative tier didn't remove the ad copy.

## Fix

**In `generate-image/index.ts` (~line 1584-1596)**, add a roulette-specific branch that changes how the source image is framed:

```typescript
// ROULETTE mode: source image = scene reference, not edit target
if (body.skipPromptAgent && body.structuredPrompt && body.sourceImageUrl?.startsWith('http')) {
  messageContent.unshift({
    type: "image_url",
    image_url: { url: body.sourceImageUrl }
  });
  let rouletteInstruction = "SCENE REFERENCE IMAGE: Use this image as visual inspiration for the scene, environment, and mood. Generate a NEW image following the structured JSON prompt below — do NOT simply edit or reproduce this image. The JSON prompt defines the exact pose, composition, camera angle, and creative direction to follow.";
  if (body.remixRemoveText) {
    rouletteInstruction += "\n\nIMPORTANT: Do NOT include any text, logos, watermarks, or ad copy in the generated image.";
  }
  messageContent.unshift({
    type: "text",
    text: rouletteInstruction
  });
}
// Existing editMode / remixMode handling (unchanged)
else if ((body.editMode || body.remixMode) && body.sourceImageUrl?.startsWith('http')) {
  // ... existing code ...
}
```

This single change does two things:
1. Reframes the source image as "inspiration" instead of "edit this" — letting the tier-specific JSON drive composition
2. Injects the text removal instruction when `remixRemoveText` is true

### Files to change
1. **`supabase/functions/generate-image/index.ts`** (~lines 1584-1596) — add roulette-specific source image framing before the existing editMode block




# Fix: Text Removal Not Working in Normal Remix Flow

## Problem

The `remixRemoveText` instruction is included in the **brief** passed to the remix prompt agent (visible in the logs as `TEXT REMOVAL: Remove any text...`). However, the prompt agent **summarizes it away** — the final refined prompt just says "Keep model, pose, background, lighting, composition identical. Only the shoes change." with zero mention of text removal.

The text removal instruction needs to be appended **after** the prompt agent runs, directly onto `refinedPrompt`, so the agent cannot drop it.

## Fix

**`supabase/functions/generate-image/index.ts`** (~line 1572, after `refinedPrompt` is set for all paths):

Add:
```typescript
// Append text removal AFTER prompt agent (agent tends to drop it)
if (body.remixRemoveText) {
  refinedPrompt += "\n\nCRITICAL: Remove ALL text, logos, watermarks, and ad copy overlaid on the image. Inpaint those areas seamlessly to match the surrounding background. The final image must contain zero overlaid text or graphics.";
}
```

This goes right after line 1572 (`console.log("[BG] Refined prompt:", refinedPrompt)` — actually just before it so the log shows the full final prompt). It covers all three paths: roulette, remix, and normal.

### Files to change
1. **`supabase/functions/generate-image/index.ts`** — append `remixRemoveText` instruction to `refinedPrompt` after it is finalized (line ~1572)


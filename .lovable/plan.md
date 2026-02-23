

# Dedicated Remix Prompt Agent

## Problem
The Remix flow sends a flat, mechanical prompt with raw section headers (`=== PRODUCT COMPONENT OVERRIDES ===`) directly to the image model. Meanwhile, "New Shoot" gets a rich narrative prompt via the Prompt Agent. Reusing the full creative director agent is overkill for remix — it's designed for from-scratch scene descriptions with moodboards, visual worlds, campaigns, etc. Remix just needs a focused editing instruction with the product described first and overrides woven in naturally.

## Solution
Create a lightweight **Remix Prompt Agent** — a simpler system prompt and a dedicated brief builder, both inside `generate-image/index.ts`. No new edge function needed; just a new function `craftRemixPromptWithAgent()` that:

1. Builds a remix-specific brief (product identity + components + overrides + branding — no moodboard/campaign/visual world noise)
2. Calls the AI with a short, focused system prompt that says "you write image editing instructions"
3. Returns a narrative editing prompt starting with product description

## Changes

### File: `supabase/functions/generate-image/index.ts`

**1. New function: `craftRemixPromptWithAgent()`**

A simplified version of `craftPromptWithAgent()` with:
- A short system prompt (~300 words vs ~2000) focused on editing instructions
- Brief structure: Product Identity first, then base components, then overrides with contrast language, then branding details, then text removal if requested
- No moodboard, visual world, campaign concept, content pillars, audience, or shot-type sections

System prompt essence:
```
You craft image EDITING prompts for footwear replacement on existing photos.

RULES:
1. Start with "Edit this image:" 
2. Lead with the replacement product description (brand, model, material, color, silhouette)
3. Describe component overrides as natural material/color changes, not raw data
4. Include branding details (buckle engravings, footbed stamps) woven into prose
5. End with: keep model, pose, background, lighting, composition identical
6. Output ONLY the editing prompt — no headers, no bullet points

PRODUCT FIDELITY:
- Replacement must match reference images exactly
- Preserve silhouette, hardware placement, proportions
- When overrides exist, describe ONLY what changes and emphasize unchanged parts stay as-is
```

**2. Replace remix prompt block (lines 1191-1222)**

Instead of building flat `remixParts` array, call `craftRemixPromptWithAgent()`:

```typescript
if (body.remixMode) {
  refinedPrompt = await craftRemixPromptWithAgent(body, apiKey);
  console.log("[BG] Remix mode — used remix prompt agent");
}
```

**3. Brief builder: `buildRemixBrief()`**

Structured sections in priority order:
1. **Product Identity** — brand, model, material, color (reflecting overrides if present)
2. **Base Components** — all original materials from analysis
3. **Component Changes** — override contrast lines (reuse `buildOverrideLines()` output but strip raw headers)
4. **Branding** — buckle engravings, footbed stamps (from `originalComponents.branding`)
5. **Sample Swatches** — note which components have attached swatch images
6. **Text Removal** — if `remixRemoveText` is true

No campaign, moodboard, visual world, audience, or shot-type sections.

## What This Produces

Before (current flat prompt):
```
Edit this image: replace the footwear/shoes with the EXACT product...

=== PRODUCT COMPONENT OVERRIDES ===
The user has customized specific shoe components.
Apply these modifications while maintaining the original silhouette:

UPPER: Suede in Coral (original was: Suede in Tobacco Brown)
HEELSTRAP: Suede in Coral (original was: Oiled Leather in Tobacco Brown)

Keep all OTHER components exactly as shown in reference images.

The replacement product is: Birkenstock Tokyo in Brown Suede.
```

After (agent-crafted narrative):
```
Edit this image: replace the footwear with the Birkenstock Tokyo clog in warm coral suede. The upper and heel strap should both be rendered in a soft coral-toned suede, replacing the original tobacco brown. All other components — the contoured cork-latex footbed, the flexible EVA sole, and the adjustable buckle hardware with its embossed "BIRKENSTOCK" lettering — must remain exactly as shown in the reference images. Maintain the identical model pose, background setting, lighting, and composition. Only the shoes change.
```

## Files Summary

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Add `craftRemixPromptWithAgent()` + `buildRemixBrief()` functions; replace flat remix prompt block with agent call |

No new files, no database changes, no frontend changes.



# Roulette Variations: Natural Language Prompts from Phase A/B + Edit-mode Framing

## Problem
1. The roulette pipeline generates **raw JSON** prompts — the image model works far better with natural language prose (as proven by the normal shoot and remix flows)
2. The source image is framed as "scene reference, generate NEW" — which throws away the campaign's visual DNA (grain, color grade, vintage feel, lighting)
3. No language telling the model "same photo session, different moment"

## Solution

Rewrite the `reference-roulette-prompts` edge function to produce **natural language "Edit this image:" prompts** directly (no Phase C needed). In `generate-image`, use the same edit-target framing as remix mode.

### 1. `supabase/functions/reference-roulette-prompts/index.ts` — Full rewrite of prompts

**Phase A** — Change all 3 system prompts from "return JSON" to "return a natural language editing prompt":

- **Faithful**: "Analyze this image forensically. Write an 'Edit this image:' prompt that recreates this EXACT shot — same pose, same angle, same framing, same lighting, same grain, same color grade. Only the footwear changes. The result must be indistinguishable from the original session."

- **Moderate**: "Analyze this image. Write an 'Edit this image:' prompt for a different moment from the SAME photo session. Same model, same location, same lighting setup, same film stock/grain. But: slightly different pose (shift weight, alter hand placement), marginally different camera angle or framing. The visual DNA (color grade, grain, mood) must be identical."

- **Creative**: "Analyze this image. Write an 'Edit this image:' prompt for a bold editorial shot from the SAME campaign session. Same model, same location DNA, same lighting rig and film stock. But: dramatically different pose, bolder camera angle, more artistic framing. The grain, color rendering, and atmosphere must still feel like the same shoot."

All three prompts should:
- Start output with "Edit this image:"
- Describe what they SEE in rich sensory prose (not JSON)
- Include camera/lens/film stock details naturally woven in
- Set `clothing.footwear` to a placeholder like "[PRODUCT — see Phase B]"
- Return plain text, not JSON

**Phase B** — Change from "edit JSON fields" to "rewrite the prompt with product integrated":

System prompt becomes: "You receive a natural language image editing prompt and product details. Rewrite the prompt to integrate the product into the footwear description. Keep EVERYTHING else identical — same prose, same mood, same camera details. Only replace the footwear placeholder with a rich description of the actual product. Output the final editing prompt only — no headers, no explanation."

**Response format** changes from `{ structured, prompt }` to `{ naturalPrompt }` per tier:
```
{
  prompts: [
    { tier: "faithful", label: "Close Recreation", description: "...", naturalPrompt: "Edit this image: ..." },
    { tier: "moderate", label: "Subtle Variation", description: "...", naturalPrompt: "Edit this image: ..." },
    { tier: "creative", label: "Creative Reimagining", description: "...", naturalPrompt: "Edit this image: ..." }
  ]
}
```

### 2. `supabase/functions/generate-image/index.ts` (~lines 1559-1597)

- **Prompt selection**: Use `body.structuredPrompt.naturalPrompt` (or fall back to stringified structured) as `refinedPrompt`
- Append `remixRemoveText` instruction if set
- **Source image framing**: Use the SAME framing as remix mode — no special "scene reference" instruction. The prompt itself starts with "Edit this image:" which is sufficient. Remove the current roulette-specific block (lines 1584-1597) and let it fall through to the existing editMode block.

### 3. `src/hooks/useImageGeneration.ts` (~line 532-541)

- Pass `structuredPrompt` with the `naturalPrompt` field
- Set `prompt` to `roulettePrompt.naturalPrompt` instead of `JSON.stringify`

### 4. `src/components/creative-studio/product-shoot/RoulettePromptCards.tsx`

- Display/edit `naturalPrompt` in the textarea (not JSON)
- Label changes from "Advanced: Edit JSON prompt" to "Edit prompt"
- Update `RoulettePrompt` type: add `naturalPrompt: string`, keep `prompt` for backward compat

### 5. `src/components/creative-studio/product-shoot/types.ts`

- Update `RoulettePrompt` type to include `naturalPrompt`

### 6. `src/components/creative-studio/product-shoot/RemixStep2.tsx`

- Update where roulette response is mapped to include `naturalPrompt`

### Data flow after fix
```text
Phase A: Scene image → 3 natural language "Edit this image:" prompts (footwear placeholder)
Phase B: Inject product details → 3 final "Edit this image:" prompts with real product
         ↓
Frontend shows natural language in editable cards
         ↓
generate-image receives natural language prompt
  → source image framed as edit target (same as remix)
  → model preserves grain, color grade, mood, film stock
  → tier controls how much pose/angle/framing changes
```


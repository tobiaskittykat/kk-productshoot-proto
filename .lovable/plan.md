
# Enhanced Product Reference Language in Prompt Agent

## Summary

Update the prompt agent instructions to explicitly teach it to reference the attached images when describing specific product features. Instead of just saying "tobacco brown suede", the agent will say "tobacco brown suede exactly as shown in the reference images".

---

## The Enhancement

Currently, the prompt agent is told to:
- Preserve exact visual details
- Match proportions and silhouette
- Describe products visually

**Missing**: The agent isn't instructed to **linguistically tie** each feature description back to the reference images.

---

## Changes

### File: `supabase/functions/generate-image/index.ts`

**Location**: Lines 569-580 (the PRODUCT FIDELITY instruction block after images are attached)

**Current text:**
```typescript
text: `⚠️ PRODUCT FIDELITY IS CRITICAL: The above ${attachCount} image(s) are PRODUCT REFERENCES...

MANDATORY REQUIREMENTS:
- Preserve EXACT visual details: materials, textures, colors, hardware finishes
- Match proportions and silhouette precisely  
- Render hardware (clasps, chains, buckles, magnetic closures) with photographic accuracy
- Do NOT simplify, reimagine, or take creative liberties with these products
- The products should look like they were photographed, not illustrated or reinterpreted
- If the product has croc-embossed leather, show croc-embossed leather. If it has a gold chain, show a gold chain.`
```

**Updated text:**
```typescript
text: `⚠️ PRODUCT FIDELITY IS CRITICAL: The above ${attachCount} image(s) are PRODUCT REFERENCES showing different angles of the same product.

MANDATORY REQUIREMENTS:
- Preserve EXACT visual details: materials, textures, colors, hardware finishes
- Match proportions and silhouette precisely  
- Render hardware (clasps, chains, buckles, magnetic closures) with photographic accuracy
- Do NOT simplify, reimagine, or take creative liberties with these products
- The products should look like they were photographed, not illustrated or reinterpreted

⚠️ REFERENCE-LINKED DESCRIPTIONS (CRITICAL):
When describing ANY product feature in your prompt, explicitly tie it to the reference images. Examples:
- Instead of "tobacco brown suede" → "tobacco brown suede exactly as shown in the reference images"
- Instead of "gold buckle hardware" → "gold buckle hardware matching the attached reference photos precisely"
- Instead of "cork footbed" → "signature cork footbed identical to the reference images in color and texture"
- Instead of "shearling lining" → "warm shearling lining exactly as visible in the product reference images"

This reference-linking applies to ALL visual features:
- Color: "...in the exact shade of taupe visible in the reference images"
- Material: "...genuine suede with the precise nap and texture shown in the attached photos"
- Hardware: "...adjustable buckle in the same brushed silver finish as the reference"
- Interior: "...wool lining matching the cream color and pile height from the reference images"
- Silhouette: "...maintaining the exact proportions and shape shown in the attached product photos"

Your prompt MUST include at least 2-3 explicit references to "the reference images" or "attached photos" when describing product details. This ensures the image generator knows to prioritize visual accuracy over interpretation.`
```

---

## Also Update Final Instruction (Line 584-587)

**Current:**
```typescript
text: `Craft a single, evocative image generation prompt from this creative brief. Describe products visually based on the reference images above with EXACT accuracy.`
```

**Updated:**
```typescript
text: `Craft a single, evocative image generation prompt from this creative brief. When describing the product, explicitly reference the attached images for color, material, texture, and all visual details - use phrases like "exactly as shown in the reference images" and "matching the attached product photos precisely". This applies to ALL shot types.`
```

---

## Example Output Change

**Before (current behavior):**
> A high-resolution lifestyle photograph featuring Birkenstock Boston clogs in tobacco brown suede with signature cork footbed and adjustable buckle...

**After (with reference-linking):**
> A high-resolution lifestyle photograph featuring Birkenstock Boston clogs in tobacco brown suede exactly as shown in the reference images, with the signature cork footbed matching the warm honey tone visible in the attached photos, and adjustable silver buckle hardware identical to the reference...

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/generate-image/index.ts` | Update the PRODUCT FIDELITY instruction block (lines 569-580) and final instruction (lines 584-587) |

---

## Technical Details

The changes are purely to the text content of the prompt agent instructions. No structural code changes are needed - just updating two text strings in the `promptAgentContent` array.


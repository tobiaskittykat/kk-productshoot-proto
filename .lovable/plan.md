
# Add Explicit Birkenstock Mention to Shot Type Prompts

## Current State

Both prompts reference Birkenstock in the framing/composition context:
- **On-Foot**: "Similar to standard Birkenstock/premium footwear product-on-model photography"
- **Lifestyle**: "Similar to classic Birkenstock lookbook imagery"

But the **PRODUCT INTEGRITY** sections don't explicitly state that the product IS a Birkenstock shoe - they just say "the footwear must match the reference".

## Problem

The AI image generation model doesn't know it's generating **Birkenstock footwear** specifically. Adding this context will help the model understand the brand aesthetic and product characteristics.

## Solution

Update both prompt builders to explicitly mention "Birkenstock" in the PRODUCT INTEGRITY section.

## File to Modify

`src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

## Changes

### 1. buildOnFootPrompt (lines 156-162)

**Before:**
```typescript
sections.push("PRODUCT INTEGRITY (CRITICAL):");
sections.push("- The footwear must match the reference EXACTLY in shape, materials, proportions");
sections.push("- Preserve exact buckle placement, sole thickness, hardware finish");
sections.push("- No reinterpretation, no added elements, no modifications");
sections.push("- Capture visible texture: suede nap, leather grain, cork texture, sole grooves");
```

**After:**
```typescript
sections.push("PRODUCT INTEGRITY (CRITICAL):");
sections.push("- The model wears Birkenstock footwear - match the reference EXACTLY");
sections.push("- Preserve exact Birkenstock silhouette, buckle placement, sole thickness, hardware finish");
sections.push("- Maintain signature Birkenstock details: cork-latex footbed, contoured sole, adjustable strap");
sections.push("- No reinterpretation, no added elements, no modifications");
sections.push("- Capture visible texture: suede nap, leather grain, cork texture, sole grooves");
```

### 2. buildLifestylePrompt (lines 387-394)

**Before:**
```typescript
sections.push("PRODUCT INTEGRITY (CRITICAL - LOCKED):");
sections.push("- The footwear must match the reference EXACTLY in shape, materials, proportions");
sections.push("- Preserve exact buckle placement, sole thickness, hardware finish");
sections.push("- Natural cork-latex footbed, EVA outsole visible");
sections.push("- No shearling, no lining, no extra padding, no reinterpretation");
sections.push("- The shoe must remain IDENTICAL across all generated images");
```

**After:**
```typescript
sections.push("PRODUCT INTEGRITY (CRITICAL - LOCKED):");
sections.push("- The model wears Birkenstock footwear - match the reference EXACTLY");
sections.push("- Preserve exact Birkenstock silhouette, buckle placement, sole thickness, hardware finish");
sections.push("- Maintain signature Birkenstock details: natural cork-latex footbed, contoured sole, EVA outsole");
sections.push("- No shearling, no lining, no extra padding, no reinterpretation");
sections.push("- The Birkenstock shoe must remain IDENTICAL across all generated images");
```

## Result

Both prompts will now explicitly tell the AI:
1. The product is **Birkenstock footwear**
2. It should preserve **signature Birkenstock details**
3. The **Birkenstock shoe** must remain identical

This gives the AI model better context about the brand and its distinctive design language.

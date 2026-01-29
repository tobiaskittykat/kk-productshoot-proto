

# Add Embossed/Engraved Logo Text Accuracy to Product Integrity

## Summary

Enhance the PRODUCT INTEGRITY sections across all Product Shoot prompts to explicitly require 100% accurate reproduction of embossed and engraved logos, brand text, and markings on Birkenstock footwear. Also update the prompt agent instructions to preserve these sections and emphasize text accuracy.

---

## What We're Adding

Birkenstock footwear contains several branded elements that must be accurately reproduced:
- "BIRKENSTOCK" embossed on the footbed
- "Made in Germany" text on sole/footbed
- Logo markings on buckles
- Size/style text stamps
- Any engraved hardware details

---

## Part 1: Update PRODUCT INTEGRITY Sections

### File: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

#### On-Foot Shot (lines 326-333)

Add new bullet point for logo/text accuracy:

```
=== PRODUCT INTEGRITY (CRITICAL) ===
⚠️ ABSOLUTE PRIORITY: The footwear must match the reference images EXACTLY.
• This is Birkenstock footwear - preserve the iconic brand identity
• Match the exact silhouette, buckle placement, strap width, sole thickness
• Maintain signature Birkenstock details: cork-latex footbed, contoured sole, adjustable strap
• Capture authentic material textures: suede nap, cork grain, metal buckle finish
• LOGO & TEXT ACCURACY: Reproduce all embossed, engraved, or stamped brand markings with 100% accuracy - "BIRKENSTOCK" text, buckle logos, footbed stamps must be letter-perfect
• NO reinterpretation, NO modifications, NO creative liberties with the product
• The shoe's geometry and construction must remain identical in every generation
```

#### Product Focus Shot (lines 491-498)

Add same bullet point:

```typescript
sections.push("- LOGO & TEXT ACCURACY: Reproduce all embossed, engraved, or stamped brand markings with 100% accuracy - 'BIRKENSTOCK' text, buckle logos, footbed stamps must be letter-perfect");
```

#### Full Body Shot (lines 746-753)

Add same bullet point (identical to On-Foot).

---

## Part 2: Update Prompt Agent Instructions

### File: `supabase/functions/generate-image/index.ts` (lines 483-489)

Update rule #3 to include logo accuracy and add instruction to preserve PRODUCT INTEGRITY section:

```typescript
3. **⚠️ PRODUCT INTEGRITY IS CRITICAL** - When product reference images are provided:
   - DESCRIBE the products visually in your prompt with EXACT detail
   - Include: material (leather, croc-embossed, smooth, pebbled), color, hardware finish (gold, silver, gunmetal)
   - Include: silhouette/type (crossbody, clutch, card holder, phone case), and key details (chain strap, magnetic closure, zip)
   - **LOGO & TEXT FIDELITY**: All embossed, engraved, or stamped brand text/logos must be reproduced with 100% accuracy - no misspellings, no altered letterforms
   - Example: Instead of "the Remi Magnet crossbody", write "a black croc-embossed leather phone crossbody with a detachable gold chain strap and magnetic gold hardware closure"
   - This visual description ensures the image generator renders the product EXACTLY as it appears
   - Do NOT use product names - use VISUAL DESCRIPTIONS only
   
   **IMPORTANT FOR PRODUCT SHOOTS**: If the brief contains a "=== PRODUCT INTEGRITY (CRITICAL) ===" section, 
   you MUST include this EXACT section at the START of your output, preserving the header and all bullet points verbatim.
   This is an EXCEPTION to the "no section headers" rule - product integrity instructions are non-negotiable.
```

Also update rule #13 to clarify the exception:

```typescript
13. **NEVER ECHO SECTION HEADERS** - Do NOT start your prompt with labels like "Product Focus:", "Product Category:", "Visual World:", "Campaign Concept:", etc. Start DIRECTLY with the image description.
    **EXCEPTION**: The "=== PRODUCT INTEGRITY (CRITICAL) ===" section must be preserved verbatim when present in the brief.
```

### File: `src/lib/defaultPrompts.ts` (lines 68-74, 99)

Apply the same updates to `DEFAULT_PROMPT_AGENT_PROMPT` for consistency when brand-level custom prompts are used.

---

## Final PRODUCT INTEGRITY Block (All Shot Types)

```text
=== PRODUCT INTEGRITY (CRITICAL) ===
⚠️ ABSOLUTE PRIORITY: The footwear must match the reference images EXACTLY.
• This is Birkenstock footwear - preserve the iconic brand identity
• Match the exact silhouette, buckle placement, strap width, sole thickness
• Maintain signature Birkenstock details: cork-latex footbed, contoured sole, adjustable strap
• Capture authentic material textures: suede nap, cork grain, metal buckle finish
• LOGO & TEXT ACCURACY: Reproduce all embossed, engraved, or stamped brand markings 
  with 100% accuracy - "BIRKENSTOCK" text, buckle logos, footbed stamps must be letter-perfect
• NO reinterpretation, NO modifications, NO creative liberties with the product
• The shoe's geometry and construction must remain identical in every generation
```

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Add "LOGO & TEXT ACCURACY" bullet to all 3 PRODUCT INTEGRITY sections |
| `supabase/functions/generate-image/index.ts` | Update rule #3 with logo fidelity + add PRODUCT INTEGRITY preservation instruction; update rule #13 with exception |
| `src/lib/defaultPrompts.ts` | Same updates for consistency |

---

## Why This Matters

AI image generators often struggle with text reproduction:
- Letters can be misspelled or malformed
- Logo proportions can be distorted
- Text can appear blurry or illegible

By explicitly calling out that brand text must be "letter-perfect", we give the image model stronger guidance to pay attention to these fine details.


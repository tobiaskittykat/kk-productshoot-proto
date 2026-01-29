
# Improve Prompt Agent Instructions for Product Integrity

## Summary

Two changes to how the prompt agent handles product integrity and naming:
1. **Remove hardcoded PRODUCT INTEGRITY section** from shot type prompts → teach the prompt agent to naturally emphasize product fidelity in its evocative output
2. **Include brand & model name** in the creative brief → let the agent mention "Birkenstock Boston" for better product identity recognition

---

## Current Problems

### Problem 1: Ugly Section Headers in Prompts

The current prompts include literal section headers like:

```
=== PRODUCT INTEGRITY (CRITICAL) ===
⚠️ ABSOLUTE PRIORITY: The footwear must match the reference images EXACTLY.
• This is Birkenstock footwear...
```

The prompt agent is instructed to "preserve this section verbatim" - creating non-evocative, technical prompts.

### Problem 2: Brand/Model Name Suppressed

The prompt agent instruction explicitly says:
> "Do NOT use product names - use VISUAL DESCRIPTIONS only"

This prevents the agent from writing "Birkenstock Boston" which would actually help the image generator understand the iconic product.

---

## Solution

### Part 1: Remove Hardcoded Product Integrity Section

**Files to modify:**
- `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`
- `supabase/functions/generate-image/index.ts`
- `src/lib/defaultPrompts.ts`

**Changes:**

1. **Remove the `=== PRODUCT INTEGRITY (CRITICAL) ===` section** from all shot type prompt builders:
   - `buildOnFootPrompt()` 
   - `buildProductFocusPrompt()`
   - `buildLifestylePrompt()`

2. **Update the prompt agent system prompt** to naturally emphasize product integrity without requiring echoed section headers

**Before (in shotTypeConfigs.ts, lines 326-334):**
```typescript
=== PRODUCT INTEGRITY (CRITICAL) ===
⚠️ ABSOLUTE PRIORITY: The footwear must match the reference images EXACTLY.
• This is Birkenstock footwear - preserve the iconic brand identity
...
```

**After:**
Remove this block entirely from the prompt builders. The prompt agent instructions will handle emphasizing product integrity naturally.

---

### Part 2: Pass Brand & Model Information

**File to modify:**
- `supabase/functions/generate-image/index.ts`
- `src/hooks/useImageGeneration.ts`

**Changes:**

1. **Fetch and pass SKU description data** (brand, model, colors, materials) to the edge function
2. **Add a new section in the creative brief** with product identity:
   ```
   === PRODUCT IDENTITY ===
   Brand: Birkenstock
   Model: Boston
   Color: Taupe
   Material: Suede
   Type: Clog
   ```

3. **Update prompt agent instructions** to INCLUDE brand and model name (not suppress them), while still emphasizing visual accuracy.

---

### Part 3: Update Prompt Agent Instructions

**Files:**
- `supabase/functions/generate-image/index.ts` (default system prompt)
- `src/lib/defaultPrompts.ts` (default templates)

**Key changes to the prompt agent system prompt:**

1. **Remove** the instruction:
   > "Do NOT use product names - use VISUAL DESCRIPTIONS only"

2. **Replace with:**
   > "INCLUDE the brand name (e.g., Birkenstock) and model name (e.g., Boston) to ensure the image generator understands the iconic product identity. Also describe the product visually with EXACT detail."

3. **Remove** the instruction about preserving `=== PRODUCT INTEGRITY ===` sections verbatim

4. **Add** instruction:
   > "Product integrity is CRITICAL. Your final prompt must emphasize that the footwear matches reference images EXACTLY - silhouette, hardware, materials. Weave this emphasis naturally into your evocative prompt rather than using section headers."

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Remove `=== PRODUCT INTEGRITY ===` blocks from all 3 prompt builders |
| `src/hooks/useImageGeneration.ts` | Fetch and pass SKU description (brand, model, color, material) |
| `supabase/functions/generate-image/index.ts` | Add `=== PRODUCT IDENTITY ===` section with brand/model; update prompt agent instructions |
| `src/lib/defaultPrompts.ts` | Update `DEFAULT_PROMPT_AGENT_PROMPT` with new product integrity approach |

---

## Expected Outcome

**Before (current prompt output):**
```
=== PRODUCT INTEGRITY (CRITICAL) ===
⚠️ ABSOLUTE PRIORITY: The footwear must match the reference images EXACTLY.
• This is Birkenstock footwear - preserve the iconic brand identity...

A close-up on-model product shot of a female model wearing a suede clog...
```

**After (improved evocative prompt):**
```
A close-up on-model product shot of a female model wearing the iconic Birkenstock Boston clog in taupe suede, photographed against a pure white seamless studio background...

The shoe must be rendered with absolute fidelity to the reference images - the distinctive Boston silhouette with its rounded closed toe, the soft suede upper with visible nap texture, the signature cork-latex footbed in warm brown tones, the adjustable metal buckle in brushed finish, and the EVA outsole with its characteristic tread pattern...
```

This approach:
- Includes brand name "Birkenstock" and model "Boston"
- Emphasizes product integrity naturally within evocative language
- Removes ugly section headers from final output
- Maintains strict fidelity requirements while being more prompt-friendly

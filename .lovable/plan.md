

# Fix: Always Attach References to Prompt Agent + Clarify Overrides

## Problem Summary

Currently, the "Attach Reference Images" toggle controls **both** the Prompt Agent and the Image Generator. When toggled OFF:
- The Prompt Agent writes the image prompt **blind** - it can't see the product, so it can't accurately describe unchanged features (buckle shape, footbed texture, sole pattern)
- This defeats the purpose of testing "prompt-only" generation because the prompt itself is of lower quality

## Proposed Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                     PROMPT AGENT (Gemini 2.5 Flash)             │
│                                                                 │
│   ALWAYS receives:                                              │
│   • Creative brief (text)                                       │
│   • Product reference images (up to 10 angles)                  │
│   • Component overrides if any                                  │
│                                                                 │
│   Outputs: Rich, accurate text prompt with explicit             │
│            reference-linked descriptions                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  IMAGE GENERATOR (Gemini 3 Pro)                 │
│                                                                 │
│   ALWAYS receives:                                              │
│   • Refined text prompt from Prompt Agent                       │
│   • Moodboard image (if provided)                               │
│                                                                 │
│   CONDITIONALLY receives (based on toggle):                     │
│   • Product reference images (when toggle ON)                   │
│   • Skip product images (when toggle OFF)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Key Insight: Override Clarity

When there ARE component overrides (e.g., Hot Pink upper instead of Taupe), the Prompt Agent needs special instructions:

**Current behavior**: Just lists the override in the brief
**Proposed behavior**: Agent sees BOTH the original photos AND the overrides, and is instructed to write:

> "The Boston clog features a **Hot Pink suede upper** (NOTE: this differs from the Taupe shown in the reference photos - render the Hot Pink color, not the original), with the buckle, footbed, and sole **exactly as shown in the attached reference images**"

This makes it crystal clear to the Image Generator what to change vs. what to keep.

---

## Technical Changes

### File: `supabase/functions/generate-image/index.ts`

**Change 1: Always attach images to Prompt Agent** (around lines 650-696)

```typescript
// ALWAYS attach product images to prompt agent for accurate description
// The agent needs to SEE the product to describe unchanged features accurately
// The toggle only controls whether the IMAGE GENERATOR sees them
const productUrls = (request.productReferenceUrls || [])
  .filter((url) => url && url.startsWith("http") && !url.toLowerCase().includes(".gif"));

if (productUrls.length > 0) {
  const attachCount = Math.min(productUrls.length, 10);
  console.log(`Adding ${attachCount} product images to prompt agent for visual analysis (always attached)`);
  for (const url of productUrls.slice(0, attachCount)) {
    promptAgentContent.push({
      type: "image_url",
      image_url: { url }
    });
  }
  
  // Determine if user has overrides or disabled reference attachment
  const hasOverrides = request.componentOverrides && 
    Object.keys(request.componentOverrides).length > 0;
  const refImagesDisabled = request.attachReferenceImages === false;
  
  // Build contextual instruction based on state
  let fidelityInstruction = `⚠️ PRODUCT FIDELITY IS CRITICAL: The above ${attachCount} image(s) are PRODUCT REFERENCES...`;
  
  if (hasOverrides) {
    fidelityInstruction += `

⚠️ COMPONENT OVERRIDE MODE:
The user has CHANGED specific components (see PRODUCT COMPONENT OVERRIDES in brief).
- For CHANGED components: Describe the NEW color/material specified in the override, NOT what's in the photos
- For UNCHANGED components: Describe EXACTLY as shown in the reference photos
- Use explicit contrast language like: "Hot Pink suede upper (instead of the Taupe shown in references)"
- Make it CLEAR what differs from the reference photos vs what matches them`;
  }
  
  if (refImagesDisabled) {
    fidelityInstruction += `

⚠️ PROMPT-ONLY GENERATION MODE:
The Image Generator will NOT receive these reference images - only your text prompt.
- Your descriptions must be EXCEPTIONALLY detailed and precise
- Include every visual detail: exact colors, textures, hardware finishes, proportions
- The image model will rely 100% on your text to recreate this product accurately`;
  }
  
  promptAgentContent.push({ type: "text", text: fidelityInstruction });
}
```

**Change 2: Keep Image Generator logic as-is** (lines 993-1026)

No changes needed here - the toggle already correctly controls whether product images are attached to the final generation.

---

## Data Flow After Fix

### Scenario A: Toggle ON, No Overrides (Normal)
```text
Prompt Agent sees: Photos + Brief
Prompt Agent writes: "...cork footbed exactly as shown in reference images..."
Image Generator sees: Prompt + Photos
Result: Maximum fidelity ✓
```

### Scenario B: Toggle OFF, No Overrides (Prompt-Only Test)
```text
Prompt Agent sees: Photos + Brief + "PROMPT-ONLY MODE" note
Prompt Agent writes: "...natural cork footbed with visible grain pattern, cream-toned..." (extra detail)
Image Generator sees: Prompt ONLY (no photos)
Result: Tests prompt quality without visual crutch ✓
```

### Scenario C: Toggle ON, WITH Overrides (Custom Colorway)
```text
Prompt Agent sees: Photos + Brief + Overrides + "OVERRIDE MODE" note
Prompt Agent writes: "...Hot Pink suede upper (instead of Taupe in photos), but matching the silver buckle exactly as shown..."
Image Generator sees: Prompt + Photos (of original colorway)
Result: Clear instruction to change specific parts ✓
```

### Scenario D: Toggle OFF, WITH Overrides
```text
Prompt Agent sees: Photos + Brief + Overrides + BOTH notes
Prompt Agent writes: Extremely detailed description with explicit contrast language
Image Generator sees: Prompt ONLY
Result: Maximum prompt precision for custom colorway ✓
```

---

## Expected Result

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| Toggle OFF | Prompt Agent blind → vague descriptions | Agent sees photos → precise descriptions |
| With overrides | Basic "was X, now Y" list | Explicit "render Y instead of X shown in photos" |
| Prompt-only + overrides | Double-blind (worst case) | Agent fully informed, writes detailed prompt |

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | 1. Always attach images to Prompt Agent (remove toggle check for agent)<br>2. Add contextual instructions for override mode and prompt-only mode |


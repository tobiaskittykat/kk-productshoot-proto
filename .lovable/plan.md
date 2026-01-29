
# Highlight Birkenstock Logos in Prompt Agent

## Summary

Two changes to give Birkenstock logos (embossed and engraved) special prominence:
1. **Enhance prompt agent instructions** to specifically call out the Birkenstock wordmark/logos as a critical product integrity element
2. **Instruct the agent to emphasize logos in the final prompt** so the image generator pays extra attention to reproducing them faithfully

---

## What's Changing

### File: `src/lib/defaultPrompts.ts`

**Current logo mention (line 73):**
```
- **LOGO & TEXT FIDELITY**: All embossed, engraved, or stamped brand text/logos must be reproduced with 100% accuracy
```

**Enhanced version:**
```
- **⚠️ BIRKENSTOCK LOGO FIDELITY (CRITICAL)**:
  - The embossed "BIRKENSTOCK" wordmark on the footbed and the engraved "Birkenstock" on the buckle are signature brand identifiers
  - These logos MUST be clearly visible and accurately reproduced in every product shot
  - Pay special attention to: the classic serif typography, correct letter spacing, proper placement on footbed and buckle
  - Your final prompt MUST explicitly describe and emphasize these logo elements to ensure the image generator renders them faithfully
```

### File: `supabase/functions/generate-image/index.ts`

The same enhancement will be applied to the inline system prompt (around line 512) to ensure consistency.

---

## The Updated Prompt Agent Instruction Block

```text
3. **⚠️ PRODUCT INTEGRITY IS CRITICAL** - When product reference images are provided:
   - **INCLUDE brand name and model name** (e.g., "Birkenstock Boston", "Nike Air Max") when provided in PRODUCT IDENTITY section
   - ALSO describe the products visually in your prompt with EXACT detail
   - Include: material (leather, suede, croc-embossed), color, hardware finish (gold, silver, brushed metal)
   - Include: silhouette/type (clog, sandal, crossbody), and key details (cork footbed, adjustable buckle, chain strap)
   
   **⚠️ BIRKENSTOCK LOGO FIDELITY (CRITICAL)**:
   - The embossed "BIRKENSTOCK" wordmark on the footbed and the engraved "Birkenstock" on the buckle are signature brand identifiers
   - These logos MUST be clearly visible and accurately reproduced in every product shot
   - Pay special attention to: the classic serif typography, correct letter spacing, proper placement on footbed and buckle
   - Your final prompt MUST explicitly describe and emphasize these logo elements to ensure the image generator renders them faithfully
   
   - **EMPHASIZE PRODUCT FIDELITY NATURALLY**: Weave product integrity requirements into your evocative description. The product must match reference images EXACTLY - same silhouette, same hardware placement, same materials, same branding. Make this emphasis feel natural, not like a checklist.
```

---

## Expected Prompt Output

**Before:**
```
...the iconic Birkenstock Boston clog in taupe suede, featuring the signature cork-latex footbed, adjustable metal buckle strap, and contoured EVA sole...
```

**After (with logo emphasis):**
```
...the iconic Birkenstock Boston clog in taupe suede, featuring the signature cork-latex footbed with the embossed "BIRKENSTOCK" wordmark clearly visible in classic serif typography, the adjustable metal buckle engraved with the distinctive "Birkenstock" script, contoured EVA sole...
```

---

## Regarding AI Settings Page

The Settings page correctly displays the current defaults from `defaultPrompts.ts`. Since the Birkenstock brand has `aiPrompts: null` in the database, clicking "Reset to Default" or viewing the page will show the updated prompts once we modify `defaultPrompts.ts`.

**No additional changes needed to the Settings page** - it already:
- Loads from `brand_context.aiPrompts` if custom
- Falls back to `DEFAULT_*` constants from `defaultPrompts.ts` if null

---

## Files to Update

| File | Change |
|------|--------|
| `src/lib/defaultPrompts.ts` | Add Birkenstock logo emphasis to `DEFAULT_PROMPT_AGENT_PROMPT` |
| `supabase/functions/generate-image/index.ts` | Add same logo emphasis to inline system prompt (line ~512) |



# Fix Buckle Branding Accuracy in Analysis and Prompting

## Problem

The current system has two issues causing incorrect buckle branding in generated images:

1. **Hardcoded branding text**: The prompt agent system prompt says `the engraved "Birkenstock" on the buckle` -- but this is wrong for many models. The Mayari buckles actually say **"BIRKEN"** on the larger strap buckle and **"BIRK"** on the smaller buckle bar. Other models may have different engravings or none at all.

2. **No branding data captured**: The `analyze-shoe-components` function only captures material, color, hex, confidence, and notes for each component. There is no dedicated field for engravings, logos, or branding text. This means the generation pipeline has no model-specific branding data to work with.

## What needs to change

### 1. Add a `branding` field to the component analysis schema

Update `supabase/functions/analyze-shoe-components/index.ts`:

- Add a new top-level `branding` field in the tool definition that captures model-specific branding details:

```text
branding: {
  footbedText: string     // e.g. "BIRKENSTOCK" + "MADE IN GERMANY" 
  footbedLogo: string     // e.g. "Footprint logo stamped in dark ink"
  buckleEngravings: [     // Array because models have multiple buckles
    { location: string, text: string, style: string }
  ]
  // e.g. [
  //   { location: "strap buckle bar", text: "BIRKEN", style: "embossed serif capitals" },
  //   { location: "small buckle bar", text: "BIRK", style: "embossed serif capitals" }
  // ]
}
```

- Update the SYSTEM_PROMPT to instruct the AI to carefully read and report the exact text on each buckle bar, the footbed wordmark, and any other branding marks visible in the images. Emphasize precision: "BIRKEN" is NOT the same as "BIRKENSTOCK."

### 2. Surface branding data in the generation prompt

Update `supabase/functions/generate-image/index.ts`:

- In the `=== PRODUCT COMPONENTS (from analysis) ===` section (~line 503-524), check if the stored components include a `branding` field and append it to the creative brief. Example output:

```text
BRANDING DETAILS (from analysis - use EXACT text):
- Footbed: embossed "BIRKENSTOCK" wordmark, "MADE IN GERMANY", footprint logo
- Buckle 1 (strap buckle bar): embossed "BIRKEN" in serif capitals
- Buckle 2 (small buckle bar): embossed "BIRK" in serif capitals
```

- Update the system prompt's "BIRKENSTOCK LOGO FIDELITY" section (~line 643-650) to be dynamic instead of hardcoded. Replace the current hardcoded text with instructions to use the BRANDING DETAILS from the brief when available, and only fall back to generic instructions when no branding data exists.

### 3. Update the default prompt agent prompt

Update `src/lib/defaultPrompts.ts`:

- In `DEFAULT_PROMPT_AGENT_PROMPT`, replace the hardcoded buckle branding example (~line 74-81) with dynamic instructions:

```text
**BIRKENSTOCK BRANDING FIDELITY (CRITICAL)**:
- When BRANDING DETAILS are provided in the brief, use the EXACT text specified 
  for each component. Do NOT assume all buckles say "BIRKENSTOCK" -- many models 
  have abbreviated engravings like "BIRKEN" or "BIRK" on individual buckle bars.
- Footbed wordmarks and logos must be described as specified in the branding data.
- If no BRANDING DETAILS section exists, describe branding as visible in the 
  reference images without assuming specific text.
```

### 4. Re-analyze existing SKUs

After deploying the updated analysis function, the Mayari (and other existing SKUs) will need to be re-analyzed to populate the new `branding` field. This can be triggered from the existing SKU management UI (which already has a re-analyze capability).

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-shoe-components/index.ts` | Add `branding` field to tool schema and system prompt; instruct AI to read exact buckle text |
| `supabase/functions/generate-image/index.ts` | Surface `branding` data in creative brief; make logo fidelity instructions dynamic |
| `src/lib/defaultPrompts.ts` | Replace hardcoded buckle branding with dynamic instructions that use analysis data |

## Data flow after changes

```text
Reference Images
      |
      v
analyze-shoe-components  -->  product_skus.components.branding
      |                         {footbedText, buckleEngravings[], ...}
      v
generate-image (creative brief)
      |
      "BRANDING DETAILS:
       Buckle 1: 'BIRKEN' (embossed serif)
       Buckle 2: 'BIRK' (embossed serif)
       Footbed: 'BIRKENSTOCK' wordmark"
      |
      v
Prompt Agent --> "...buckles engraved with 'BIRKEN' and 'BIRK' in serif capitals..."
      |
      v
Image Generator --> accurate branding in output
```


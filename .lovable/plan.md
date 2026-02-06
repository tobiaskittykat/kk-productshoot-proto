

# Fix Hardcoded "Boston" in Shot Type Prompts

## Problem

When generating images for any product (e.g., Birkenstock Arizona sandals), the prompt incorrectly describes a "closed-toe Boston clog." This happens because the **On Foot** and **Lifestyle (Full Body)** prompt builders have the product description hardcoded as a Boston clog, regardless of what product is actually selected.

The `Product Focus` prompt builder does NOT have this problem -- it correctly delegates product description to the Prompt Agent. The fix is to bring the other two builders in line with this approach.

## Root Cause

In `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`:

- **`buildOnFootPrompt`** (lines 332-339): Hardcodes "Birkenstock Boston clog," "Closed-toe Boston silhouette," suede upper, etc.
- **`buildLifestylePrompt`** (lines 754-761): Same hardcoded Boston description.

These hardcoded blocks override the actual product identity (Arizona, Dark Brown, Leather) that is provided separately in the brief. Since the shot direction is marked as "MANDATORY" and "LOCKED," the Prompt Agent faithfully follows it -- producing a Boston prompt for an Arizona product.

Additionally, in `supabase/functions/generate-image/index.ts` (line 610), the example prompt in the system instructions uses "Birkenstock Boston" which may bias the AI toward Boston even when other products are selected.

## Solution

Replace the hardcoded product descriptions in `buildOnFootPrompt` and `buildLifestylePrompt` with generic, silhouette-agnostic footwear integrity instructions -- the same approach already used successfully by `buildProductFocusPrompt`.

The Prompt Agent already receives a separate `=== PRODUCT IDENTITY ===` section with the correct brand, model, color, and material. It also receives reference images. These two sources are sufficient for accurate product description -- the shot type prompt should only describe the *shot composition*, not the *product itself*.

## Files to Change

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Replace hardcoded Boston blocks in `buildOnFootPrompt` and `buildLifestylePrompt` with generic footwear integrity instructions |
| `supabase/functions/generate-image/index.ts` | Update the example prompt on line 610 to be model-agnostic (use placeholder like "Birkenstock [Model]" instead of "Birkenstock Boston") |

## Detailed Changes

### 1. `shotTypeConfigs.ts` - `buildOnFootPrompt` (lines 332-346)

Replace the hardcoded "FOOTWEAR -- LOCKED" and "MATERIAL BEHAVIOR -- LOCKED" blocks with:

```text
FOOTWEAR -- LOCKED (MUST NOT CHANGE)
The model is wearing the exact footwear shown in the product reference images.
The shoe's geometry, construction, silhouette, proportions, stitching,
hardware placement, and material behavior must remain identical to the
reference images. Do not redesign, stylize, or reinterpret the product.

Product identity and materials are provided in the PRODUCT IDENTITY section
and must be described accurately by the prompt agent.
```

This removes all Boston-specific details (closed-toe, suede, single strap) while preserving the integrity enforcement.

### 2. `shotTypeConfigs.ts` - `buildLifestylePrompt` (lines 754-768)

Same replacement as above -- swap the hardcoded Boston block for the generic version.

### 3. `generate-image/index.ts` - Example prompt (line 610)

Change:
```
"the iconic Birkenstock Boston clog in taupe suede..."
```
To a generic example that doesn't bias toward a specific model:
```
"the iconic Birkenstock [Model] in [color] [material], featuring the signature
cork-latex footbed with the embossed 'BIRKENSTOCK' wordmark..."
```

## Why This Works

- The Prompt Agent already receives `=== PRODUCT IDENTITY ===` with the correct model name, color, and material (e.g., "Arizona / Dark Brown / Leather")
- The Prompt Agent also receives up to 10 reference images of the actual product
- By removing the hardcoded Boston description from the shot direction, the agent can correctly describe whatever product is actually selected
- Product integrity is still enforced -- the "LOCKED" instruction tells the agent not to redesign the shoe, just without specifying which shoe it is
- This matches the pattern already working correctly in `buildProductFocusPrompt`

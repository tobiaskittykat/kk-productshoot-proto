

# Improve Shoe Component Lining Detection

## Problem

The AI analysis prompt currently describes lining as optional and says "Many styles have no lining - just exposed cork footbed." This biases the model toward returning `null` for lining. But nearly all standard Birkenstocks have a **suede footbed lining** -- the thin microfiber/suede layer that sits on top of the cork-latex base. This is an important component for customization (e.g., changing its color).

Because the analysis returns `null`, the `ShoeComponentsPanel` filters it out entirely (it only renders components where `comp.material` is truthy), so users never even see the lining row and can't override it.

## Changes

### 1. `supabase/functions/analyze-shoe-components/index.ts` -- Improve the LINING section of the system prompt

Update the `LINING` description so the AI knows that:
- Nearly all standard Birkenstock models have a thin suede lining on the footbed surface
- Only fully molded EVA shoes (like the Arizona EVA) truly lack a lining
- When in doubt, default to detecting suede lining rather than returning null

Updated prompt section:
```
**LINING** (Required for most models)
The thin surface layer on TOP of the footbed that the foot directly touches.
IMPORTANT: Nearly ALL standard Birkenstock models have a suede lining on the footbed.
This is a thin microfiber/suede layer on top of the cork-latex base — it is NOT the cork itself.
Types: Suede (most common — thin, soft nap texture on footbed surface), 
       Shearling (fluffy, cream or black — winter models), 
       Wool Felt, Microfiber
Color: Usually natural tan/sand for suede, cream for shearling, black for dark shearling
Only return null for fully molded EVA shoes (e.g. Arizona EVA) where the entire shoe 
is one-piece plastic with no separate lining layer.
```

Also bump the `analysisVersion` from `"1.0"` to `"1.1"` so we can distinguish re-analyzed results.

### 2. Redeploy the edge function

After updating the prompt, the `analyze-shoe-components` function needs to be redeployed so the new prompt takes effect. You can then re-analyze your Gizeh to verify lining is detected.

## Files Changed

- `supabase/functions/analyze-shoe-components/index.ts` (prompt text updated, version bumped)

## What Will Happen After This

- Re-running "Analyze Components" on the Gizeh should detect the suede footbed lining
- The Lining row will appear in the Shoe Components panel, allowing material/color overrides
- Existing SKUs will need re-analysis to pick up the lining (clicking "Re-analyze Components")

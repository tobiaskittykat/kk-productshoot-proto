

# Fix: Force Redeploy of generate-image Edge Function

## Problem
The code changes from previous sessions (adding `isKnownPreset`, `getColorDescription` with hex appending, and `[COLOR-DEBUG]` logging) are all correct in the repository but are **not running in production**. The edge function logs show zero `[COLOR-DEBUG]` entries, confirming the deployed runtime is stale.

## Solution
Force a redeploy by adding a small version comment to the edge function file. This ensures Lovable Cloud picks up the change and redeploys.

## Changes

### File: `supabase/functions/generate-image/index.ts`
- Add a version/build stamp comment near the top of the file (e.g., `// v2.1 — color hex preservation`)
- This is a no-op change that triggers a fresh deployment

## Expected Result After Deploy
- Edge function logs will show `[COLOR-DEBUG]` entries for each overridden component
- Creative brief will contain `SOLE: EVA in Red (#FF073A)` instead of just `SOLE: EVA in Red`
- Prompt agent rule 9b will preserve hex codes in the final prompt output
- Preset colors like "Mocha" will remain as just "Mocha" (correct behavior since it's a known brand preset)

## Verification
After deployment, generate an image with a custom hex color override and check:
1. `[COLOR-DEBUG]` lines appear in edge function logs
2. Creative brief includes `ColorName (#HEX)` for non-preset colors
3. Final prompt preserves the hex code


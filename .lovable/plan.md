

# Fix: Remix Spinner Count Mismatch

## Problem
When generating in remix mode, the placeholder (spinner) count is always `state.imageCount` (line 320 of CreativeStudioWizard.tsx). But remix actually generates `sourceImages × imageCount` images (or `sourceImages × enabledTiers × imageCount` for variation mode). So if you have 1 source image and request 3 images, you get 3 placeholders — but if you have 3 sources × 1 image, you only see 1 spinner because `imageCount` is 1.

## Fix
**File:** `src/components/creative-studio/CreativeStudioWizard.tsx`

In `handleGenerate` (~line 320), compute the correct total placeholder count before creating the array:

```
const isRemix = state.useCase === 'product' && state.productShoot?.shootMode === 'remix';
const sources = state.productShoot?.remixSourceImages?.length || 0;
const enabledTiers = state.productShoot?.remixEnabledTiers ?? { faithful: true, moderate: true, creative: false };
const enabledTierCount = Object.values(enabledTiers).filter(Boolean).length;
const isVariations = isRemix && state.productShoot?.remixVariationMode === 'variations' && enabledTierCount > 0;

const placeholderCount = isRemix && sources > 0
  ? (isVariations ? sources * enabledTierCount * state.imageCount : sources * state.imageCount)
  : state.imageCount;
```

Then use `placeholderCount` instead of `state.imageCount` in the `Array.from({ length: ... })` call. This matches the exact logic already used in the Generate button label (lines 1058-1064).

One file change, ~10 lines modified.


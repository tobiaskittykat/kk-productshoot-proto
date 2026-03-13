

## Fix: Generate button count doesn't reflect roulette prompt totals

### Problem
The "Generate (N images)" button in `CreativeStudioWizard.tsx` always shows `state.imageCount` (the global per-source count from output settings). When in **Shoot Variations** mode, the actual image count is the sum of each enabled roulette tier's `imageCount` — but that total is never surfaced to the button.

In the screenshot: 3 tiers × 2x each = **6 images**, but the button shows "Generate (4 images)" because `state.imageCount` is set to 4 from the output settings panel.

### Fix
In `CreativeStudioWizard.tsx` line ~1057, when the product shoot is in `remixVariationMode === 'variations'` and has roulette prompts, compute the button count from the roulette prompts instead:

```typescript
// Replace the simple state.imageCount with:
const rouletteTotal = state.roulettePrompts
  ?.filter(p => p.enabled)
  .reduce((sum, p) => sum + p.imageCount, 0) ?? 0;

const displayCount = (state.remixVariationMode === 'variations' && rouletteTotal > 0)
  ? rouletteTotal
  : state.imageCount;
```

Then use `displayCount` in the button label: `` `Generate (${displayCount} images)` ``

### Also fix the "Total" line in RemixStep2
Line 812 shows `sources × imageCount` which is only correct for Shoe Swap mode. In Variations mode, hide or replace that line with the roulette total.

### Files to change
1. **`CreativeStudioWizard.tsx`** (~line 1057) — compute display count from roulette prompts when in variations mode
2. **`RemixStep2.tsx`** (~line 810-813) — conditionally show roulette total instead of `sources × imageCount` in variations mode


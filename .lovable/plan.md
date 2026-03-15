

# Skip Footbed (Keep Lining) for Lifestyle Worn-Shoe Shots

## Problem
When generating lifestyle shots where shoes are worn (On Foot, Body & Style, Portrait in Place), the prompt includes `FOOTBED: Suede in Taupe` — the foot covers the footbed so this confuses the AI. **Lining stays** because edges are visible when worn. This must NOT affect the Product Shoot workflow.

## Approach
The lifestyle shoot already excludes `productShootConfig` from the request (line 497 of `useImageGeneration.ts`), so the edge function has no `visualShotType` for lifestyle shots. We need to pass `lifestyleShotType` so the edge function can filter footbed for worn-shoe shots only.

## Changes

### 1. `src/hooks/useImageGeneration.ts`
Pass `lifestyleShotType` alongside the existing request body (around line 514):
```ts
lifestyleShotType: state.productShoot?.shootMode === 'lifestyle-shoot'
  ? state.productShoot.lifestyleShootConfig?.lifestyleShotType
  : undefined,
```

### 2. `supabase/functions/generate-image/index.ts` (line ~719)
Before building `componentLines`, check if this is a lifestyle worn-shoe shot. If so, exclude `'footbed'` from the component list. Lining stays. Product shoot is unaffected because `lifestyleShotType` will be `undefined` for product shoots.

```ts
const lifestyleShotType = request.lifestyleShotType;
const isLifestyleWornOnFoot = lifestyleShotType === 'feet-focus'
  || lifestyleShotType === 'model-no-head'
  || lifestyleShotType === 'full-model';

const componentTypes = isLifestyleWornOnFoot
  ? ['upper', 'sole', 'buckles', 'heelstrap', 'lining']  // footbed hidden by foot
  : ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
```

Also extend the branding visibility `isHiddenAngle` check (line ~756) to include lifestyle worn-shoe shots:
```ts
const isHiddenAngle = visualShotType === 'on-foot' || visualShotType === 'lifestyle'
  || isLifestyleWornOnFoot
  || (visualShotType === 'product-focus' && (...));
```

### Isolation guarantee
- `lifestyleShotType` is only set when `shootMode === 'lifestyle-shoot'`
- Product Shoot always has `lifestyleShotType === undefined`, so the existing `componentTypes` array is unchanged
- The existing `productShootConfig` exclusion (line 497) already prevents cross-contamination in the other direction

### Files changed
- `src/hooks/useImageGeneration.ts` — pass `lifestyleShotType`
- `supabase/functions/generate-image/index.ts` — filter footbed for lifestyle worn-shoe shots, extend branding visibility


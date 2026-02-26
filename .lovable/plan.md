
# Skip Footbed Branding for Side Profile Angle

## Problem
In the side-profile angle, the footbed interior is explicitly hidden ("interior hidden" in prompt, "interior footbed remains obscured from view" in narrative). However, the edge function still injects footbed text/logo branding into the prompt for all `product-focus` angles. This confuses the AI -- it tries to show footbed branding text that shouldn't be visible from this perspective.

## Root Cause
The edge function filters branding by `shotType` (e.g., `on-foot`, `lifestyle`, `product-focus`) but doesn't know which **angle** within `product-focus` is selected. The side-profile angle hides the footbed, but the branding injection doesn't account for this.

## Solution
Two small changes to pass the camera angle to the edge function and skip footbed branding when angle is `side-profile`.

### 1. Pass the camera angle to the edge function

**File**: `src/hooks/useImageGeneration.ts` (~line 480)

Add `cameraAngle` to the `productFocusConfig` object that's sent inside `productShootConfig`:

```
productFocusConfig: {
  ...state.productShoot.productFocusConfig,
  cameraAngle: state.productShoot.productFocusConfig?.cameraAngle
}
```

### 2. Update the edge function to skip footbed branding for side-profile

**File**: `supabase/functions/generate-image/index.ts` (~line 660)

Current logic:
```
if (visualShotType === 'on-foot' || visualShotType === 'lifestyle') {
  // Footbed is hidden -- skip entirely
}
```

Updated logic -- also check for side-profile angle:
```
const productFocusAngle = request.productShootConfig?.productFocusConfig?.cameraAngle;
if (visualShotType === 'on-foot' || visualShotType === 'lifestyle'
    || (visualShotType === 'product-focus' && productFocusAngle === 'side-profile')) {
  // Footbed is hidden -- skip entirely
}
```

### 3. Update the edge function's type definition to accept productFocusConfig

**File**: `supabase/functions/generate-image/index.ts` (~line 178)

Add to the `productShootConfig` interface:
```
productFocusConfig?: {
  cameraAngle?: string;
  lighting?: string;
};
```

## What This Achieves
- Side-profile shots will no longer receive footbed text/logo in the branding section
- All other product-focus angles (hero, top-down, sole-view, etc.) continue to receive footbed branding as before
- No changes to the shot prompt or narrative -- purely a branding injection fix

## Scope
- `src/hooks/useImageGeneration.ts` -- pass `productFocusConfig` through
- `supabase/functions/generate-image/index.ts` -- add type + skip logic

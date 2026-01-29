
# Simplify Product Shoot Indicator Bar

## Overview

Update the indicator chips to show cleaner, prefixed labels and remove the Output settings chip entirely.

---

## Desired Format

```
✓ Product  ·  ✓ Shot Type: On Foot  ·  ✓ Background: Studio
```

**Remove:** The `4x 1:1` output chip - no need to show output settings in the bar.

---

## Changes

### File: `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx`

**1. Update Shot Type label to include prefix:**
```typescript
// From:
const shotLabel = shotTypeLabels[state.productShotType] || 'Shot Type';

// To:
const shotLabel = `Shot Type: ${shotTypeLabels[state.productShotType] || 'Select'}`;
```

**2. Update Background label to include prefix:**
```typescript
// From:
const getBackgroundLabel = () => {
  if (state.settingType === 'auto') return 'Background (auto)';
  if (state.settingType === 'studio') return 'Studio';
  if (state.settingType === 'outdoor') return 'Outdoor';
  return 'Background';
};

// To:
const getBackgroundLabel = () => {
  if (state.settingType === 'studio') return 'Background: Studio';
  if (state.settingType === 'outdoor') return 'Background: Outdoor';
  return 'Background: Auto';
};
```

**3. Remove Output chip and its separator (lines 91-97):**
- Delete the separator span before Output
- Delete the Output `IndicatorChip` entirely

**4. Remove unused props from interface:**
- Remove `imageCount` and `aspectRatio` from `ProductShootIndicatorsProps` since they're no longer needed

---

## Result

| Current | Updated |
|---------|---------|
| `✓ Product` | `✓ Product` |
| `✓ On Foot` | `✓ Shot Type: On Foot` |
| `Background (auto)` | `✓ Background: Auto` |
| `✓ 4x 1:1` | *(removed)* |

All three chips will have checkmarks and use the prefixed format you requested.

---

## File Summary

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx` | Update labels with prefixes, remove Output chip |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Remove `imageCount` and `aspectRatio` props from `ProductShootIndicators` |



# Fix: Catalog-Imported Products — Clean Names & Model Grouping

## Problem

Products imported from the catalog have description shaped like:
```json
{
  "model": "Arizona Big Buckle",
  "productName": "Arizona Big Buckle Natural Leather Patent",
  "color": "High Shine Fondant Pink"
}
```

But `parseSkuDisplayInfo` only knows about the AI-analyzed format (`colors[]`, `materials[]`, `product_type`). It doesn't read `description.model` or `description.color`, so:

1. **modelName** falls back to the raw full name ("Arizona Big Buckle Natural Leather Patent — High Shine Fondant Pink") instead of a clean "Arizona Big Buckle"
2. **getModelGroup** can't match to SIGNATURE_MODELS because it gets the full string, not "Arizona"
3. **Subtitle** shows nothing useful since `colors`/`materials` arrays are missing

## Fix — `src/lib/skuDisplayUtils.ts`

Update `parseSkuDisplayInfo` to detect catalog-import descriptions and extract:
- `modelName` from `description.productName` (clean product name without color)
- `color` from `description.color`
- `brandName` as "Birkenstock" (inferred from catalog import)

Add to the `SKUDescription` interface:
```ts
// Catalog import format
model?: string;
productName?: string;
color?: string;
```

In `parseSkuDisplayInfo`, add early detection:
```ts
if (description?.productName) {
  result.modelName = description.productName;
  if (description.color) result.color = description.color;
  result.brandName = 'Birkenstock';
  return result;
}
```

## Fix — `src/components/creative-studio/product-shoot/ProductPickerModal.tsx`

Update `getModelGroup` to also check `description.model` for the base model name (first word), since catalog imports store `"Arizona Big Buckle"` in `description.model` — the first word ("Arizona") maps directly to SIGNATURE_MODELS.

```ts
function getModelGroup(sku) {
  // Check catalog-import model field first
  const desc = sku.description;
  if (desc?.model) {
    const baseModel = desc.model.split(' ')[0].toLowerCase();
    if (SIGNATURE_MODELS.has(baseModel)) {
      return desc.model.split(' ')[0]; // "Arizona"
    }
  }
  // Existing logic as fallback...
}
```

## Result

- "Arizona Big Buckle Natural Leather Patent — High Shine Fondant Pink" displays as model **"Arizona Big Buckle Natural Leather Patent"** with subtitle **"Birkenstock • High Shine Fondant Pink"**
- Grouped under **Arizona** instead of "Other"
- No changes to existing AI-analyzed products (they don't have `description.productName`)

## Files Changed
1. `src/lib/skuDisplayUtils.ts` — handle catalog description format
2. `src/components/creative-studio/product-shoot/ProductPickerModal.tsx` — model grouping from `description.model`




# Fix: SKU Code Collision in Catalog Import

## Problem
`makeSkuCode()` truncates both product name and color to 2 words each, causing collisions when products share the same prefix (e.g. all "Arizona Big Buckle" + "High Shine ..." variants produce identical `BIRK-ARIZONA-BIG-HIGH-SHINE`).

## Fix
Use **all** words from the color instead of just the first 2. This exists in two places that must stay in sync:

1. **`src/components/creative-studio/product-shoot/CatalogBrowser.tsx`** line 41-44
2. **`supabase/functions/register-imported-products/index.ts`** line 9-12

Change from:
```ts
const col = color.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
```
To:
```ts
const col = color.split(' ').join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
```

Keep the `.slice(0, 40)` length cap to prevent excessively long codes.

**Impact:** Already-imported products with the old 2-word SKU code will no longer match the new full-color code, so they'll lose their "Imported" badge. This is acceptable — re-importing will just upsert. No data loss.

One-line change in 2 files.


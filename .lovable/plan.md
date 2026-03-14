

# Trigger AI Analysis After Catalog Import

## Problem
The catalog import flow in `CatalogBrowser.tsx` calls `bulk-import-products` to create SKUs and upload images, but never triggers `analyze-shoe-components` afterward. The regular Smart Upload save flow (line 416 of SmartUploadModal) does trigger it.

## Fix
After each successful batch import in `CatalogBrowser.tsx`, extract the created SKU IDs from the response and fire `analyze-shoe-components` for each one (fire-and-forget, same pattern as the existing flow). Also trigger `composite-product-images` for thumbnail generation.

### File: `src/components/creative-studio/product-shoot/CatalogBrowser.tsx`
In the import loop (~line 165, after the successful `else` branch), iterate over `data.details` to get each `skuId` and invoke:
1. `analyze-shoe-components` with `{ skuId }`
2. `composite-product-images` with `{ skuId, imageUrls, layout }` (using the detail's image count)

Both are fire-and-forget calls matching the existing pattern in SmartUploadModal.


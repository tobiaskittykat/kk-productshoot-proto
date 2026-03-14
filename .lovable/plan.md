

# Birkenstock Catalog Browser & On-Demand Import

## Concept
Store the full 285-product Birkenstock catalog as a static JSON index in the app. Add a new "Browse Catalog" source option in Smart Upload (alongside "Upload Files" and "From Crawled"). Users search/filter by model, material, color -- then select products they want. The app calls `bulk-import-products` to download images from Birkenstock's CDN and register them as products, all in one flow.

## Flow

```text
Smart Upload Modal
├── Step 1: Choose Source
│   ├── [Upload Files]     → existing drag-drop
│   ├── [From Crawled]     → existing batch browser
│   └── [Browse Catalog]   → NEW: searchable catalog
│
├── Step 2 (catalog): Search & Select
│   ├── Search bar (model, color, material)
│   ├── Filter chips by model (Arizona, Boston, ...)
│   ├── Grid of product cards with hero thumbnail (direct Birkenstock CDN URL)
│   ├── Each card shows: name, color, image count, checkbox
│   ├── Already-registered products shown as dimmed/checked
│   └── "Import Selected (N)" button
│
├── Step 3: Import Progress
│   ├── Calls bulk-import-products edge function
│   ├── Shows per-product progress (downloading, mirroring, done)
│   └── On complete → products appear on /products page
```

## Implementation

### 1. Static catalog data file
- **Create** `src/data/birkenstock-catalog.json` — copy from the uploaded `products-2.json`
- Contains 285 entries with `model`, `productName`, `color`, `imageUrls`, `sourceUrl`
- Imported as a static JSON module (Vite handles this natively)

### 2. Update SmartUploadModal
- Add third source option: "Browse Catalog" with a search/shop icon
- New step `'catalog'` between source and review
- **CatalogBrowser** sub-component:
  - Text search across `productName + color + model`
  - Model filter chips (Arizona, Boston, Gizeh, etc.)
  - Thumbnail grid using first `imageUrl` as hero (loaded directly from CDN -- no download yet)
  - Checkbox multi-select with count badge
  - Cross-reference `product_skus` table to mark already-registered items
  - "Import Selected" triggers the existing `bulk-import-products` edge function with the selected products' data

### 3. New component: CatalogBrowser
- **Create** `src/components/creative-studio/product-shoot/CatalogBrowser.tsx`
- Props: `onImport(products)`, `onBack()`
- Filters lifestyle images (`_f_look_f`, `_f_closeup_f`, `_m_look_m`, etc.) from the imageUrls before sending to import
- Groups by model for visual hierarchy
- Shows image count per product (non-lifestyle only)

### 4. Import flow
- Selected products are sent to `bulk-import-products` edge function (already handles Birkenstock CDN URLs, angle detection, storage upload, and product_skus + scraped_products registration)
- Progress shown via polling or sequential processing with status updates
- On completion, invalidate `['products-page-skus']` query cache

### Files to create/modify
- **Create**: `src/data/birkenstock-catalog.json` (from uploaded file)
- **Create**: `src/components/creative-studio/product-shoot/CatalogBrowser.tsx`
- **Modify**: `src/components/creative-studio/product-shoot/SmartUploadModal.tsx` — add catalog source + step


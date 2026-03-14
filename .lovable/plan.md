

# Smart Upload: Add "From Crawled Images" Source

## Problem
The crawler uploads images to `product-images/imports/{batch}/` in storage, but Smart Upload only accepts local file uploads. There's no way to pick already-crawled images and turn them into products.

## Solution
Add a second source option to Smart Upload: alongside "Upload files", add "From Gallery" that lists crawled image batches from storage. The manifest.json already contains product groupings, so we can skip AI analysis entirely for crawled imports.

## Flow

```text
Smart Upload Modal
├── Step 1: Choose Source
│   ├── [Upload Files]  → existing drag-drop flow
│   └── [From Crawled]  → new: list import batches
│
├── Step 2 (if crawled): Pick Batch
│   ├── Show batches from imports/ folder
│   ├── Read manifest.json for each batch
│   └── Show product previews with image counts
│
├── Step 3: Review (same as current)
│   ├── Pre-populated from manifest (no AI needed)
│   ├── Edit names, angles, groupings
│   └── Save → creates product_skus + scraped_products
│
└── Done → visible on /products page
```

## Implementation

### 1. New edge function: `list-import-batches`
- Lists folders under `imports/` in product-images bucket
- For each batch, downloads and parses `manifest.json`
- Returns batch list with product summaries and image counts
- Filters out products that are already registered (checks `scraped_products.storage_path`)

### 2. Update SmartUploadModal
- Add a source selection step at the beginning: "Upload New" vs "From Crawled Images"
- "From Crawled Images" path:
  - Fetches batches via `list-import-batches`
  - Shows batch cards with product thumbnails
  - User selects a batch → manifest products are converted into the existing `ProductGroup[]` format
  - Skips the upload + AI analysis steps entirely
  - Goes directly to the review step (same `GroupReviewCard` UI)
- On save: uses the storage URLs from the manifest as `thumbnail_url`/`full_url` and sets `storage_path`

### 3. Update Products page query
- Already queries `product_skus` + `scraped_products` — no changes needed
- Once SKUs are saved via Smart Upload, they'll appear automatically

### Files to create/modify
- **Create**: `supabase/functions/list-import-batches/index.ts`
- **Modify**: `src/components/creative-studio/product-shoot/SmartUploadModal.tsx` — add source selection + batch browsing steps


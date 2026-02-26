

# Three New Features: Sample Repository, Ad Gallery, and Product Set-Up Mode

## Feature 1: Sample Repository

**What it does:** Every time you upload a color/material swatch in the component override popover, it gets saved to a persistent repository. When overriding a component, you can browse your saved swatches and pick one instead of uploading fresh each time.

### Database
- New table `color_samples` with columns: `id`, `user_id`, `brand_id`, `image_url`, `material` (detected), `color` (detected), `color_hex`, `component_type`, `name` (auto-generated from material+color), `created_at`
- RLS: users can CRUD their own samples

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/useColorSamples.ts` | **New** -- hook to fetch/save/delete samples from `color_samples` table |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | After successful swatch upload + analysis, save to `color_samples` table. Add a "Saved Swatches" grid above the upload button showing recent samples (clickable to apply material/color/hex/imageUrl) |

### UX Flow
1. Open a component override popover
2. See "Saved Swatches" grid (if any exist) with small thumbnails
3. Click a swatch to auto-fill material, color, hex, and attach the sample image
4. Or upload a new swatch as before -- it auto-saves to the repository after AI analysis completes

---

## Feature 2: Ad Gallery (Source Image Library for Remix)

**What it does:** A persistent library of uploaded ad creatives. In the Remix flow's "Source Images" section, users can pick from their gallery instead of uploading every time.

### Database
- New table `ad_creatives` with columns: `id`, `user_id`, `brand_id`, `image_url`, `name`, `tags` (text array for organization), `created_at`
- RLS: users can CRUD their own creatives

### Code Changes

| File | Change |
|------|--------|
| `src/hooks/useAdCreatives.ts` | **New** -- hook to fetch/save/delete ad creatives |
| `src/components/creative-studio/product-shoot/AdGalleryModal.tsx` | **New** -- modal showing saved ad creatives in a grid, with multi-select to pick source images |
| `src/components/creative-studio/product-shoot/RemixStep2.tsx` | Add "Choose from Ad Gallery" button next to the upload area. When remix source images are uploaded, offer a "Save to Gallery" option. Wire up the AdGalleryModal for selection |

### UX Flow
1. In Remix Step 2 "Source Images" section, see a new button "Browse Ad Gallery" alongside the upload area
2. Opens a modal showing all saved ad creatives with thumbnails
3. Select one or more, they get added as remix source images
4. When uploading new images via drag-and-drop, a small "Save to Gallery" checkbox auto-saves them for future use

---

## Feature 3: Set-Up Products (New Shoot Mode)

**What it does:** A third option alongside "New Shoot" and "Remix Existing" that lets you create a new colorway/variant of an existing shoe. You pick a base shoe, modify its components, then generate 4 white-background product images from standard angles (hero, side, top-down, sole). You review, regenerate any you don't like, then save as a new product SKU in your database.

### Types
- Extend `ShootMode` from `'new' | 'remix'` to `'new' | 'remix' | 'setup'`

### Code Changes

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/types.ts` | Add `'setup'` to `ShootMode` type. Add `SetupProductState` interface with fields for selected angles, generated results per angle, and save status |
| `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx` | Add third card "Set Up Product" with a Package icon and description "Create a new colorway from an existing shoe" |
| `src/components/creative-studio/product-shoot/SetupProductStep2.tsx` | **New** -- Main configuration panel: product picker (reuses existing), shoe components panel (reuses existing), angle selector (checkboxes for hero/side/top-down/sole with reference thumbnails), generate button, results review grid with per-image regenerate and approve checkboxes, "Save as New Product" button |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Route `shootMode === 'setup'` to render `SetupProductStep2` instead of `ProductShootStep2` or `RemixStep2`. Wire up generation logic (calls `generate-image` with product-focus shot type, white studio background, and each angle) |
| `src/components/creative-studio/product-shoot/index.ts` | Export the new component |

### Generation Logic
- For each selected angle (e.g., hero, side profile, top-down, sole), generate one image using:
  - Shot type: `product-focus`
  - Background: white studio (`studio-white`)
  - Camera angle: mapped from the angle name (e.g., "hero" -> eye-level front 3/4, "sole" -> bottom view)
  - Component overrides applied as normal
  - Product reference images from the base SKU attached
- Each angle generates independently so users can regenerate individual angles

### Save Flow
1. User reviews all generated angle images
2. Can regenerate any single angle (replaces that image)
3. Clicks "Save as New Product"
4. Creates a new `product_skus` row with:
   - Name auto-derived from base shoe + override summary (e.g., "Arizona - Coral Suede")
   - Components copied from base shoe with overrides merged in
   - Brand ID carried from base
5. Uploads approved images to `product-images` bucket under new SKU path
6. Creates `scraped_products` rows for each angle image
7. Triggers `composite-product-images` to generate the grid thumbnail
8. Navigates to the product editor or shows a success toast

### UX Flow
1. Select "Set Up Product" on the mode selector
2. Pick a base shoe from the product picker
3. Modify components (same shoe components panel as New Shoot / Remix)
4. Select which angles to generate (default: all 4)
5. Click "Generate Product Images"
6. Review the results in a grid -- each has a regenerate button and an approve checkbox
7. Once satisfied, click "Save as New Product"
8. New SKU appears in the product library

---

## Files Summary

| File | Status | Feature |
|------|--------|---------|
| `src/hooks/useColorSamples.ts` | New | #1 |
| `src/hooks/useAdCreatives.ts` | New | #2 |
| `src/components/creative-studio/product-shoot/AdGalleryModal.tsx` | New | #2 |
| `src/components/creative-studio/product-shoot/SetupProductStep2.tsx` | New | #3 |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Modified | #1 |
| `src/components/creative-studio/product-shoot/RemixStep2.tsx` | Modified | #2 |
| `src/components/creative-studio/product-shoot/types.ts` | Modified | #3 |
| `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx` | Modified | #3 |
| `src/components/creative-studio/product-shoot/index.ts` | Modified | #3 |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Modified | #3 |
| Database migration | New tables: `color_samples`, `ad_creatives` | #1, #2 |


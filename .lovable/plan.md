
# Remix Existing: Shoe Swap on Uploaded Ad Creatives

## Overview

Build a "Remix Existing" flow that lets users upload one or more existing ad creatives, select a product from their SKU library (with optional color overrides), and have the AI swap the footwear in the image while preserving everything else (model, background, pose, composition). Includes an option to remove any text/ad copy from the source image via AI inpainting.

## User Flow

1. User clicks "Remix Existing" on Step 1 (currently disabled with "Coming Soon")
2. Step 2 shows a **Remix configuration interface** with:
   - **Source Image Upload** -- drag-and-drop or click to upload 1+ ad creatives (stored in `generated-images` bucket under a remix subfolder)
   - **Product Selection** -- same SKU picker grid as New Shoot (reuses existing component)
   - **Component Overrides** -- same ShoeComponentsPanel for color/material changes (reuses existing component)
   - **Remove Text toggle** -- ON/OFF switch to strip ad copy from the source image
   - **Output Settings** -- image count (per source), resolution, aspect ratio (reuses existing section)
3. User clicks Generate -- the system sends each source image + product refs + instructions to the AI for shoe-swap editing

## Technical Plan

### 1. Enable "Remix Existing" button

**File: `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx`**

- Remove the `opacity-50 cursor-not-allowed` disabled styling and "Coming Soon" badge
- Make it a clickable button that calls `handleSelect('remix')`
- Keep the same visual card pattern as "New Shoot"

### 2. Create Remix Step 2 component

**New file: `src/components/creative-studio/product-shoot/RemixStep2.tsx`**

A configuration interface with four collapsible sections (matching New Shoot's accordion pattern):

**Section 1 -- Source Images**
- Upload area with drag-and-drop support (accepts PNG, JPEG, WebP)
- Thumbnails grid showing uploaded images with remove buttons
- Upload to `generated-images` bucket under `{userId}/remix-sources/`
- Support multiple images (batch remix)

**Section 2 -- Product**
- Reuse the existing product grid + "Browse More" modal from `ProductShootStep2`
- Extract the product selection logic into a shared component or simply render the same SKU picker
- Include the ShoeComponentsPanel for color/material overrides

**Section 3 -- Remix Options**
- "Remove text/ad copy" toggle (default: OFF)
- Future: could add other options like "change background" or "change model" but keeping scope tight for now

**Section 4 -- Output Settings**
- Resolution, aspect ratio selectors (reuse existing pattern)

### 3. Update types

**File: `src/components/creative-studio/product-shoot/types.ts`**

Add to `ProductShootState`:
```typescript
// Remix source images (URLs after upload)
remixSourceImages?: string[];
// Remove text from source image
remixRemoveText?: boolean;
```

Update `initialProductShootState` with defaults:
```typescript
remixSourceImages: [],
remixRemoveText: false,
```

### 4. Wire into CreativeStudioWizard

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

- In the product shoot Step 2 block (~line 831-868), add a conditional:
  - If `state.productShoot.shootMode === 'new'` -- render existing `ProductShootStep2`
  - If `state.productShoot.shootMode === 'remix'` -- render new `RemixStep2`
- The Generate button logic will detect remix mode and build the request accordingly

### 5. Update image generation hook

**File: `src/hooks/useImageGeneration.ts`**

In `generateImages`, add remix-mode handling:
- When `state.productShoot.shootMode === 'remix'`:
  - For each source image in `remixSourceImages`, fire a generation request with:
    - `editMode: true`
    - `sourceImageUrl: <remix source image URL>`
    - `productReferenceUrls: <selected SKU's angles>`
    - `componentOverrides: <any color overrides>`
    - A custom `prompt` instructing the AI to swap the footwear
    - A `remixRemoveText` flag
  - Supports sequential generation (one per source image)

### 6. Update edge function

**File: `supabase/functions/generate-image/index.ts`**

Add to the `GenerateImageRequest` interface:
```typescript
remixMode?: boolean;
remixRemoveText?: boolean;
```

In the prompt crafting logic:
- When `remixMode` is true, build a specialized prompt:
  - "Edit this image: replace the footwear with the exact product shown in the reference images. Keep the model, pose, background, lighting, and composition identical. Only change the shoes."
  - If `remixRemoveText` is true, append: "Also remove any text, logos, or ad copy overlaid on the image. Inpaint those areas to match the surrounding background seamlessly."
  - Include component override language if overrides are present (same as New Shoot)
- The source image is already handled by the existing `editMode` path (line 1130-1139)

### 7. Export from index barrel

**File: `src/components/creative-studio/product-shoot/index.ts`**

Add `RemixStep2` to the exports.

## What stays the same

- SKU picker, ShoeComponentsPanel, component override logic -- all reused as-is
- The existing `editMode` image generation path in the edge function
- The Prompt Agent system -- remix will bypass it with a direct, structured editing prompt (no narrative rewriting needed for swaps)
- Gallery display, image detail modal, integrity analysis -- all work unchanged

## What's new

| File | Change |
|------|--------|
| `ProductShootSubtypeSelector.tsx` | Enable "Remix Existing" button |
| `RemixStep2.tsx` | New component: remix configuration UI |
| `types.ts` | Add `remixSourceImages`, `remixRemoveText` fields |
| `index.ts` (barrel) | Export RemixStep2 |
| `CreativeStudioWizard.tsx` | Conditionally render RemixStep2 vs ProductShootStep2 |
| `useImageGeneration.ts` | Add remix-mode generation logic |
| `generate-image/index.ts` | Add `remixMode`, `remixRemoveText` handling + swap prompt |

## Risks and Considerations

- **Shoe swap quality**: Image editing models (Gemini 3 Pro Image) can struggle with precise object replacement. The quality will depend heavily on how different the target shoe is from the source. Results may vary -- this is an inherent limitation of current AI models.
- **Text removal**: AI inpainting of text works best on clean backgrounds. Complex backgrounds behind text may show artifacts. This is a best-effort feature.
- **Batch size**: Each source image generates independently, so 5 source images at standard resolution is 5 separate API calls. We should cap at a reasonable limit (e.g., 10 images max).

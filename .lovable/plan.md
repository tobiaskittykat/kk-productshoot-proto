

# Add Color/Material Sample Image to Component Overrides

## Overview
Add the ability to upload a color/material sample image (e.g., a swatch photo, fabric close-up, or Pantone card) per component override. The sample can optionally be attached to the image generation request so the AI sees the exact color/texture reference. The sample URL is also persisted in generation metadata for traceability.

## How It Works

1. **Upload a sample image** -- In the ComponentOverridePopover, a small upload area lets you attach a photo of the desired color/material (stored in the `product-images` bucket under `{userId}/color-samples/`)
2. **Toggle "Attach to generation"** -- A checkbox per component controls whether the sample image is sent to the AI alongside the text override
3. **AI receives it** -- The generate-image edge function adds the sample image(s) to the prompt payload with a label like "Color/material reference swatch for UPPER"
4. **Metadata tracking** -- The sample URLs are saved in the `settings` JSONB of `generated_images` so you can see them in the Image Detail Modal

## Changes

### 1. Extend `ComponentOverride` type
**File:** `src/lib/birkenstockMaterials.ts`

Add optional fields to `ComponentOverride`:
```text
export interface ComponentOverride {
  material: string;
  color: string;
  colorHex?: string;
  sampleImageUrl?: string;      // uploaded swatch/sample URL
  attachSampleToGen?: boolean;  // whether to send it to AI (default: false)
}
```

### 2. Add sample upload UI to `ComponentOverridePopover`
**File:** `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

Below the color picker section, add a "Color/Material Sample" area:
- Small upload dropzone (click-to-upload or drag) -- accepts image files
- Shows a thumbnail preview when uploaded
- Checkbox: "Attach sample to generation" (default off)
- Upload goes to Supabase storage: `product-images/{userId}/color-samples/{timestamp}.{ext}`
- Remove button to clear the sample

### 3. Pass sample image URLs to the edge function
**File:** `src/hooks/useImageGeneration.ts`

In `buildRequestBody`, collect all component overrides that have `sampleImageUrl` and `attachSampleToGen === true` into a new field:
```text
componentSampleImages: [
  { component: 'upper', url: 'https://...sample.jpg' },
]
```

### 4. Edge function: attach sample images to AI prompt
**File:** `supabase/functions/generate-image/index.ts`

- Add `componentSampleImages` to the request type
- In the prompt agent call and/or direct generation call, include these as additional image inputs with a descriptive label: "Reference swatch for {COMPONENT} color/material -- match this exactly"
- In the override text block, add a note: "A color/material reference swatch is attached for {COMPONENT}"

### 5. Persist in metadata
**File:** `supabase/functions/generate-image/index.ts`

In the settings JSONB written to `generated_images`, add:
```text
componentSampleImages: body.componentSampleImages || []
```

### 6. Show in Image Detail Modal
**File:** `src/components/creative-studio/ImageDetailModal.tsx`

In the metadata/references section, if `settings.componentSampleImages` exists and is non-empty, show thumbnails labeled by component (e.g., "Upper Sample", "Sole Sample").

## Files Summary

| File | Change |
|------|--------|
| `src/lib/birkenstockMaterials.ts` | Add `sampleImageUrl` and `attachSampleToGen` to `ComponentOverride` |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Add sample image upload area + attach toggle |
| `src/hooks/useImageGeneration.ts` | Collect attached samples into `componentSampleImages` in request body |
| `supabase/functions/generate-image/index.ts` | Accept samples, attach to AI messages, persist in metadata |
| `src/components/creative-studio/ImageDetailModal.tsx` | Display sample thumbnails in metadata section |

No database migrations needed -- uses existing `product-images` storage bucket and existing `settings` JSONB column.


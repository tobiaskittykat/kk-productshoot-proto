
# Show Source/Base Image in Image Detail Modal

## What
Add the remix source image (the uploaded ad creative that was used as the base for shoe-swapping) to the Reference Images section of the Image Detail Modal. It will appear as a new "Source Image" subsection alongside the existing Moodboard, Product, and Scene reference subsections.

## Changes

### File: `src/components/creative-studio/ImageDetailModal.tsx`

1. **Extract sourceImageUrl from settings** (around line 200-204): Add `sourceImageUrl` to the `settingsRefs` type cast and extract it as a variable.

2. **Update hasReferences check** (line 215): Include `sourceImageUrl` so the references section shows when a source image exists.

3. **Add "Source Image" subsection** (before or after the Product References block, ~line 330): Render a clickable thumbnail for the source image, using the same expand-on-click pattern as the other reference images. Labeled "Source Image (Base)" to distinguish it from product references.

## Technical Detail

The `sourceImageUrl` is already persisted in the `settings` JSONB field under `settings.references.sourceImageUrl` (saved by the edge function at generation time). No backend changes needed -- this is purely a UI addition to surface data that's already stored.

The new subsection will use the same aspect-video thumbnail with hover-to-expand pattern used by the moodboard reference, since source images are typically full ad creatives (landscape or portrait).

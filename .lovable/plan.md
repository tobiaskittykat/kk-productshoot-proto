

# Add Delete & Filter Lifestyle Images in Smart Upload Review

## What changes

### 1. Add delete button to images in GroupReviewCard
Currently images only have a "move to group" button on hover. Add an X/trash button so users can remove individual images from a group during the review step.

- Add a delete/X button (top-left corner on hover) to each image in the grid
- Pass a new `onDeleteImage` callback from SmartUploadModal to GroupReviewCard
- In SmartUploadModal, the handler removes the image from its group's `images` array
- If a group ends up with 0 images after deletion, auto-remove that group

### 2. Filter out lifestyle images from crawled imports
In `selectBatch()` (SmartUploadModal ~line 248), when converting manifest images to ProductGroup images, filter out any image where `img.angle` is `'lifestyle'` (or similar lifestyle-type angles like `'on-foot'`, `'on-model'`).

This ensures lifestyle shots from the crawler never appear in the review step.

### Files to modify
- **`src/components/creative-studio/product-shoot/GroupReviewCard.tsx`** — add `onDeleteImage` prop + delete button on each image thumbnail
- **`src/components/creative-studio/product-shoot/SmartUploadModal.tsx`** — add `deleteImageFromGroup` handler, pass it to GroupReviewCard, and filter lifestyle angles in `selectBatch()`


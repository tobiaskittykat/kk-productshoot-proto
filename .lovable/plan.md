

# Replace Edit Product Modal with Full-Page Inline Editor

## Problem
The Edit Product modal (`max-w-lg`, ~32rem wide) is too narrow to be usable. The AI Analysis panel alone contains 3 collapsible sections with inline fields, and combined with Product Name, SKU Code, Description, and the image grid, everything is cramped and hard to interact with.

## Solution
Replace the modal with a full-page edit view at `/products/:id` that uses the full screen width with a two-column layout:

**Left column (wider):** Product metadata + AI Analysis
- Product Name, SKU Code, Description fields with proper spacing
- Editable AI Analysis panel (components, branding, classification) with room to breathe

**Right column (narrower):** Product Images
- Image grid showing all angles with delete/add controls
- Larger thumbnails since we have more space

**Top bar:** Product name as title, with Back, Delete, and Save Changes buttons

## What Changes

### 1. New page: `src/pages/ProductEdit.tsx`
- Full-page layout with sticky header (Back button, product name, Save/Delete actions)
- Two-column grid below: left for metadata + analysis, right for images
- All existing logic from `EditSKUModal` (state, save, delete, upload) moves here
- No modal wrapper -- just a regular page

### 2. Route: Add `/products/:id` to `App.tsx`

### 3. Products page: Replace edit modal with navigation
- In `Products.tsx`, clicking the Edit button navigates to `/products/:id` instead of opening a modal
- Remove `EditSKUModal` import and `editingSkuId` state

### 4. Keep `EditSKUModal` for other entry points
- The ProductPickerModal still uses it as a quick-edit fallback
- But the primary editing flow is now the full page

## Layout

```text
+-------------------------------------------------------+
| <- Back to Products    Boston Taupe Suede    [Delete] [Save] |
+-------------------------------------------------------+
|                          |                            |
|  Product Name            |  Product Images (4)        |
|  [___________________]   |  +----+ +----+ +----+      |
|                          |  |    | |    | |    |      |
|  SKU Code                |  +----+ +----+ +----+      |
|  [___________________]   |  +----+ +------+           |
|                          |  |    | | +Add |           |
|  Description             |  +----+ +------+           |
|  [___________________]   |                            |
|  [___________________]   |                            |
|                          |                            |
|  > AI Analysis -- v1.3   |                            |
|    Component Breakdown   |                            |
|    Upper: Suede, Taupe   |                            |
|    Sole: EVA, Brown      |                            |
|    ...                   |                            |
|    Branding Details      |                            |
|    Classification        |                            |
+-------------------------------------------------------+
```

## Files

| File | Change |
|------|--------|
| `src/pages/ProductEdit.tsx` | **New** -- full-page product editor with two-column layout |
| `src/App.tsx` | Add route `/products/:id` pointing to `ProductEdit` |
| `src/pages/Products.tsx` | Replace modal open with `navigate(/products/${id})`, remove EditSKUModal usage |

## What stays the same
- `EditSKUModal` remains available for other contexts (ProductPickerModal)
- `EditableAnalysisPanel` component is reused as-is
- All save/delete/upload logic stays identical, just moves to the page component
- Database schema unchanged


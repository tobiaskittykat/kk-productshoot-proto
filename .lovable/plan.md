

# Remove Duplicate Image — Make Grid Thumbnail the Interactive Preview

## The Problem

Right now, hovering a product shows a popover with a **second big image** of the same product that's already visible in the grid. That's redundant — you're seeing the same shoe twice.

## The Fix

The grid thumbnail **is** the big image. Enhance it directly:

1. **Click the grid thumbnail to go fullscreen** (for the selected product)
2. **Hover popover shows only the angle strip** — small thumbnails + product name + edit button (no featured image)
3. **Clicking an angle in the popover swaps the grid thumbnail** to that angle (session only)

## Layout Comparison

```text
BEFORE (hover popover):              AFTER (hover popover):
+-------------------------------+    +-------------------------------+
|  Gizeh              [Edit]    |    |  Gizeh              [Edit]    |
|  Navy                         |    |  Navy                         |
+-------------------------------+    +-------------------------------+
|                               |    | [3/4] [Side] [Sole] [Top]    |
|    (DUPLICATE big image)      |    +-------------------------------+
|    Same shoe shown again      |    |  4 angles                     |
|                               |    +-------------------------------+
+-------------------------------+
| [3/4] [Side] [Sole] [Top]    |    Grid thumbnail itself:
+-------------------------------+    - Shows active angle (default 3/4)
|  4 angles                     |    - Click = fullscreen (if selected)
+-------------------------------+    - Click = select (if not selected)
```

## Technical Details

### 1. `ProductAnglePreview.tsx` — Remove featured image, add angle callback

Changes:
- **Remove** the featured image section (the `button` with `h-[140px]` image, lines 99-117)
- **Remove** the fullscreen Dialog (lines 156-180) — fullscreen moves to the parent
- **Remove** `isFullscreen` state
- **Add** new prop: `onAngleChange?: (thumbnailUrl: string, fullUrl: string) => void`
- When a small angle thumbnail is clicked, call `onAngleChange` with that angle's URLs in addition to setting `activeAngleId`
- Keep: header (name + edit button), angle strip (clickable thumbnails with active highlight), angle count

### 2. `ProductShootStep2.tsx` — Lift angle state, add fullscreen to grid

Changes:
- **Add state**: `activeAngleUrls: Record<string, { thumbnail: string; full: string }>` — maps SKU ID to the currently selected angle's URLs
- **Add state**: `fullscreenImage: { url: string; skuName: string; angle?: string } | null` — controls the fullscreen dialog
- **Grid thumbnail image**: Instead of always using `display_image_url || composite_image_url`, check `activeAngleUrls[sku.id]?.thumbnail` first. This way, clicking an angle in the popover changes the grid image.
- **Grid thumbnail click behavior**:
  - If product is **already selected**: open fullscreen dialog (using `activeAngleUrls[sku.id]?.full` or the composite URL)
  - If product is **not selected**: select it (existing behavior)
- **Add expand icon**: Show a small zoom/expand icon overlay on the selected product's grid thumbnail (hover-visible, similar to `ReferenceThumbnail`)
- **Pass `onAngleChange`** to `ProductAnglePreview`: when called, updates `activeAngleUrls` for that SKU
- **Add fullscreen Dialog** in ProductShootStep2 (simple dialog with full-res image, same pattern as existing code)

### Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductAnglePreview.tsx` | Remove featured image and fullscreen dialog; add `onAngleChange` prop |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Add `activeAngleUrls` state for grid image swapping; add fullscreen dialog; split click behavior (select vs. expand) |

### Behavior Summary

| Action | Unselected Product | Selected Product |
|--------|-------------------|-----------------|
| Click grid thumbnail | Selects the product | Opens fullscreen |
| Hover grid thumbnail | Shows angle strip popover | Shows angle strip popover |
| Click angle in popover | Swaps grid thumbnail image | Swaps grid thumbnail image |
| Click edit in popover | Opens SKU editor | Opens SKU editor |

### Edge Cases

- **Default angle**: When a product first appears, `activeAngleUrls` has no entry for it, so the grid shows the composite image (existing behavior). The popover internally defaults to 3/4 via its own `activeAngleId` state. On first angle click, both sync up.
- **HoverCard closing**: The `activeAngleId` inside `ProductAnglePreview` resets on each mount (popover open). But `activeAngleUrls` in the parent persists for the session, so the grid thumbnail stays on the last-clicked angle.
- **No angles available**: Falls back to composite image for grid display; popover shows "No angles available" (existing behavior).


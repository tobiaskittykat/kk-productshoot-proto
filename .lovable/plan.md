

# Make Product Editor Fully User-Friendly with Enlarged Image View

## Overview
Two changes: (1) overhaul the `EditableAnalysisPanel` so all fields use proper, visible form inputs and sections are open by default on the edit page, and (2) add click-to-enlarge on product images using a fullscreen Dialog.

## Changes

### 1. EditableAnalysisPanel -- proper inputs and open by default

**File: `src/components/creative-studio/product-shoot/EditableAnalysisPanel.tsx`**

- Add `initialOpen?: boolean` prop (default `false` for backward compat)
- Use `initialOpen` to set initial `open` state: `useState(initialOpen ?? false)`
- **InlineField**: Replace the raw `<input>` with the shadcn `Input` component. Add `Label` above the field. Increase text from `text-xs` to `text-sm`.
- **InlineTextarea**: Replace raw `<textarea>` with shadcn `Textarea`. Add `Label` above.
- **EditableComponentRow**: Wrap each row in a card-style div (`bg-background rounded-lg border p-3`) instead of just a bottom border. Increase color picker from 16px to 24px. Use `text-sm` for labels.
- **SectionHeader**: Increase label text from `text-[11px]` to `text-sm`. Make "Edited" badge more visible (`text-xs` instead of `text-[9px]`). Larger reset button.
- **Outer wrapper**: Remove the collapsible trigger's tiny text sizes. Use `text-sm` throughout.

### 2. ProductEdit page -- image enlargement + grid improvements

**File: `src/pages/ProductEdit.tsx`**

- Add state: `const [enlargedImage, setEnlargedImage] = useState<string | null>(null)`
- Wrap each image thumbnail in a clickable area -- clicking opens a Dialog showing the full-size image
- Add an `Expand` icon overlay on hover (similar to `ReferenceThumbnail` pattern already in the codebase)
- Add a fullscreen `Dialog` at the bottom of the component that shows `enlargedImage` when set
- Switch image grid from `grid-cols-3` to `grid-cols-2` for larger thumbnails
- Pass `initialOpen={true}` to `EditableAnalysisPanel`

### 3. Image Enlarge Dialog markup (in ProductEdit)

```text
<Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
  <DialogContent className="max-w-3xl p-0 overflow-hidden">
    <img src={enlargedImage} className="w-full max-h-[80vh] object-contain bg-secondary" />
  </DialogContent>
</Dialog>
```

Each image thumbnail gets:
- `cursor-pointer` and `onClick={() => setEnlargedImage(url)}`
- An `Expand` icon that appears on hover (top-left corner, like ReferenceThumbnail)

## Files Modified

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/EditableAnalysisPanel.tsx` | Add `initialOpen` prop; upgrade all fields to proper Input/Textarea components; increase text sizes; card-style component rows; larger color pickers |
| `src/pages/ProductEdit.tsx` | Add image enlarge Dialog; switch to 2-col grid; pass `initialOpen={true}`; add Expand icon overlay on thumbnails |

## What stays the same
- All save/delete/upload logic unchanged
- Database schema unchanged
- EditableAnalysisPanel backward-compatible (other callers still get collapsed by default)

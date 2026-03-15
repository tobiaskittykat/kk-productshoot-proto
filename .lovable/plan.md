

# Edit Moodboard Names & Maximize View

## What you get

1. **Inline name editing** on moodboard thumbnails — double-click the name (or click a pencil icon) to rename. Saves directly to the database.

2. **Full-screen moodboard view** — the expand button already exists on `MoodboardThumbnail` and opens a dialog with the image + visual analysis. I'll also add the ability to edit the name from within that expanded view.

## Technical approach

### 1. Add name editing to `MoodboardThumbnail`
- Add an `onRename` optional callback prop to `MoodboardThumbnailProps`
- In the full-view dialog, make the name an editable input (click-to-edit pattern)
- On the thumbnail card itself, add a small pencil icon on hover next to the name that opens inline edit
- On save, call `onRename(moodboard.id, newName)`

### 2. Wire up the rename in `MoodboardModal`
- In the "Upload Custom" tab where custom moodboards are listed, pass an `onRename` handler
- The handler calls `supabase.from('custom_moodboards').update({ name }).eq('id', realId)` (stripping the `custom-` prefix from the moodboard ID)
- Invalidate the `custom-moodboards` query cache after successful rename
- Also wire it up in the "Browse Gallery" tab for custom moodboards

### 3. Full-view dialog improvements
- The expand dialog already exists in `MoodboardThumbnail` — it shows the image + visual analysis
- Add editable name field in the dialog header (using the same click-to-edit pattern)
- Ensure the dialog is large enough to properly inspect the moodboard image

### Files changed
- `src/components/creative-studio/MoodboardThumbnail.tsx` — add `onRename` prop, editable name in thumbnail overlay and full-view dialog
- `src/components/creative-studio/MoodboardModal.tsx` — pass `onRename` handler with DB update logic


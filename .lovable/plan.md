

# Fix Moodboard Leakage in Detail Modal + Add Upload/Delete to Moodboard Section

## Issue 1: Moodboard showing on Scene Remix generations

**Root cause**: The `ImageDetailModal` shows the "Moodboard (Style)" reference section whenever a `moodboardId` or `moodboardUrl` exists on the image record. Old Scene Remix generations had the moodboard_id persisted before the metadata isolation fix was implemented. The modal doesn't check the generation mode.

**Fix in `ImageDetailModal.tsx`**:
- Check image settings for the generation mode/use case (e.g., `settings.useCase` or `settings.references.sourceImageUrl` presence indicating a remix)
- Hide the "Moodboard (Style)" section when the image was generated via Scene Remix or Remix Existing flows, since the moodboard wasn't actually used for those generations
- Specifically: if `sourceImageUrl` is present (remix indicator), suppress the moodboard display

## Issue 2: Add upload + delete to the Moodboard section in StepTwoCustomize

**Current state**: The moodboard section in `StepTwoCustomize.tsx` (lines 1081-1175) shows 3 curated moodboard thumbnails and a "Browse all moodboards" link that opens the full `MoodboardModal`. There's no way to upload or delete moodboards inline.

**Changes in `StepTwoCustomize.tsx`**:
- Add an "Upload" button next to the "Browse all moodboards" link — clicking it opens a file picker that reuses the same upload logic from `MoodboardModal` (upload to storage → insert DB record → trigger AI repair)
- Add a delete button (trash icon) overlay on each moodboard thumbnail on hover, similar to how the `MoodboardModal` upload tab already does it
- Extract the upload handler into a shared hook or import the logic to avoid duplication — or simply open the MoodboardModal directly to the "upload" tab

**Recommended approach**: Rather than duplicating the upload/delete logic, add a small toolbar row above the moodboard grid with:
1. An "Upload" button that opens the `MoodboardModal` pre-set to the "Upload Custom" tab
2. A delete overlay on each moodboard card (trash icon on hover) that calls the same delete logic

This keeps the code DRY since `MoodboardModal` already handles uploads, AI analysis, and deletion.

### Technical details

**File: `src/components/creative-studio/ImageDetailModal.tsx`**
- In the moodboard display block (~line 306), wrap with an additional condition: only show if the image is NOT a remix (check `!sourceImageUrl`)

**File: `src/components/creative-studio/StepTwoCustomize.tsx`**
- Add `Upload` and `Trash2` icon imports (already imported)
- Add an upload button that calls `setShowMoodboardModal(true)` with a new state to control which tab opens (pass `initialTab="upload"` prop to `MoodboardModal`)
- Add hover delete overlay on each moodboard thumbnail button
- Add delete handler that mirrors `MoodboardModal.handleDeleteCustomMoodboard` — delete from storage + DB, invalidate query, show toast

**File: `src/components/creative-studio/MoodboardModal.tsx`**
- Accept an optional `initialTab` prop to allow opening directly on the "Upload Custom" tab
- Use it in the `activeTab` state initialization


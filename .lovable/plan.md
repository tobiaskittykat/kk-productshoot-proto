

# Revert and Re-implement Moodboard Controls in the Correct Flow

## Step 1: Revert
Use the revert button on the message **before** the moodboard upload/delete changes were applied. This will undo the changes to `StepTwoCustomize.tsx`, `ImageDetailModal.tsx`, and `MoodboardModal.tsx`.

## Step 2: Re-implement in the correct files

### `LifestyleShootStep2.tsx`
- Add an **Upload** button in the moodboard section header that opens `MoodboardModal` with `initialTab="upload"`
- Add a **delete overlay** (trash icon on hover) on each custom moodboard thumbnail — delete from storage + DB, invalidate query, toast
- Add a **"Browse all"** link to open `MoodboardModal` on the browse tab
- Import and render `MoodboardModal` with state for visibility and initial tab

### `MoodboardModal.tsx`
- Already accepts `initialTab` prop (was added in previous changes) — re-apply this small change only
- Sync `activeTab` state when `initialTab` or `isOpen` changes

### `ImageDetailModal.tsx`
- Re-apply the moodboard leakage fix: suppress moodboard reference display when `sourceImageUrl` is present (remix indicator)

## What stays the same
- No changes to `StepTwoCustomize.tsx` this time
- All existing moodboard selection logic unchanged
- The styled still life compositional variety changes (already merged) are preserved


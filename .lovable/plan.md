

# Add Region Grouping to Scene Gallery

## Overview
Add a "region" dimension to scene images so users can organize scenes by market region (USA, Europe, APAC, MEA). Region is a business concept (not visually detectable), so users will assign it manually via a dropdown. The UI will show region filter pills above the existing category pills.

## Database Change

Add a `region` column to `scene_images`:

```sql
ALTER TABLE public.scene_images 
ADD COLUMN region text NOT NULL DEFAULT 'all';
```

No new RLS policies needed -- existing policies cover the column.

## Regions

```text
all (default/unassigned) | usa | europe | apac | mea
```

## UI Changes

### BackgroundSelector.tsx -- Scene tab

1. **Region filter row** -- horizontal pills above the category pills: "All Regions", "USA", "Europe", "APAC", "MEA" (with count badges, same style as category pills)
2. **Filtering** -- scenes are filtered by BOTH region AND category (intersection)
3. **Region assignment on upload** -- after uploading a scene, a small dropdown appears on the new scene card (or a pre-upload region selector) to assign region. Default: "All" (unassigned)
4. **Region badge on cards** -- small region label on scene thumbnails so users can see at a glance

### Region selector before upload
Add a small dropdown/select above the grid: "Upload to region: [USA v]" so new uploads are automatically tagged with the selected region. This avoids needing a separate edit step.

## Hook Changes

### useSceneImages.ts
- Add `region` to `SceneImage` interface
- Export `SCENE_REGIONS` constant
- Update `createScene` mutation to accept `{ file: File, region?: string }` instead of just `File`
- Add `updateSceneRegion` mutation for reassigning existing scenes

## Files Modified

1. **Migration SQL** -- Add `region` column to `scene_images`
2. **`src/hooks/useSceneImages.ts`** -- Add region to interface, SCENE_REGIONS constant, update createScene to accept region, add updateSceneRegion mutation
3. **`src/components/creative-studio/product-shoot/BackgroundSelector.tsx`** -- Add region filter pills, region selector for uploads, region badge on cards, dual filtering (region + category)

## Technical Details

- Add UPDATE RLS policy for `scene_images` (currently missing) so users can change the region of existing scenes
- Region filter state stored as local component state (like `sceneCategory`)
- Filtering: `filteredScenes = sceneImages.filter(s => (region === 'all' || s.region === region) && (category === 'all' || s.category === category))`


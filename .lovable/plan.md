

# Auto-Assign Region to Scene Uploads

## Overview
Remove the manual "Upload to region" dropdown and instead have the AI automatically detect and assign the region during upload. Users can still reassign the region after upload via the hover dropdown on each scene card.

## Changes

### 1. Update classify-scene edge function to also return region
**File: `supabase/functions/classify-scene/index.ts`**
- Add `region` to the tool schema with enum: `["usa", "europe", "apac", "mea", "all"]`
- Update the prompt to instruct the AI to detect the likely geographic region based on visual cues (architecture style, signage, vegetation, cultural context)
- Return `{ category, name, region }`

### 2. Remove "Upload to" selector from BackgroundSelector
**File: `src/components/creative-studio/product-shoot/BackgroundSelector.tsx`**
- Remove the `uploadRegion` state and the "Upload to:" Select dropdown (lines 410-424)
- Remove `MapPin` from imports (no longer needed)
- The `createScene.mutate({ file })` call no longer passes a manual region -- it will come from the AI classification

### 3. Update useSceneImages hook to use AI-assigned region
**File: `src/hooks/useSceneImages.ts`**
- In the `createScene` mutation, use the `region` returned by classify-scene instead of the manually passed region
- Keep the `region` parameter as optional override, but default to the AI-classified value

### 4. Migration: Update existing scenes with correct regions
Run a one-time SQL update to assign the correct regions to existing scene images based on the user's earlier instructions:
- "wood deck with white fence" -> `usa`
- "boules court with bench" -> `europe`
- "train station" and "busy city" -> `apac`

```sql
UPDATE public.scene_images SET region = 'usa' WHERE name ILIKE '%deck%' OR name ILIKE '%fence%';
UPDATE public.scene_images SET region = 'europe' WHERE name ILIKE '%boules%' OR name ILIKE '%bench%' OR name ILIKE '%court%';
UPDATE public.scene_images SET region = 'apac' WHERE name ILIKE '%train%' OR name ILIKE '%station%' OR name ILIKE '%city%' OR name ILIKE '%urban%';
```

## Files Modified
1. `supabase/functions/classify-scene/index.ts` -- Add region detection to AI classification
2. `src/components/creative-studio/product-shoot/BackgroundSelector.tsx` -- Remove manual region upload selector
3. `src/hooks/useSceneImages.ts` -- Use AI-classified region from classify-scene response
4. Migration SQL -- Update existing scenes with correct regions


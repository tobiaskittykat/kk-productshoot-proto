
# Multi-Brand Support for Creative Studio Module

## Current State Analysis

After exploring the codebase, I found that the database schema **already supports multi-brand**, but the **application code does not filter by brand**. Here's what exists:

### Database Tables with `brand_id` Column
| Table | `brand_id` | Currently Filtered? |
|-------|-----------|---------------------|
| `brands` | Primary table | N/A (is the brand) |
| `brand_images` | YES | YES - via `useBrandImages` |
| `generated_images` | YES (nullable) | NO - only filters by `user_id` |
| `custom_moodboards` | YES (nullable) | NO - only filters by `user_id` |
| `scraped_products` | YES (nullable) | NO - only filters by `user_id` |
| `saved_concepts` | YES (nullable) | NO - only filters by `user_id` |

### Current Problems
1. **Products are user-level, not brand-level** - All products show for all brands
2. **Moodboards are user-level** - All moodboards show regardless of selected brand
3. **Generated images are user-level** - Gallery shows all images from all brands
4. **Image generation doesn't associate images with current brand** - New images have `brand_id = null`
5. **Brand context fetch assumes single brand** - `useImageGeneration.ts` fetches first brand, not current brand

---

## Solution Overview

Implement proper brand isolation by:
1. Passing `currentBrand.id` to all queries and inserts
2. Filtering all data fetches by `brand_id`
3. Associating all new records with `currentBrand.id`

---

## Implementation Plan

### 1. Update State Management

**File: `src/components/creative-studio/types.ts`**

Add `selectedBrand` to `CreativeStudioState` if not already present:
```typescript
export interface CreativeStudioState {
  // ...existing fields...
  selectedBrand?: string;  // Current brand ID for all operations
}
```

### 2. Products - Filter by Brand

**File: `src/components/creative-studio/StepTwoCustomize.tsx`**

Update the `scraped_products` query (lines 104-129):
```typescript
// Before
.eq('user_id', user.id)

// After
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter
```

Update product upload/sync to include `brand_id`:
```typescript
.insert({
  user_id: user.id,
  brand_id: currentBrand?.id,  // Associate with current brand
  // ...other fields
})
```

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

Update the `scraped_products` query (line 399-403):
```typescript
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter
```

### 3. Moodboards - Filter by Brand

**File: `src/components/creative-studio/StepTwoCustomize.tsx`**

Update the `custom_moodboards` query (lines 705-726):
```typescript
// Before
.eq('user_id', user.id)

// After
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter
```

**File: `src/components/creative-studio/MoodboardModal.tsx`**

Update the moodboards query (lines 67-89):
```typescript
queryKey: ['custom-moodboards', user?.id, currentBrand?.id],  // Include brand in cache key
// ...
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter
```

Update moodboard upload/insert (line 133-140):
```typescript
.insert({
  user_id: user.id,
  brand_id: currentBrand?.id,  // Associate with current brand
  // ...other fields
})
```

**File: `src/components/creative-studio/MoodboardBuilder.tsx`**

Update moodboard save (lines 133-151):
```typescript
.insert({
  user_id: user.id,
  brand_id: currentBrand?.id,  // Associate with current brand
  // ...other fields
})
```

### 4. Generated Images - Filter by Brand

**File: `src/pages/Gallery.tsx`**

Update the gallery queries (lines 34-37, 51-56):
```typescript
// Fetch count
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter

// Fetch images
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter
```

Add brand selector to Gallery page header for filtering.

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

Update previous images fetch (lines 73-78):
```typescript
.eq('user_id', user.id)
.eq('brand_id', currentBrand?.id)  // Add brand filter
```

**File: `src/hooks/useImageGeneration.ts`**

Update image generation to store `brand_id` (passed in request body):
```typescript
// In generateImages function (around line 227)
body: {
  // ...existing fields...
  brandId: currentBrand?.id,  // Pass to edge function for storage
}
```

Update the brand fetch (lines 177-200) to use passed `brandId` instead of first user brand:
```typescript
// Pass brandId as parameter to generateImages
const generateImages = useCallback(async (
  state: CreativeStudioState,
  logoUrl?: string,
  brandId?: string  // Add optional brandId parameter
): Promise<GeneratedImage[]> => {
  // ...
  if (brandId) {
    const { data: brand } = await supabase
      .from('brands')
      .select('name, personality, brand_context')
      .eq('id', brandId)  // Use specific brand, not first
      .single();
    // ...
  }
}
```

### 5. Saved Concepts - Filter by Brand

**File: `src/components/creative-studio/StepTwoCustomize.tsx`**

The `saved_concepts` query already has `brand_id` in insert (line 492) but needs filtering on read:
```typescript
// When loading saved concepts, filter by brand
.eq('brand_id', currentBrand?.id)
```

### 6. Edge Function Updates

**File: `supabase/functions/generate-image/index.ts`**

Accept `brandId` in request body and pass to database insert:
```typescript
const { brandId } = await req.json();

// When inserting generated_images record
.insert({
  user_id: userId,
  brand_id: brandId,  // Associate with brand
  // ...other fields
})
```

### 7. Add Brand Context to Hooks

**File: `src/components/creative-studio/MoodboardModal.tsx`**

Add `useBrands` hook:
```typescript
import { useBrands } from "@/hooks/useBrands";
// ...
const { currentBrand } = useBrands();
```

**File: `src/components/creative-studio/MoodboardBuilder.tsx`**

Add `useBrands` hook:
```typescript
import { useBrands } from "@/hooks/useBrands";
// ...
const { currentBrand } = useBrands();
```

**File: `src/pages/Gallery.tsx`**

Add brand selector and filter:
```typescript
import { useBrands } from "@/hooks/useBrands";
import BrandSelector from "@/components/BrandSelector";
// ...
const { currentBrand } = useBrands();
```

### 8. Update Query Cache Keys

All react-query cache keys should include `currentBrand?.id` to properly invalidate when brand changes:

```typescript
// Products
queryKey: ['scraped-products', user?.id, currentBrand?.id]

// Moodboards
queryKey: ['custom-moodboards', user?.id, currentBrand?.id]

// Saved concepts
queryKey: ['saved-concepts', user?.id, currentBrand?.id]
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/StepTwoCustomize.tsx` | Filter products & moodboards by brand; include `brand_id` in uploads |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Filter discovery queries by brand; pass `brandId` to generation |
| `src/components/creative-studio/MoodboardModal.tsx` | Add `useBrands`, filter by brand, include `brand_id` in uploads |
| `src/components/creative-studio/MoodboardBuilder.tsx` | Add `useBrands`, include `brand_id` in save |
| `src/hooks/useImageGeneration.ts` | Accept `brandId` param, use specific brand context |
| `src/pages/Gallery.tsx` | Add brand selector, filter images by brand |
| `supabase/functions/generate-image/index.ts` | Accept `brandId`, store in `generated_images` |

---

## Data Migration Consideration

Existing records have `brand_id = null`. Two options:

**Option A (Recommended)**: Show both brand-specific AND unassigned records
```sql
.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`)
```
This allows gradual migration as users re-sync/re-upload.

**Option B**: Run a migration to assign existing records to first brand
```sql
UPDATE scraped_products SET brand_id = (
  SELECT id FROM brands WHERE user_id = scraped_products.user_id LIMIT 1
) WHERE brand_id IS NULL;
```

---

## Summary

This implementation ensures:

1. **Products are brand-specific** - Each brand has its own product library
2. **Moodboards are brand-specific** - Each brand has its own moodboard collection
3. **Generated images are brand-specific** - Gallery filters by selected brand
4. **Saved concepts are brand-specific** - Campaign concepts belong to a brand
5. **Brand Brain is correctly applied** - Uses the selected brand's visual identity
6. **Switching brands shows relevant data** - All queries respect `currentBrand.id`

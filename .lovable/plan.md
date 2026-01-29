
# Fix Generate Variations Missing Product References

## Problem Summary

When you click "Generate Variations" on an existing image, the product reference images are not being sent to the AI generator. This causes:
1. **Wrong color** - The AI guesses the product color instead of matching your reference images
2. **Missing details** (like straps behind the heels) - The AI doesn't know the exact product construction

## Root Cause

The `generateVariations` function in `src/hooks/useImageGeneration.ts` receives the `sourceImage` parameter but **completely ignores it**:

```typescript
const generateVariations = useCallback(async (
  state: CreativeStudioState,
  sourceImage: GeneratedImage  // <-- RECEIVED BUT NEVER USED!
): Promise<GeneratedImage[]> => {
  const variationState = {
    ...state,  // <-- Uses current wizard state (often empty!)
    imageCount: 1,
    seed: Math.floor(Math.random() * 1000000),
  };
  
  return generateImages(variationState);  // No product data!
}, [generateImages]);
```

The original image has all the product references stored in `sourceImage.settings.references.productReferenceUrls`, but this data is never extracted and passed to the new generation.

## Solution

Update `generateVariations` to extract the original generation parameters from `sourceImage.settings` and pass them directly to the `generate-image` edge function (bypassing the state-based `generateImages` wrapper).

## Technical Changes

### File: `src/hooks/useImageGeneration.ts`

**Lines 597-610 - Rewrite `generateVariations` function:**

Extract from `sourceImage.settings`:
- `productReferenceUrls` - All the product reference images
- `moodboardId` / `moodboardUrl` - The original moodboard
- `shotTypePrompt` - The original shot type configuration
- `artisticStyle`, `lightingStyle`, `cameraAngle` - Technical settings
- `resolution`, `aspectRatio`, `aiModel` - Generation settings

Then call `generate-image` directly with these preserved parameters plus a new random seed.

**New implementation:**

```typescript
const generateVariations = useCallback(async (
  state: CreativeStudioState,
  sourceImage: GeneratedImage
): Promise<GeneratedImage[]> => {
  setIsGeneratingImages(true);
  
  try {
    // Extract original generation data from sourceImage.settings
    const settings = sourceImage.settings || {};
    const refs = settings.references || {};
    
    // Get product references from original image
    const productReferenceUrls = refs.productReferenceUrls || 
      (sourceImage.productReferenceUrls) || 
      (sourceImage.productReferenceUrl ? [sourceImage.productReferenceUrl] : []);
    
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        // Use refined prompt from original or fallback to prompt
        prompt: sourceImage.refinedPrompt || sourceImage.prompt || '',
        conceptTitle: sourceImage.conceptTitle,
        
        // CRITICAL: Pass product references from original image
        productReferenceUrls,
        
        // Pass moodboard from original
        moodboardId: sourceImage.moodboardId || refs.moodboardId,
        moodboardUrl: refs.moodboardUrl || sourceImage.moodboardUrl,
        
        // Pass shot type from original
        shotTypePrompt: refs.shotTypePrompt,
        
        // Technical settings from original
        artisticStyle: settings.artisticStyle || state.artisticStyle,
        lightingStyle: settings.lightingStyle || state.lightingStyle,
        cameraAngle: settings.cameraAngle || state.cameraAngle,
        
        // Generation settings
        imageCount: 1,
        resolution: settings.resolution || state.resolution,
        aspectRatio: settings.aspectRatio || state.aspectRatio,
        aiModel: settings.aiModel || state.aiModel,
        
        // New random seed for variation
        seed: Math.floor(Math.random() * 1000000),
        
        // Preserve brand association
        brandId: sourceImage.brand_id || state.brandId,
      },
    });

    if (error) {
      console.error('Error generating variation:', error);
      toast({
        title: 'Failed to generate variation',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      return [];
    }

    const images: GeneratedImage[] = (data.images || []).map((img: any) => ({
      id: img.id || `variation-${Date.now()}`,
      imageUrl: img.imageUrl || '',
      status: img.status || 'failed',
      prompt: sourceImage.prompt || '',
      refinedPrompt: img.refinedPrompt,
      conceptTitle: sourceImage.conceptTitle,
      productReferenceUrls,
      moodboardId: sourceImage.moodboardId,
      index: img.index,
    }));

    const successCount = images.filter(i => i.status === 'completed').length;
    if (successCount > 0) {
      toast({
        title: 'Variation generated!',
        description: `Created ${successCount} new variation(s)`,
      });
    }

    return images;
  } catch (err) {
    console.error('Error generating variation:', err);
    toast({
      title: 'Failed to generate variation',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    });
    return [];
  } finally {
    setIsGeneratingImages(false);
  }
}, [toast]);
```

## Expected Result After Fix

When you click "Generate Variations" on an image that was created with product references:

**Before (broken):**
```json
{
  "productReferenceUrls": [],  // Empty!
  "shotTypePrompt": null
}
```

**After (fixed):**
```json
{
  "productReferenceUrls": [
    "https://.../product-1.png",
    "https://.../product-2.png",
    // ... all original references
  ],
  "shotTypePrompt": "A single, high-resolution e-commerce image..."
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useImageGeneration.ts` | Rewrite `generateVariations` function (lines 597-610) to extract and preserve original image settings |

## Testing

After the fix:
1. Generate a Product Shoot image with a Birkenstock SKU (5 reference angles)
2. Click "Generate Variations" on the completed image
3. Verify in logs that `productReferenceUrls` contains all 5 reference URLs
4. Confirm the generated variation matches the original color, materials, and construction

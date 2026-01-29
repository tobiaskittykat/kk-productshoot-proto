

# Post-Generation Product Integrity Check

## Summary

Implement a background AI analysis that runs automatically after each image generation to compare the generated image against its product reference images. This will detect issues like incorrect colors, missing features (straps, hardware), wrong silhouette, or material mismatches - and display the results as a badge on each image card.

---

## Architecture Overview

```text
+------------------+        +----------------------+        +------------------+
| generate-image   | -----> | Client receives      | -----> | Trigger async    |
| edge function    |        | completed images     |        | integrity check  |
+------------------+        +----------------------+        +------------------+
                                                                     |
                                                                     v
                                                          +----------------------+
                                                          | analyze-product-     |
                                                          | integrity edge fn    |
                                                          +----------------------+
                                                                     |
                                                                     v
                                                          +----------------------+
                                                          | Gemini Vision API    |
                                                          | Compare images       |
                                                          +----------------------+
                                                                     |
                                                                     v
                                                          +----------------------+
                                                          | Update DB with       |
                                                          | integrity_analysis   |
                                                          +----------------------+
                                                                     |
                                                                     v
                                                          +----------------------+
                                                          | Client polls/fetches |
                                                          | displays badge       |
                                                          +----------------------+
```

---

## Components to Build

### 1. New Edge Function: `analyze-product-integrity`

**Purpose**: Compare a generated image against its product reference images using Gemini Vision

**Input**:
```typescript
{
  imageId: string;               // Generated image ID
  generatedImageUrl: string;     // URL of the generated image
  productReferenceUrls: string[]; // Array of reference product images
  productName?: string;          // Product name for context
}
```

**Output**:
```typescript
{
  score: number;          // 0-100 overall integrity score
  issues: string[];       // List of detected problems
  passesCheck: boolean;   // true if score >= 70
  details: {
    colorMatch: { score: number; notes: string };
    silhouetteMatch: { score: number; notes: string };
    featureMatch: { score: number; notes: string };
    materialMatch: { score: number; notes: string };
  }
}
```

**AI Prompt Strategy**:
- Attach ALL reference images + the generated image
- Ask Gemini to compare and score: color accuracy, silhouette fidelity, feature presence (buckles, straps, hardware), material textures
- Use function calling to extract structured analysis

---

### 2. Database Schema Update

Add a new JSONB column to `generated_images`:

```sql
ALTER TABLE generated_images 
ADD COLUMN integrity_analysis JSONB DEFAULT NULL;
```

This will store:
- `score`: 0-100
- `issues`: string[]
- `passesCheck`: boolean
- `analyzedAt`: timestamp
- `details`: sub-scores for color, silhouette, features, materials

---

### 3. Client-Side Integration

#### A. Update `useImageGeneration.ts`

After successful generation, trigger the background integrity check:

```typescript
// After images are returned successfully
const successfulImages = images.filter(i => i.status === 'completed');

// Fire-and-forget: trigger integrity analysis for each image with product refs
successfulImages.forEach(img => {
  if (productReferenceUrls.length > 0) {
    supabase.functions.invoke('analyze-product-integrity', {
      body: {
        imageId: img.id,
        generatedImageUrl: img.imageUrl,
        productReferenceUrls,
        productName: selectedSku?.name || undefined,
      }
    }).catch(err => console.error('Integrity check failed:', err));
  }
});
```

#### B. Update `GeneratedImageCard.tsx`

Add the `ProductIntegrityBadge` component to display results:

```typescript
// Fetch integrity analysis from image settings or prop
const integrityResult = image.settings?.integrityAnalysis;

// In the card footer, next to the status badge:
<ProductIntegrityBadge 
  result={integrityResult}
  isAnalyzing={!integrityResult && image.productReferenceUrls?.length > 0}
  onRegenerate={() => onVariation(image)}
  compact
/>
```

#### C. Update `ImageDetailModal.tsx`

Show detailed integrity analysis in the modal sidebar:
- Full score breakdown (color, silhouette, features, materials)
- List of specific issues detected
- "Regenerate with focus on fidelity" button if score < 70

---

### 4. Hook for Live Updates: `useIntegrityResults`

Create a hook that polls or subscribes for integrity results:

```typescript
export function useIntegrityResults(imageIds: string[]) {
  const [results, setResults] = useState<Record<string, ProductIntegrityResult>>({});
  
  useEffect(() => {
    // Initial fetch for images that have integrity_analysis
    const fetchResults = async () => {
      const { data } = await supabase
        .from('generated_images')
        .select('id, integrity_analysis')
        .in('id', imageIds)
        .not('integrity_analysis', 'is', null);
      
      const resultsMap = {};
      data?.forEach(img => {
        resultsMap[img.id] = img.integrity_analysis;
      });
      setResults(resultsMap);
    };
    
    if (imageIds.length > 0) {
      fetchResults();
      
      // Poll every 5 seconds for updates (until all analyzed)
      const interval = setInterval(fetchResults, 5000);
      return () => clearInterval(interval);
    }
  }, [imageIds]);
  
  return results;
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/analyze-product-integrity/index.ts` | Create | New edge function for AI comparison |
| `supabase/config.toml` | Update | Register the new function |
| Migration | Create | Add `integrity_analysis` column |
| `src/hooks/useIntegrityResults.ts` | Create | Hook for fetching/polling integrity data |
| `src/hooks/useImageGeneration.ts` | Update | Trigger background check after generation |
| `src/components/creative-studio/GeneratedImageCard.tsx` | Update | Display integrity badge |
| `src/components/creative-studio/ImageDetailModal.tsx` | Update | Show detailed analysis |
| `src/components/creative-studio/types.ts` | Update | Add integrity fields to GeneratedImage type |

---

## Edge Function Implementation Details

### `analyze-product-integrity/index.ts`

```typescript
// Key implementation points:

// 1. Attach generated image + all reference images
const messages = [
  {
    role: 'user',
    content: [
      // Reference images first
      ...productReferenceUrls.map(url => ({
        type: 'image_url',
        image_url: { url }
      })),
      // Generated image last
      { type: 'image_url', image_url: { url: generatedImageUrl } },
      // Analysis prompt
      { type: 'text', text: analysisPrompt }
    ]
  }
];

// 2. Structured analysis prompt
const analysisPrompt = `
The first ${refCount} images are PRODUCT REFERENCE photos showing the actual product.
The LAST image is an AI-GENERATED image that should contain this product.

Compare the generated image to the reference images and analyze:

1. COLOR ACCURACY (0-100): Does the product color in the generated image match the reference exactly?
   - Check main color, accent colors, hardware colors
   
2. SILHOUETTE MATCH (0-100): Does the shape/form match the reference?
   - Check proportions, curves, overall outline
   
3. FEATURE PRESENCE (0-100): Are all distinctive features present?
   - Straps, buckles, hardware, logos, stitching, linings
   
4. MATERIAL ACCURACY (0-100): Do materials look correct?
   - Suede texture, leather grain, shearling, cork, rubber

Call the extract_integrity_analysis function with your findings.
`;

// 3. Use function calling for structured output
const tools = [{
  type: 'function',
  function: {
    name: 'extract_integrity_analysis',
    parameters: {
      type: 'object',
      properties: {
        overall_score: { type: 'number' },
        color_match: { 
          type: 'object',
          properties: { score: { type: 'number' }, notes: { type: 'string' } }
        },
        silhouette_match: { ... },
        feature_match: { ... },
        material_match: { ... },
        issues: { type: 'array', items: { type: 'string' } }
      }
    }
  }
}];

// 4. Update database with results
await supabase
  .from('generated_images')
  .update({
    integrity_analysis: {
      score: result.overall_score,
      issues: result.issues,
      passesCheck: result.overall_score >= 70,
      analyzedAt: new Date().toISOString(),
      details: {
        colorMatch: result.color_match,
        silhouetteMatch: result.silhouette_match,
        featureMatch: result.feature_match,
        materialMatch: result.material_match
      }
    }
  })
  .eq('id', imageId);
```

---

## UI Display

### GeneratedImageCard Badge

Position: Bottom-left corner of image, or in the footer next to status

- Green badge (80-100): "Excellent" with checkmark
- Yellow badge (60-79): "Fair" with warning icon
- Red badge (<60): "Issues" with X icon and "Regenerate" button

### ImageDetailModal Detailed View

Add a collapsible "Product Integrity" section:

```text
+------------------------------------------+
| Product Integrity           Score: 65/100 |
+------------------------------------------+
| Color Match        ████████░░  82%        |
| Silhouette         ██████░░░░  62%        |
| Features           █████░░░░░  48%        |
| Materials          ███████░░░  71%        |
+------------------------------------------+
| Issues Detected:                          |
| • Heel strap appears missing              |
| • Color is slightly darker than reference |
| • Shearling lining not visible            |
+------------------------------------------+
| [Regenerate with Focus on Fidelity]       |
+------------------------------------------+
```

---

## Performance Considerations

1. **Background execution**: Use `EdgeRuntime.waitUntil()` if the edge function needs to do cleanup
2. **Rate limiting**: Process one image at a time to avoid overwhelming the AI API
3. **Caching**: Skip analysis if product references haven't changed and score is already high
4. **Timeout handling**: Set reasonable timeout (30s) for the vision API call

---

## Migration SQL

```sql
-- Add integrity_analysis column to generated_images
ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS integrity_analysis JSONB DEFAULT NULL;

-- Add index for efficient querying of un-analyzed images
CREATE INDEX IF NOT EXISTS idx_generated_images_integrity_analysis 
ON public.generated_images ((integrity_analysis IS NULL))
WHERE integrity_analysis IS NULL;
```


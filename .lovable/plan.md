
# Smart Product Upload with AI-Powered Auto-Grouping

## Overview

Transform the product upload experience from manual SKU creation to an intelligent **"dump and sort"** workflow where users upload multiple product images and AI automatically:
1. Analyzes each image to identify the product
2. Suggests product names based on visual analysis
3. Groups images of the same product together into SKUs
4. Detects angles/views automatically (front, side, back, etc.)
5. Allows manual editing/corrections after AI processing

## User Experience Flow

```text
┌────────────────────────────────────────────────────────────────┐
│  STEP 1: BULK UPLOAD                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📂 Drag & drop your product photos here                 │  │
│  │     or click to browse (supports 20+ images)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Uploaded: 12 images                        [Start AI Sorting] │
└────────────────────────────────────────────────────────────────┘

                          ↓ AI Processing...

┌────────────────────────────────────────────────────────────────┐
│  STEP 2: REVIEW & EDIT                                         │
│                                                                │
│  AI found 3 products:                                          │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📦 Boston Brown Oiled Leather Clog                      │  │
│  │  Suggested SKU: BIRK-BOSTON-BRN    [Edit Name] [Edit SKU]│  │
│  │  ┌─────┬─────┬─────┬─────┐                               │  │
│  │  │Front│Side │Back │3/4  │  4 angles detected            │  │
│  │  │ ✓   │ ✓   │ ✓   │ ✓   │  [+ Add] [Regroup]           │  │
│  │  └─────┴─────┴─────┴─────┘                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📦 Arizona Sandal White Leather                         │  │
│  │  Suggested SKU: BIRK-ARIZ-WHT      [Edit Name] [Edit SKU]│  │
│  │  ┌─────┬─────┬─────┐                                     │  │
│  │  │Front│Top  │Side │  3 angles detected                  │  │
│  │  │ ✓   │ ✓   │ ✓   │  [+ Add] [Regroup]                 │  │
│  │  └─────┴─────┴─────┘                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📦 Ungrouped Images (5)                                 │  │
│  │  ┌───┬───┬───┬───┬───┐                                   │  │
│  │  │ ? │ ? │ ? │ ? │ ? │  [Group as new SKU] [Add to above]│  │
│  │  └───┴───┴───┴───┴───┘                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│                              [Confirm & Save All SKUs]         │
└────────────────────────────────────────────────────────────────┘
```

## Technical Architecture

### New Edge Function: `analyze-bulk-products`

Processes multiple images in a single call with smart grouping:

```typescript
// Input
{
  images: Array<{
    id: string;           // Client-generated temp ID
    url: string;          // Uploaded image URL or base64
  }>;
}

// Output
{
  groups: Array<{
    suggestedName: string;       // "Boston Brown Oiled Leather Clog"
    suggestedSku: string;        // "BIRK-BOSTON-BRN"
    confidence: number;          // 0-100 grouping confidence
    images: Array<{
      id: string;
      detectedAngle: string;     // "front", "side", "back", etc.
      angleConfidence: number;
    }>;
    productAnalysis: {           // Full product description
      summary: string;
      product_type: string;
      colors: string[];
      materials: string[];
      style_keywords: string[];
    };
  }>;
  ungrouped: Array<{
    id: string;
    reason: string;              // Why it couldn't be grouped
  }>;
}
```

### AI Grouping Logic

The AI will:
1. **Visual Similarity**: Compare visual features across images
2. **Product Recognition**: Identify if images show the same product
3. **Angle Detection**: Determine viewing angle from composition
4. **Name Generation**: Create descriptive names from visual analysis
5. **SKU Suggestion**: Generate SKU codes from product type + color + model

### New Components

| Component | Purpose |
|-----------|---------|
| `SmartUploadModal.tsx` | Full-screen modal for bulk upload workflow |
| `UploadProgressView.tsx` | Shows upload + AI analysis progress |
| `GroupReviewCard.tsx` | Editable card for each detected product group |
| `UngroupedImagesSection.tsx` | Handle images AI couldn't confidently group |
| `DragToRegroup.tsx` | Drag & drop interface to move images between groups |

### Database Changes

No schema changes needed - uses existing:
- `product_skus` table for grouped products
- `scraped_products` table for individual angle images

### UI Features for Post-AI Editing

1. **Edit Names**: Click to rename suggested product names
2. **Edit SKU Codes**: Modify auto-generated SKU codes
3. **Drag to Regroup**: Move images between groups via drag & drop
4. **Split Group**: Break a group into separate SKUs
5. **Merge Groups**: Combine multiple groups into one SKU
6. **Adjust Angles**: Override AI-detected angle labels
7. **Add More Images**: Upload additional angles to existing groups
8. **Delete Images**: Remove incorrectly included images

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/creative-studio/product-shoot/SmartUploadModal.tsx` | Main smart upload interface |
| `src/components/creative-studio/product-shoot/UploadProgressView.tsx` | Upload & analysis progress UI |
| `src/components/creative-studio/product-shoot/GroupReviewCard.tsx` | Editable product group card |
| `src/components/creative-studio/product-shoot/UngroupedSection.tsx` | Ungrouped images handler |
| `supabase/functions/analyze-bulk-products/index.ts` | AI bulk analysis & grouping |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/ProductSKUPicker.tsx` | Add "Smart Upload" button |
| `src/components/creative-studio/product-shoot/CreateSKUModal.tsx` | Add link to smart upload |
| `supabase/config.toml` | Register new edge function |

## Implementation Phases

**Phase 1: Core Smart Upload**
- Create `SmartUploadModal` with bulk drag & drop
- Build `analyze-bulk-products` edge function
- Implement basic grouping review UI

**Phase 2: Editing Features**
- Add drag-to-regroup functionality
- Implement name/SKU editing
- Add split/merge group actions

**Phase 3: Polish**
- Improve AI grouping accuracy with visual embeddings
- Add confidence indicators
- Implement undo/redo for edits

## Edge Function Implementation Details

The `analyze-bulk-products` function will:

1. **Upload all images** to temporary storage
2. **Analyze each image** individually using vision AI (reuse `analyze-product` logic)
3. **Compare visual features** across images to find matches:
   - Color palette similarity
   - Product type matching
   - Material consistency
   - Hardware/details matching
4. **Group by visual similarity** with confidence scores
5. **Detect angles** by analyzing camera position, shadows, and composition
6. **Generate names** from the most confident analysis in each group
7. **Suggest SKU codes** using pattern: `{BRAND}-{MODEL}-{COLOR}` abbreviation

## Smart Grouping Algorithm

```text
For each image pair (A, B):
  1. Compare product_type → must match
  2. Compare colors[] → 80%+ overlap
  3. Compare materials[] → 70%+ overlap  
  4. Compare style_keywords[] → 50%+ overlap
  5. If all pass → same product, group together

For angle detection:
  - "front": product facing camera directly
  - "side": product rotated 90°
  - "back": rear view visible
  - "3/4": angled view (most common)
  - "top": overhead shot
  - "detail": close-up of specific feature
  - "sole": bottom of shoe visible
```

## Entry Point Integration

The "Smart Upload" button will appear in two places:
1. **ProductSKUPicker** - "✨ Smart Upload" button at top
2. **CreateSKUModal** - "Or try Smart Upload →" link at bottom

Both open the `SmartUploadModal` for the full intelligent upload experience.

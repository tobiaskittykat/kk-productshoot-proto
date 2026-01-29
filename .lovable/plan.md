
# Enhanced Product Shoot Workflow Improvements

## Overview

This plan addresses four key improvements to the Product Shot workflow:

1. **Aspect Ratio Fix** - Ensure the selected aspect ratio is correctly passed to the AI image generation model
2. **Product Section Organization** - Add "last used" tracking and improved organization for large product libraries
3. **Bottom Bar Cleanup** - Match the Lifestyle flow's bottom bar design with product, shot type, and background info
4. **Sequential Generation Mode** - New option to generate fresh random prompts for each image in a batch

---

## 1. Aspect Ratio Fix

### Problem
The aspect ratio is currently passed to the edge function and saved in metadata, but never included in the actual prompt sent to the AI model. The AI has no guidance on what aspect ratio to produce.

### Solution
Add aspect ratio instruction to the creative brief in the prompt agent.

### Changes

**File: `supabase/functions/generate-image/index.ts`**

Add aspect ratio to the Technical Settings section of the creative brief:

```typescript
// In craftPromptWithAgent function, add to TECHNICAL SETTINGS section:
if (request.aspectRatio && request.aspectRatio !== '1:1') {
  sections.push(`Aspect Ratio: ${request.aspectRatio} (compose the image to fit this format)`);
}
```

Also add explicit instruction in the system prompt about respecting aspect ratio when specified.

---

## 2. Product Section Organization with Last Used Tracking

### Problem
With 1000+ products, users need better organization:
- Quick access to recently used products
- Default selection of last used product
- Search/filter capability

### Solution
Add `last_used_at` column to track product usage and reorganize the picker UI.

### Database Changes

Add migration for tracking last used:
```sql
ALTER TABLE product_skus ADD COLUMN last_used_at TIMESTAMPTZ;
CREATE INDEX idx_product_skus_last_used ON product_skus(user_id, last_used_at DESC NULLS LAST);
```

### Frontend Changes

**File: `src/components/creative-studio/product-shoot/ProductSKUPicker.tsx`**

1. Fetch products ordered by `last_used_at DESC NULLS LAST, created_at DESC`
2. Add "Recently Used" section showing the 3-5 most recently used products
3. Add search input to filter by name/SKU code
4. Pre-select the most recently used product by default on mount

**File: `src/hooks/useImageGeneration.ts`**

When generating images with a product SKU, update `last_used_at`:
```typescript
// After successful generation with a product:
await supabase
  .from('product_skus')
  .update({ last_used_at: new Date().toISOString() })
  .eq('id', skuId);
```

---

## 3. Bottom Bar Cleanup

### Problem
The current Product Shot bottom bar shows minimal info: shot type and setting type. It should match the Lifestyle flow's clean, informative design showing:
- Selected product (with thumbnail)
- Shot type
- Background type (Studio/Outdoor)

### Solution
Redesign the bottom bar content for Product Shot mode.

### Changes

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

Replace the basic product shoot info section (lines 939-948) with a more informative layout:

```tsx
{state.useCase === 'product' && (
  <div className="flex items-center gap-4 text-sm">
    {/* Product thumbnail + name */}
    {selectedProductImage && (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border">
        <img 
          src={selectedProductImage} 
          alt="Product" 
          className="w-6 h-6 rounded object-cover"
        />
        <span className="max-w-[100px] truncate text-muted-foreground">
          {selectedProductName}
        </span>
      </div>
    )}
    
    {/* Shot type badge */}
    <span className="px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-muted-foreground">
      {shotTypeDisplayName}
    </span>
    
    {/* Background badge */}
    <span className="px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-muted-foreground">
      {state.productShoot.settingType === 'studio' ? '🏢 Studio' : '🌳 Outdoor'}
    </span>
  </div>
)}
```

---

## 4. Sequential Generation Mode

### Problem
When generating multiple images (e.g., 4x or 8x), all images use the same prompt with the same random selections. This limits variety.

### Solution
Add a "Sequential Mode" toggle to Output Settings. When enabled:
- Each image gets a fresh call to `buildOnFootPrompt()` / `buildLifestylePrompt()` with new random selections
- Creates variety in poses, clothing, colors across the batch

### Changes

**File: `src/components/creative-studio/types.ts`**

Add new state property:
```typescript
interface CreativeStudioState {
  // ... existing
  sequentialGeneration: boolean; // Generate fresh prompts for each image
}

// Default: false
```

**File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`**

Add toggle to Output Settings section:
```tsx
<div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
  <div className="space-y-0.5">
    <label className="text-sm font-medium">Sequential Generation</label>
    <p className="text-xs text-muted-foreground">Fresh styling for each image</p>
  </div>
  <Switch
    checked={sequentialGeneration}
    onCheckedChange={(v) => onOutputSettingsChange({ sequentialGeneration: v })}
  />
</div>
```

**File: `src/hooks/useImageGeneration.ts`**

Modify the generation logic to handle sequential mode:
```typescript
// If sequential mode, generate a new shotTypePrompt for each image
if (state.sequentialGeneration && state.useCase === 'product') {
  // Loop through imageCount, calling buildXxxPrompt() fresh each time
  // Each call regenerates random selections for auto fields
  for (let i = 0; i < state.imageCount; i++) {
    const freshShotTypePrompt = buildOnFootPrompt(onFootConfig, bgContext);
    // Generate single image with this prompt
  }
} else {
  // Current behavior: single prompt for all images
}
```

**File: `supabase/functions/generate-image/index.ts`**

When `sequentialMode: true` is passed:
- Call `craftPromptWithAgent()` fresh for each image
- Pass a flag indicating sequential mode so each call can vary appropriately

---

## Summary of File Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Add aspect ratio to prompt, handle sequential mode |
| `src/components/creative-studio/types.ts` | Add `sequentialGeneration` state property |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Add Sequential toggle, pass prop |
| `src/components/creative-studio/product-shoot/ProductSKUPicker.tsx` | Add search, recent section, default selection |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Enhanced bottom bar for product shoots |
| `src/hooks/useImageGeneration.ts` | Update last_used_at, handle sequential generation |
| Database migration | Add `last_used_at` column to `product_skus` |

---

## Implementation Order

1. **Database migration** - Add `last_used_at` column
2. **Aspect ratio fix** - Quick win in edge function
3. **Sequential generation** - Add state + toggle + generation logic
4. **Product organization** - Picker enhancements with search and recent
5. **Bottom bar cleanup** - UI polish

---

## Technical Notes

- Sequential generation will be slower (N separate prompt crafting calls instead of 1)
- Consider capping sequential mode at 4 images to prevent excessive API calls
- Product last_used tracking updates should be fire-and-forget (don't block generation)
- The "recent products" section should show max 5 items with clear visual distinction

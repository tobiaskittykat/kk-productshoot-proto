

# Fix Product Image Limits for Generation and Display

## Problem Identified

You have **5 product images** (detail, side, 3/4, sole, top) but the system is limiting them in two places:

1. **Generation**: Only 3 product images are sent to the AI
2. **UI Display**: The "Image References" section only shows 3 images

## Root Causes

### 1. Frontend Fetch Limit (useImageGeneration.ts)
```typescript
// Line 204-205 - fetches only 4 angles
const { data: angles } = await supabase
  .from('scraped_products')
  .select('thumbnail_url, full_url, name')
  .eq('sku_id', skuId)
  .limit(4);  // <-- LIMIT
```

### 2. Edge Function Attachment Limit (generate-image/index.ts)
```typescript
// Lines 829-830 - only attaches 3 product images to AI
for (let i = 0; i < Math.min(productUrls.length, 3); i++) {  // <-- LIMIT
  const url = productUrls[i];
  messageContent.push({ type: "image_url", image_url: { url } });
}
```

### 3. UI Display Limit (ImageDetailModal.tsx)
```typescript
// Line 269 - only displays 3 product images
{productUrls.slice(0, 3).map((url, idx) => ...  // <-- LIMIT
```

## Solution

### File Changes

| File | Change |
|------|--------|
| `src/hooks/useImageGeneration.ts` | Remove the `.limit(4)` constraint when fetching angles |
| `supabase/functions/generate-image/index.ts` | Increase product image limit from 3 to 6 (reasonable balance for API payload size) |
| `src/components/creative-studio/ImageDetailModal.tsx` | Show all product URLs, not just first 3 |

### Implementation Details

#### 1. useImageGeneration.ts (Line ~205)
**Before:**
```typescript
.limit(4);
```
**After:**
```typescript
.limit(10); // Allow up to 10 angles per SKU
```

#### 2. generate-image/index.ts (Lines 829-830)
**Before:**
```typescript
for (let i = 0; i < Math.min(productUrls.length, 3); i++) {
```
**After:**
```typescript
// Attach up to 6 product reference images for better fidelity
for (let i = 0; i < Math.min(productUrls.length, 6); i++) {
```

Also update the fidelity instruction text to reflect the variable count:
```typescript
text: `PRODUCT FIDELITY IS CRITICAL: The above ${Math.min(productUrls.length, 6)} image(s) are PRODUCT REFERENCES...`
```

#### 3. ImageDetailModal.tsx (Lines 268-294)
**Before:**
```typescript
{productUrls.slice(0, 3).map((url, idx) => ...
```
**After:**
```typescript
{productUrls.map((url, idx) => ...
```

Also make the grid responsive for more images:
```typescript
<div className={cn(
  "grid gap-2",
  productUrls.length <= 3 ? "grid-cols-3" : 
  productUrls.length <= 4 ? "grid-cols-4" :
  "grid-cols-5"
)}>
```

## Result

After these changes:
- **Generation**: Up to 6 product images will be attached to the AI (all 5 of your current images)
- **UI Display**: All product reference images will be visible in the Image Details modal
- **Fetch**: Up to 10 product angles can be fetched per SKU

## Trade-offs Considered

- **Why limit to 6 for generation?** Larger payloads increase latency and cost. 6 images provide comprehensive product coverage (front, back, side, detail, top, sole) without excessive overhead.
- **Why 10 for fetch?** Allows for future expansion while keeping queries reasonable.


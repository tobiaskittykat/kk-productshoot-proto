
# Fix: Component Overrides Not Passed to Image Generation

## Problem Summary

When you selected a Boston shoe and changed the upper material to blue in the Product Picker customization panel, the overrides were correctly captured in the UI but **completely lost** before reaching the AI generation engine.

---

## Technical Root Cause

The data flow breaks at **two critical points**:

### Break Point 1: ProductShootStep2.tsx (Line 596)

```text
ProductPickerModal                       ProductShootStep2
┌──────────────────────┐                ┌──────────────────────┐
│ onSelectSku(         │ ──────────────▶│ onSelectSku={(sku) =>│
│   sku,               │    ❌ LOST!    │   handleSkuSelect(   │
│   components,        │                │     sku, true        │
│   overrides,         │                │   )                  │
│   attachRefImages    │                │ }                    │
│ )                    │                │                      │
└──────────────────────┘                └──────────────────────┘
```

The callback only captures `sku`, discarding `components`, `overrides`, and `attachReferenceImages`.

### Break Point 2: useImageGeneration.ts (buildRequestBody)

The request payload sent to the edge function is missing:
- `componentOverrides` (user's material/color changes)
- `originalComponents` (analyzed defaults for comparison)
- `attachReferenceImages` (toggle setting)

---

## Fix Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FIXED DATA FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [ProductPickerModal]                                                        │
│       │                                                                      │
│       │  onSelectSku(sku, components, overrides, attachRef)                 │
│       ▼                                                                      │
│  [ProductShootStep2]                                                        │
│       │                                                                      │
│       │  handleSkuSelect(sku, components, overrides, attachRef)            │
│       │                                                                      │
│       │  onStateChange({                                                    │
│       │    selectedProductId: sku.id,                                       │
│       │    componentOverrides: overrides,      ◀── NEW                      │
│       │    attachReferenceImages: attachRef,   ◀── NEW                      │
│       │  })                                                                 │
│       ▼                                                                      │
│  [CreativeStudioWizard]                                                     │
│       │                                                                      │
│       │  state.productShoot.componentOverrides                              │
│       │  state.productShoot.attachReferenceImages                           │
│       ▼                                                                      │
│  [useImageGeneration.generateImages()]                                      │
│       │                                                                      │
│       │  buildRequestBody includes:                                         │
│       │    - componentOverrides                                             │
│       │    - originalComponents (from DB)                                   │
│       │    - attachReferenceImages                                          │
│       ▼                                                                      │
│  [generate-image Edge Function]                                             │
│       │                                                                      │
│       │  Injects "=== PRODUCT COMPONENT OVERRIDES ===" section              │
│       │  when overrides exist                                               │
│       ▼                                                                      │
│  [AI generates blue Boston as requested]                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

### 1. ProductShootStep2.tsx

**Update `handleSkuSelect` signature:**
```typescript
// Before:
const handleSkuSelect = (sku: ProductSKU, fromModal: boolean = false) => {

// After:
const handleSkuSelect = (
  sku: ProductSKU, 
  components?: ShoeComponents | null,
  overrides?: ComponentOverrides,
  attachReferenceImages?: boolean,
  fromModal: boolean = false
) => {
```

**Update `onStateChange` call:**
```typescript
onStateChange({
  selectedProductId: sku.id,
  recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
  componentOverrides: overrides,           // NEW
  attachReferenceImages: attachReferenceImages ?? true,  // NEW
});
```

**Update ProductPickerModal callback (line 596):**
```typescript
// Before:
onSelectSku={(sku) => handleSkuSelect(sku, true)}

// After:
onSelectSku={(sku, components, overrides, attachRef) => 
  handleSkuSelect(sku, components, overrides, attachRef, true)
}
```

---

### 2. useImageGeneration.ts

**Add `components` to SKU query (around line 197):**
```typescript
const { data: sku } = await supabase
  .from('product_skus')
  .select('composite_image_url, name, description, components')  // ADD components
  .eq('id', skuId)
  .maybeSingle();
```

**Add override fields to `buildRequestBody` (around line 458):**
```typescript
// Inside buildRequestBody function, add these fields:

// Component overrides for shoe customization
componentOverrides: state.productShoot?.componentOverrides || undefined,
originalComponents: sku?.components || undefined,
attachReferenceImages: state.productShoot?.attachReferenceImages ?? true,
```

**Handle reference image toggle (before attaching product images):**
```typescript
// Only attach product reference images if toggle is on
const shouldAttachRefs = state.productShoot?.attachReferenceImages !== false;

if (shouldAttachRefs && productReferenceUrls.length > 0) {
  // existing image attachment logic
} else {
  console.log('Reference images disabled - prompt-only generation');
}
```

---

### 3. generate-image/index.ts (Already Implemented - Verify)

Confirm the edge function correctly handles:
- `componentOverrides` in the request body
- Injects override section into prompt when present
- Respects `attachReferenceImages` toggle

---

## Implementation Order

1. **ProductShootStep2.tsx** - Fix callback to capture all 4 parameters
2. **useImageGeneration.ts** - Add override fields to request body
3. **Test** - Select a Boston, change upper to blue suede, generate

---

## Expected Result After Fix

When you select the Boston Shearling and change the upper to "Suede" in "Navy" color:

1. The UI shows the override badge "Modified"
2. `componentOverrides` is passed through state
3. The edge function receives the overrides
4. The prompt includes:
   ```
   === PRODUCT COMPONENT OVERRIDES ===
   UPPER: Suede in Navy
     (Original was: Oiled Leather in Tobacco Brown)
   Keep all OTHER components exactly as shown in reference images.
   ```
5. AI generates a Navy Suede Boston instead of Tobacco Oiled Leather

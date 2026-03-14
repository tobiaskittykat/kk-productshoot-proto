

# Update Bottom Bar Indicators for Remix Mode

## Problem
The bottom sticky bar always shows "Product · Shot Type · Background" indicators — which are relevant for "New Shoot" mode but wrong for "Remix Existing". In remix mode, the relevant context is: source images, remix mode (swap vs variations), and product.

## Fix

**File:** `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx`

Update the component to check `state.shootMode` and render different indicator chips based on mode:

**When `shootMode === 'remix'`**, show:
1. **Source Images** — e.g. "Source: 2 images" (selected if `remixSourceImages.length > 0`)
2. **Remix Mode** — "Mode: Shoe Swap" or "Mode: Shoot Variations" (based on `remixVariationMode`)
3. **Product** — same as current (selected if `selectedProductId` exists)

Scroll targets for remix chips:
- Source → `section-ps-remix-source` (or whichever ID the remix source section uses)
- Mode → `section-ps-remix-mode`
- Product → `section-ps-product`

**When `shootMode === 'new'` (default)**, keep the current indicators unchanged.

One file changed, ~20 lines added.


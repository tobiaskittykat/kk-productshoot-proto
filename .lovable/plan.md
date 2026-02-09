
# Fix: Make Edit Product Modal Content Scrollable

## Problem

The Edit Product modal has `ScrollArea` wrapping the content, but the AI Analysis panel makes it overflow without proper scrolling. The issue is that padding (`px-6 py-4`) is applied to the `ScrollArea` root element, but the actual scrollable viewport is a child element inside it. The padding on the root pushes the viewport dimensions incorrectly and content overflows.

## Fix

**File:** `src/components/creative-studio/product-shoot/EditSKUModal.tsx`

Move the `px-6 py-4` padding from the `ScrollArea` element to the inner `div` that wraps the content. This ensures the Radix ScrollArea viewport correctly constrains to the available flex space and enables scrolling.

Change:
```tsx
<ScrollArea className="flex-1 px-6 py-4">
  <div className="space-y-6">
```

To:
```tsx
<ScrollArea className="flex-1">
  <div className="space-y-6 px-6 py-4">
```

This is a one-line change. The padding moves from the ScrollArea root (which wraps the Radix viewport) to the actual content container inside the viewport, allowing the scroll area to correctly measure its overflow and show the scrollbar.

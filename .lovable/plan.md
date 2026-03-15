

# Limit Inline Moodboard Gallery to 8 Most Recent

The screenshot shows a moodboard picker in the Lifestyle Shoot configuration where many moodboards are displayed inline. The user wants to show only the **latest 8** in this view, since the full library is accessible via "Browse all moodboards" link.

## Current Implementation

In `LifestyleShootStep2.tsx` (lines 208-225), the moodboards query fetches **all** custom moodboards for the user/brand, ordered by `created_at DESC`. These are then rendered in a grid (lines 344-377).

## Changes Required

**File: `src/components/creative-studio/product-shoot/LifestyleShootStep2.tsx`**

1. **Limit the query to 8 records** by adding `.limit(8)` to the Supabase query chain (line 217)
2. No UI changes needed — the grid already displays whatever's returned

This keeps the inline picker lightweight while the full library remains accessible through the modal.


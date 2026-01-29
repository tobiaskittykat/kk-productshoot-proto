
# Product Selection UX Fix + SKU Editing

## Overview

Two fixes for the Product Shoot workflow:
1. **Product selection UI**: Always show the 3-product grid with selection highlighting (don't switch to "selected preview" mode)
2. **SKU editing**: Add ability to edit uploaded products - delete images and add new angles

---

## Issue #1: Always Show 3-Product Grid

### Current Behavior (Bug)
When a product is selected, the UI switches from the 3-product inline grid to a single "selected product preview" with "Change" and "Clear" buttons. This hides the other products and makes switching between them unintuitive.

### Expected Behavior
The 3-product grid should **always** remain visible. The selected product gets a highlight/checkmark. Users can click between the 3 products without the UI changing layout. A "Browse All" button remains available for accessing the full product library.

### Technical Change

**File:** `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

**Current logic (lines 309-438):**
```jsx
{(selectedSku || selectedProduct) && currentProductImage ? (
  // Single product preview with Change/Clear buttons
) : (
  // 3-product grid + Browse All
)}
```

**New logic:**
- Remove the conditional branch entirely
- Always render the 3-product grid
- Show selection state with border highlight + checkmark
- Move product name/details to a small info row above or below the grid
- Keep "Browse All" button for accessing full library

**UI Structure After Fix:**
```text
┌─────────────────────────────────────────────────────────┐
│ Product                                     [Badge]  ▼  │
├─────────────────────────────────────────────────────────┤
│ Your Products                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│ │  ✓       │ │          │ │          │                 │
│ │ [Image]  │ │ [Image]  │ │ [Image]  │                 │
│ │ Boston   │ │ Arizona  │ │ EVA      │                 │
│ └──────────┘ └──────────┘ └──────────┘                 │
│                                                         │
│ Selected: Boston Shearling Clog in Tobacco    [Edit]    │
│ BIRK-BOSTON-SHEAR-TOB • 5 angles                       │
│                                                         │
│ [Browse All Products...]                                │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
1. Remove the conditional that hides the grid when a product is selected
2. Always show the 3-product grid with selection highlighting
3. Add a compact "selected product info" row below the grid showing:
   - Product name
   - SKU code
   - Angle count
   - **Edit button** (links to Issue #2)
4. Keep "Browse All Products..." button at the bottom

---

## Issue #2: Edit SKU Modal

### Requirement
Users need to edit uploaded products within the gallery - specifically to delete existing images and add new ones.

### Solution
Create an **EditSKUModal** component that allows:
- View all angles of the SKU
- Delete individual angle images
- Upload new angle images
- Update product name/SKU code

### New Component

**File:** `src/components/creative-studio/product-shoot/EditSKUModal.tsx`

**Features:**
- Load existing SKU data + all linked angles from `scraped_products`
- Display angles in a grid (similar to CreateSKUModal)
- Each angle has a delete button
- Upload zone to add new angles
- Save button to persist changes
- Delete SKU button (with confirmation) to remove entire product

**Props:**
```typescript
interface EditSKUModalProps {
  open: boolean;
  onClose: () => void;
  skuId: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
}
```

**Database Operations:**
1. **Delete angle**: Remove from `scraped_products` + delete from storage bucket
2. **Add angle**: Upload to storage + insert into `scraped_products`
3. **Update name/code**: Update `product_skus` table
4. **Delete SKU**: Remove all linked `scraped_products` + remove from `product_skus`

### Integration Points

1. **ProductShootStep2.tsx**: Add "Edit" button in the selected product info row
2. **ProductPickerModal.tsx**: Add edit icon button on each product row
3. **ProductAnglePreview**: Consider adding edit action here too

---

## File Changes Summary

| File | Changes |
|------|---------|
| `ProductShootStep2.tsx` | Remove conditional UI switch, always show 3-product grid, add selected info row with Edit button |
| `EditSKUModal.tsx` | **New file** - Modal for editing SKU (delete/add angles, rename, delete SKU) |
| `ProductPickerModal.tsx` | Add edit button to product rows |

---

## Technical Details

### EditSKUModal Structure

```typescript
export function EditSKUModal({ open, onClose, skuId, onUpdated, onDeleted }) {
  // Load SKU data
  const { data: sku } = useQuery(['sku-edit', skuId], fetchSkuWithAngles);
  
  // Local state for changes
  const [name, setName] = useState('');
  const [angles, setAngles] = useState<Angle[]>([]);
  const [newAngles, setNewAngles] = useState<UploadedAngle[]>([]);
  const [deletedAngleIds, setDeletedAngleIds] = useState<string[]>([]);
  
  // Delete angle handler
  const handleDeleteAngle = (angleId: string) => {
    setDeletedAngleIds(prev => [...prev, angleId]);
    setAngles(prev => prev.filter(a => a.id !== angleId));
  };
  
  // Save changes
  const handleSave = async () => {
    // 1. Delete marked angles from DB + storage
    // 2. Upload new angles to storage + insert to DB
    // 3. Update SKU name/code if changed
    // 4. Invalidate queries
  };
  
  return (
    <Dialog>
      {/* Name/SKU fields */}
      {/* Existing angles grid with delete buttons */}
      {/* Upload zone for new angles */}
      {/* Save / Cancel / Delete SKU buttons */}
    </Dialog>
  );
}
```

### Storage Deletion

When deleting an angle, need to:
1. Get the `storage_path` from `scraped_products` record
2. Delete from storage bucket: `supabase.storage.from('product-images').remove([path])`
3. Delete the `scraped_products` record

---

## Expected Result

1. **Product grid always visible**: Users can click between the 3 products without UI layout changes
2. **Edit capability**: "Edit" button opens modal to manage product angles
3. **Full control**: Users can delete unwanted angles, add missing ones, and rename products

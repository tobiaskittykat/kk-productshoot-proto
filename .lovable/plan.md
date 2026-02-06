
# Move Product Modifier Panel to Main Step 2 Interface

## Summary

Move the ShoeComponentsPanel (material/color override UI) from the ProductPickerModal to the main ProductShootStep2 interface, displaying it directly below the "Browse All Products" button. The panel will show the analyzed components for the currently selected product, allowing inline customization.

---

## Current vs. Proposed Layout

```text
CURRENT STATE:
┌─────────────────────────────────────────────────────┐
│ Product                                              │
│ ┌─────┐ ┌─────┐ ┌─────┐                             │
│ │Bost.│ │Ariz.│ │Ariz.│  ← Product Grid             │
│ └─────┘ └─────┘ └─────┘                             │
│                                                      │
│ [Browse All Products...]                             │
│                                                      │
│ ← Components panel is HIDDEN (only in modal)         │
└─────────────────────────────────────────────────────┘


PROPOSED STATE:
┌─────────────────────────────────────────────────────┐
│ Product                                              │
│ ┌─────┐ ┌─────┐ ┌─────┐                             │
│ │Bost.│ │Ariz.│ │Ariz.│  ← Product Grid             │
│ └─────┘ └─────┘ └─────┘      (Selected: Arizona)    │
│                                                      │
│ [Browse All Products...]                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Shoe Components         [Ref. Images ⚪]         │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ UPPER                        [Override ▾] │   │ │
│ │ │ EVA • Taupe            [▣]                │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ SOLE                         [Override ▾] │   │ │
│ │ │ EVA • Taupe            [▣]                │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ FOOTBED                      [Override ▾] │   │ │
│ │ │ Cork-Latex • Brown     [▣]                │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ │                                                 │ │
│ │ 💡 Override to customize before generation     │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Technical Approach

### File to Modify: `ProductShootStep2.tsx`

**1. Add hook imports for component management:**
```typescript
import { useShoeComponents, useComponentOverrides } from '@/hooks/useShoeComponents';
import { ShoeComponentsPanel } from './ShoeComponentsPanel';
import { ComponentOverrides, ShoeComponents } from '@/lib/birkenstockMaterials';
```

**2. Add state management using the existing hooks:**
```typescript
// Inside component, after existing useState calls:
const {
  components,
  isLoading: isLoadingComponents,
  isAnalyzing,
  triggerAnalysis,
  error: componentsError,
} = useShoeComponents({ skuId: state.selectedProductId });

const {
  overrides,
  setComponentOverride,
  resetOverrides,
  hasOverrides,
} = useComponentOverrides(components);
```

**3. Add local state for reference images toggle:**
```typescript
const [attachReferenceImages, setAttachReferenceImages] = useState(
  state.attachReferenceImages ?? true
);

// Sync to parent state when changed
useEffect(() => {
  onStateChange({ attachReferenceImages });
}, [attachReferenceImages]);
```

**4. Update parent state when overrides change:**
```typescript
// Sync overrides to parent state
useEffect(() => {
  onStateChange({ componentOverrides: hasOverrides ? overrides : undefined });
}, [overrides, hasOverrides]);
```

**5. Insert ShoeComponentsPanel after "Browse All Products" button (~line 436):**

```tsx
{/* Browse All Button */}
<Button
  variant="outline"
  className="w-full"
  onClick={() => setShowProductPickerModal(true)}
>
  Browse All Products...
</Button>

{/* Component Customization Panel - Only show when product selected */}
{state.selectedProductId && (
  <div className="mt-4 pt-4 border-t border-border/50">
    <ShoeComponentsPanel
      components={components}
      overrides={overrides}
      onOverrideChange={setComponentOverride}
      onResetAll={resetOverrides}
      attachReferenceImages={attachReferenceImages}
      onAttachReferenceImagesChange={setAttachReferenceImages}
      isLoading={isLoadingComponents}
      isAnalyzing={isAnalyzing}
      onTriggerAnalysis={triggerAnalysis}
      error={componentsError}
    />
  </div>
)}
```

---

## Data Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│ User selects product in grid                                     │
│         │                                                        │
│         ▼                                                        │
│ state.selectedProductId updates                                  │
│         │                                                        │
│         ▼                                                        │
│ useShoeComponents(skuId) fetches/polls components from DB        │
│         │                                                        │
│         ▼                                                        │
│ ShoeComponentsPanel displays analyzed components                 │
│         │                                                        │
│         ▼ (user clicks Override)                                 │
│ ComponentOverridePopover opens                                   │
│         │                                                        │
│         ▼ (user selects new material/color)                      │
│ useComponentOverrides updates local overrides state              │
│         │                                                        │
│         ▼                                                        │
│ useEffect syncs to parent: onStateChange({ componentOverrides }) │
│         │                                                        │
│         ▼                                                        │
│ Generate button triggers with overrides in request body          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Summary

| Change | Description |
|--------|-------------|
| Import hooks | Add `useShoeComponents`, `useComponentOverrides` |
| Import panel | Add `ShoeComponentsPanel` |
| Add component state | Use hooks to manage components and overrides |
| Add sync effects | Push overrides and attachReferenceImages to parent state |
| Render panel | Insert `ShoeComponentsPanel` below "Browse All Products" |

---

## User Experience

1. **Select Product**: User clicks on any product in the grid (e.g., Arizona Taupe EVA)
2. **See Components**: Panel appears below showing analyzed components (Upper, Sole, Footbed, etc.)
3. **Customize**: User clicks "Override ▾" on any component to change material/color
4. **Visual Feedback**: Modified components show "Modified" badge with accent styling
5. **Reference Toggle**: User can disable reference images for prompt-only generation
6. **Generate**: Overrides are passed to the generation engine

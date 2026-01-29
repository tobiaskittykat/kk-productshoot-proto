

# Update Product Focus Camera Angles with Visual Thumbnails

## Summary

Replace the current dropdown-based camera angle selector with a visual thumbnail grid that shows EXACTLY the 6 angle types from Birkenstock's e-commerce photography standard. Users will see reference thumbnails of each angle so they know exactly what output to expect.

---

## Camera Angle Mapping (from uploaded images)

| Uploaded Image | Angle Name | Description |
|----------------|------------|-------------|
| `1022457_top.jpg` | **Top Down** | Overhead view of pair, footbed visible with embossed branding |
| `1022457.jpg` | **Hero (3/4 Front)** | Classic 45° hero shot, main product image |
| `1022457_side.jpg` | **Side Profile** | Pure lateral side view, single shoe |
| `1022457_sole.jpg` | **Sole View** | One shoe showing sole tread pattern + one showing footbed |
| `1022457_detail-1.jpg` | **Detail Close-up** | Tight crop on buckles, texture, hardware |
| `1022457_pair.jpg` | **Pair Shot** | Two shoes artfully arranged, showing depth |

---

## Changes

### 1. Copy Reference Images to Assets

Copy all 6 uploaded images to `src/assets/product-angles/`:

```text
src/assets/product-angles/
├── angle-top-down.jpg
├── angle-hero.jpg
├── angle-side-profile.jpg
├── angle-sole.jpg
├── angle-detail.jpg
└── angle-pair.jpg
```

### 2. Update Camera Angle Options

**File: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`**

Replace the current `productFocusAngleOptions` with updated options that include thumbnail paths:

```typescript
export type ProductFocusAngle = 
  | 'auto'
  | 'hero'           // was 'three-quarter'
  | 'side-profile'
  | 'top-down'
  | 'sole-view'
  | 'detail-closeup'
  | 'pair-shot';     // NEW

export const productFocusAngleOptions = [
  { 
    value: 'auto', 
    label: 'Auto (AI chooses)', 
    prompt: null,
    thumbnail: null,
  },
  { 
    value: 'hero', 
    label: 'Hero (3/4 Front)', 
    prompt: 'three-quarter front view at 45-degree angle, classic hero product shot showing depth and dimension, single shoe angled toward camera',
    thumbnail: 'angle-hero.jpg',
  },
  { 
    value: 'side-profile', 
    label: 'Side Profile', 
    prompt: 'pure lateral side profile view, single shoe centered, showing full silhouette from true side angle, product facing left',
    thumbnail: 'angle-side-profile.jpg',
  },
  { 
    value: 'top-down', 
    label: 'Top Down', 
    prompt: 'overhead top-down view of pair, both shoes visible side by side, footbed and straps fully visible from above, embossed branding readable',
    thumbnail: 'angle-top-down.jpg',
  },
  { 
    value: 'sole-view', 
    label: 'Sole View', 
    prompt: 'one shoe flipped to show sole tread pattern and outsole construction, second shoe showing footbed, artfully arranged to show both surfaces',
    thumbnail: 'angle-sole.jpg',
  },
  { 
    value: 'detail-closeup', 
    label: 'Detail Close-up', 
    prompt: 'extreme close-up cropped tight on buckle hardware, strap texture, and material details, macro-style product detail shot',
    thumbnail: 'angle-detail.jpg',
  },
  { 
    value: 'pair-shot', 
    label: 'Pair Shot', 
    prompt: 'both shoes arranged at complementary angles showing depth, classic e-commerce pair composition, shoes slightly overlapping or staggered',
    thumbnail: 'angle-pair.jpg',
  },
];
```

### 3. Create Visual Angle Selector Component

**New File: `src/components/creative-studio/product-shoot/CameraAngleSelector.tsx`**

A visual grid selector that displays thumbnail images for each camera angle:

```typescript
// Visual grid of camera angles with thumbnails
// - 3x2 grid layout (or 2x3 on mobile)
// - Each option shows thumbnail image + label
// - Selected option has accent border/ring
// - "Auto" option shows grid icon instead of thumbnail
```

### 4. Update ProductFocusConfigurator

**File: `src/components/creative-studio/product-shoot/ProductFocusConfigurator.tsx`**

Replace the dropdown Select with the new visual `CameraAngleSelector` component:

```typescript
// Before: dropdown
<Select value={config.cameraAngle} onValueChange={...}>

// After: visual grid
<CameraAngleSelector
  value={config.cameraAngle}
  onChange={(v) => onConfigChange({ cameraAngle: v })}
/>
```

### 5. Export New Component

**File: `src/components/creative-studio/product-shoot/index.ts`**

Add export for the new component.

---

## UI Preview

```text
┌─────────────────────────────────────────────────┐
│ Shot Options                          [↻]  [▼]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ Camera Angle                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ ▢ Auto   │ │  [img]   │ │  [img]   │         │
│ │          │ │  Hero    │ │  Side    │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │  [img]   │ │  [img]   │ │  [img]   │         │
│ │ Top Down │ │  Sole    │ │  Detail  │         │
│ └──────────┘ └──────────┘ └──────────┘         │
│ ┌──────────┐                                    │
│ │  [img]   │                                    │
│ │  Pair    │                                    │
│ └──────────┘                                    │
│                                                 │
│ Lighting                                        │
│ ┌─────────────────────────────────────────────┐│
│ │ Auto (match background)               [▼]   ││
│ └─────────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/assets/product-angles/*.jpg` | CREATE - Copy 6 reference images |
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | MODIFY - Update angle options with thumbnails |
| `src/components/creative-studio/product-shoot/CameraAngleSelector.tsx` | CREATE - New visual selector component |
| `src/components/creative-studio/product-shoot/ProductFocusConfigurator.tsx` | MODIFY - Use visual selector |
| `src/components/creative-studio/product-shoot/index.ts` | MODIFY - Export new component |

---

## Prompt Output Example

When user selects **"Sole View"**, the prompt will include:

```text
CAMERA ANGLE:
- one shoe flipped to show sole tread pattern and outsole construction, second shoe showing footbed, artfully arranged to show both surfaces
```

This matches EXACTLY the composition shown in the `1022457_sole.jpg` reference image.


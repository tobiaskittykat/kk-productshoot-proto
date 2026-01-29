

# Product Shoot UX Refinements

## Overview

Three improvements to the Product Shoot workflow:
1. **Show all product angles** on click/hover
2. **Collapsible shot type options** (default collapsed) + review "Always Enforced" relevance
3. **Background selector** with single row + "Show More" for the rest, prioritizing recently used

---

## 1. View All Product Angles on Click/Hover

### Current State
- Product thumbnails in Step 2 show a badge like "3 angles" but no way to see them
- ProductPickerModal shows angle count but no angle preview

### Solution
Add a hover popover that shows all angles when hovering over a product thumbnail.

**Files to modify:**
- `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

**Implementation:**
```
┌─────────────────────────────────────────────────────┐
│  Hover over product thumbnail → Popover appears:   │
│  ┌───────────────────────────────────────────────┐  │
│  │   Boston - Taupe Suede                        │  │
│  │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │  │
│  │   │Side │ │Front│ │Back │ │Top  │            │  │
│  │   └─────┘ └─────┘ └─────┘ └─────┘            │  │
│  │   4 angles                                    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

- Wrap product thumbnails with `HoverCard` from Radix
- Fetch angles for the hovered SKU (already available in `fetchedSku` query)
- Show horizontal row of angle thumbnails with labels

---

## 2. Collapsible Shot Type Options (Default Collapsed)

### Current State
- Shot type configurators (`OnFootConfigurator`, `LifestyleConfigurator`, `ProductFocusConfigurator`) are always expanded
- Each has an "Always Enforced" info box taking up space

### Solution
Make shot-specific options collapsible (default collapsed) and review the "Always Enforced" content.

**Files to modify:**
- `src/components/creative-studio/product-shoot/OnFootConfigurator.tsx`
- `src/components/creative-studio/product-shoot/LifestyleConfigurator.tsx`
- `src/components/creative-studio/product-shoot/ProductFocusConfigurator.tsx`

**Implementation:**

```
┌─────────────────────────────────────────────────────┐
│  [Visual shot type cards - always visible]          │
│                                                     │
│  ▶ Shot Options                    [Collapsed]      │
│    ─────────────────────────────────────────────    │
│  (Click to expand and see Gender, Pose, etc.)      │
└─────────────────────────────────────────────────────┘
```

**Changes:**
1. Wrap configurator content in `Collapsible` with `defaultOpen={false}`
2. Add a clickable header: "Shot Options" with chevron icon
3. Keep the options inside the collapsible content

### "Always Enforced" Review

The "Always Enforced" boxes contain:
- **On Foot**: Mid-calf framing, three-quarter view, product integrity, clean lighting
- **Lifestyle**: Full body, head cropped, white background, product integrity, no logos
- **Product Focus**: Product only, Birkenstock integrity, ultra-sharp focus, e-commerce quality

**Recommendation:** These ARE still relevant as user-facing documentation BUT:
- These rules are already encoded in `defaultPrompts.ts`
- They serve as a reminder to users, not as functional code
- **Action**: Keep them but move inside the collapsed section OR convert to a small tooltip on the shot type card

**Proposed approach:** Move "Always Enforced" inside the collapsed section. When collapsed, users focus on selecting the shot type. When expanded (power users), they see both options AND the enforced rules.

---

## 3. Background Selector - Single Row + Show More

### Current State
- All 10 studio / 12 outdoor backgrounds shown in a 3-4 column grid
- No prioritization of recently used backgrounds
- Takes significant vertical space

### Solution
Show only first 4 backgrounds + "Show More" button that expands to full grid.

**Files to modify:**
- `src/components/creative-studio/product-shoot/BackgroundSelector.tsx`
- `src/components/creative-studio/product-shoot/types.ts` (if needed for last_used tracking)

**Implementation:**

```
Default (Collapsed):
┌─────────────────────────────────────────────────────┐
│  [Auto] Let AI choose                               │
│                                                     │
│  Studio | Outdoor                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │White│ │Black│ │Warm │ │Cool │  [Show 6 more...] │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
└─────────────────────────────────────────────────────┘

Expanded (After clicking "Show More"):
┌─────────────────────────────────────────────────────┐
│  [Auto] Let AI choose                               │
│                                                     │
│  Studio | Outdoor                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │White│ │Black│ │Warm │ │Cool │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │Conc │ │Marbl│ │Fabri│ │Wood │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
│  ┌─────┐ ┌─────┐                                   │
│  │Terr │ │Paper│                     [Show Less]   │
│  └─────┘ └─────┘                                   │
└─────────────────────────────────────────────────────┘
```

**Prioritization Logic:**
1. If a background was recently used (selected in a previous generation), show it first
2. This requires tracking `last_used_background_id` - could use localStorage for simplicity
3. Sort backgrounds: recently used → then default order

**Changes:**
1. Add `showAllBackgrounds` state (default `false`)
2. Slice backgrounds to first 4 when collapsed
3. Add "Show X more..." button that toggles state
4. Track last used background in localStorage
5. Reorder backgrounds to show recently used first

---

## Technical Details

### File Changes Summary

| File | Changes |
|------|---------|
| `ProductShootStep2.tsx` | Add HoverCard for product angle preview |
| `OnFootConfigurator.tsx` | Wrap in Collapsible (default collapsed), move "Always Enforced" inside |
| `LifestyleConfigurator.tsx` | Wrap in Collapsible (default collapsed), move "Always Enforced" inside |
| `ProductFocusConfigurator.tsx` | Wrap in Collapsible (default collapsed), move "Always Enforced" inside |
| `BackgroundSelector.tsx` | Add collapsed/expanded state, slice to 4 visible, add "Show More" button, prioritize recently used |

### Dependencies
- Uses existing `HoverCard` from `@/components/ui/hover-card`
- Uses existing `Collapsible` from `@/components/ui/collapsible`
- No new packages needed

---

## Expected Result

1. **Angles**: Users can hover over any product thumbnail to see all available angles
2. **Shot Options**: Cleaner UI with options collapsed by default - power users can expand
3. **Backgrounds**: Less visual clutter, faster scanning, recently used backgrounds prioritized


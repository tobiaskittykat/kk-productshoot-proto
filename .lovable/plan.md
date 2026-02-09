

# Fix: Move Shoe Components Chevron to Right Side

## Problem

The "Shoe Components" collapsible header has its chevron arrow on the left side (next to the title), while all other collapsible sections (Shot Options, Background, Shot Type) place the chevron on the right side per the `CustomizationSection` pattern.

## Fix

**File:** `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx`

Move the `ChevronDown`/`ChevronRight` icon from the left-side title group to the right side of the header row, after the Ref toggle and Reset button. This matches the `CustomizationSection` layout where:
- Left side: icon + title + badge
- Right side: action buttons + chevron

Specifically in the `CollapsibleTrigger` button (lines 218-253):
- Remove the chevron from the left `<div>` (lines 220-224)
- Add the chevron as the last element on the right side, after the Ref toggle group

| File | Change |
|------|--------|
| `ShoeComponentsPanel.tsx` | Move chevron from left title group to right side of header row |

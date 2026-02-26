

# Soften Footbed Branding Instructions Instead of Removing

## Problem
Currently the code either includes full footbed branding details (causing the AI to distort the shoe to show them) or skips them entirely. The user wants a middle ground: include the branding info but instruct the AI that it's only partly visible from certain angles and should NOT alter the product's shape to reveal it.

## Changes

### File: `supabase/functions/generate-image/index.ts`

**1. Add "natural visibility" qualifier for non-top-down product-focus angles (lines 666-704)**

Instead of the current binary skip/include logic, introduce three tiers:

- **Hidden (skip entirely)**: `on-foot`, `lifestyle`, `side-profile`, `detail-closeup` -- the footbed is genuinely not visible at all
- **Partially visible (new)**: `hero`, `pair`, `sole-view` -- the footbed may be glimpsed but is mostly obscured by the shoe's opening angle. Include branding details BUT prefix with a strong directive:
  ```
  "⚠️ NATURAL VISIBILITY ONLY: The footbed is only partially visible from this angle.
   Do NOT enlarge the shoe opening, distort proportions, or alter the product shape
   to reveal interior details. Show only what would naturally be seen from this
   camera perspective. The following branding exists on the footbed for reference:"
  ```
- **Fully visible (unchanged)**: `top-down` -- include full branding details as today

**2. Merge component overrides into PRODUCT COMPONENTS section (lines 633-653)**

Previously approved fix: when overrides exist for a component type, use the override values instead of the original analyzed values in the main components list. This prevents conflicting descriptions (e.g., "dark brown EVA sole" vs user-selected "black EVA sole").

```typescript
for (const type of componentTypes) {
  const override = request.componentOverrides?.[type];
  const comp = override || orig[type];
  if (comp && comp.material) {
    const color = override
      ? getColorDescription(override)
      : (comp.color || 'N/A');
    componentLines.push(`${type.toUpperCase()}: ${comp.material} in ${color}`);
  }
}
```

## What Changes for Users
- Hero, pair, and sole-view shots will still mention footbed branding exists, but the AI is explicitly told not to warp the shoe to show it
- Top-down shots remain unchanged (full branding emphasis)
- On-foot/lifestyle/side-profile remain unchanged (branding skipped)
- Component overrides will be reflected accurately in the prompt


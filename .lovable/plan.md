

# Auto-Sync Tokyo Heelstrap with Upper

## The Problem

On the Tokyo model, the heelstrap is always the same material and color as the upper (it's one continuous piece of suede/leather). Right now it shows as a separate editable component, which means a user could accidentally set the heelstrap to a different material -- producing an impossible shoe.

## Solution: Hide + Auto-Sync

Rather than removing heelstrap data entirely (we still want it in the prompt for accurate generation), we'll:

1. **Auto-sync the override** -- whenever the upper is overridden, the heelstrap override automatically mirrors it
2. **Hide it from the UI** -- the heelstrap row won't appear in the component panel, since users can't (and shouldn't) change it independently
3. **Keep it in the prompt** -- the override prompt builder still includes heelstrap, so the AI knows both upper and heelstrap share the same material/color

## Files Changed

### 1. `src/hooks/useShoeComponents.ts` -- Add heelstrap auto-sync

Add a new `useEffect` in `useComponentOverrides` (right next to the existing buckle sync logic):

- When an upper override is set, automatically apply the same material + color to heelstrap
- When the upper override is removed (reset), also remove the heelstrap override

This mirrors the existing buckle color-match pattern but is unconditional -- the heelstrap always follows the upper.

### 2. `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx` -- Hide heelstrap row

Filter `heelstrap` out of the `existingComponents` list so it never renders as a separate row. The user sees: Upper, Footbed, Sole, Buckles, Lining -- but not Heelstrap.

### 3. No changes to prompt builder

`buildComponentOverridePrompt` in `birkenstockMaterials.ts` already iterates all component types including heelstrap. Since the auto-sync creates a heelstrap override whenever the upper is overridden, the prompt will naturally include something like:

```
UPPER: Suede in Moss Green
  (Original was: Suede in Tobacco Brown)
HEELSTRAP: Suede in Moss Green
  (Original was: Suede in Tobacco Brown)
```

This tells the AI both pieces should match -- exactly what we want.

## How It Works End-to-End

```text
User changes Upper to "Moss Green Suede"
        |
        v
useComponentOverrides auto-sync effect fires
        |
        v
Heelstrap override set to "Moss Green Suede" (same as upper)
        |
        v
Prompt builder includes both UPPER and HEELSTRAP overrides
        |
        v
AI generates Tokyo with matching upper + heelstrap
```

## Edge Cases Handled

- **User resets all overrides**: Both upper and heelstrap are cleared
- **No upper override**: Heelstrap stays at its analyzed default (which already matches the upper from the AI analysis)
- **Quick customization ("moss green version!")**: If the AI interpret function returns an upper override, the sync hook will auto-apply it to heelstrap too
- **Other models without heelstrap**: The sync only fires when heelstrap exists in `initialComponents`, so it won't create phantom heelstrap overrides for Bostons or Arizonas


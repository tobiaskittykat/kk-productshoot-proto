

# Fix Vegan Customization to Replace ALL Non-Vegan Components

## Problem

When a user asks for a "vegan version" of a shoe, the AI customization agent often misses non-vegan components like suede lining, shearling, wool felt, or leather heelstraps. The current system prompt only has a vague rule: "For vegan/synthetic requests, use Birko-Flor or EVA materials" -- which doesn't give the AI enough guidance on which materials are non-vegan and what to replace them with.

## Root Cause

The edge function `interpret-shoe-customization` lacks:
1. An explicit list of non-vegan materials
2. Clear instructions to scan ALL components and replace every non-vegan one
3. Specific vegan substitutes for each component type

## Solution

Update the system prompt in `supabase/functions/interpret-shoe-customization/index.ts` to replace the vague rule #9 with a comprehensive vegan customization rule that:

- Defines which materials are **non-vegan**: Oiled Leather, Smooth Leather, Nubuck, Suede, Patent Leather, Shearling, Wool Felt, Shearling (Cream), Shearling (Black), and Exquisite (leather-wrapped footbed)
- Instructs the AI to scan **every component** (upper, heelstrap, lining, footbed) and replace any non-vegan material
- Provides specific vegan substitutes per component:
  - **Upper**: Birko-Flor (or Birko-Flor Nubuck for nubuck-look, Birko-Flor Patent for patent-look, Birkibuc, EVA, Canvas, Recycled PET)
  - **Heelstrap**: Birko-Flor or Birko-Flor Nubuck
  - **Lining**: Microfiber or EVA (never suede, shearling, or wool felt)
  - **Footbed**: Cork-Latex, Soft Footbed, or EVA (never Exquisite)
  - **Sole**: already vegan (EVA, Rubber, Polyurethane, Cork) -- no change needed
  - **Buckles**: already vegan -- no change needed
- Keeps the original color when substituting materials (e.g., "Suede in Taupe" becomes "Birko-Flor in Taupe")
- Adds a concrete example: `"vegan version"` with a suede upper + suede lining shows both changing

## Technical Details

### File: `supabase/functions/interpret-shoe-customization/index.ts`

**Replace rule #9** (line ~193) with an expanded vegan rule block:

```
9. VEGAN / SYNTHETIC REQUESTS — scan ALL components and replace every non-vegan material:
   NON-VEGAN MATERIALS: Oiled Leather, Smooth Leather, Nubuck, Suede, Patent Leather,
   Shearling, Shearling (Cream), Shearling (Black), Wool Felt, Exquisite (leather-wrapped).
   VEGAN SUBSTITUTES BY COMPONENT:
     - upper: Birko-Flor (default), Birko-Flor Nubuck (if original was Nubuck),
              Birko-Flor Patent (if original was Patent Leather), Birkibuc, EVA, Canvas, Recycled PET
     - heelstrap: Birko-Flor (default), Birko-Flor Nubuck
     - lining: Microfiber (default), EVA
     - footbed: keep Cork-Latex or Soft Footbed (both vegan); replace Exquisite with Cork-Latex
     - sole: already vegan (no change)
     - buckles: already vegan (no change)
   PRESERVE the original COLOR when swapping materials (e.g., Suede/Taupe -> Birko-Flor/Taupe).
   If user specifies a color too (e.g., "vegan in black"), apply both the vegan material swap AND the color.
```

**Add a vegan example** to the examples section (line ~224):

```
- "vegan version" (current: upper Suede/Taupe, lining Suede/Taupe, heelstrap Suede/Taupe)
  -> upper: Birko-Flor/Taupe/#B8A99A, heelstrap: Birko-Flor/Taupe/#B8A99A, lining: Microfiber/Taupe/#B8A99A
```

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/interpret-shoe-customization/index.ts` | Replace vague rule #9 with comprehensive vegan material mapping; add vegan example |

No frontend changes needed -- the customization hook and UI already handle any overrides the AI returns. This is purely a prompt improvement in the edge function.



# Fix AI Quick Customization: Handle "Baby Blue" and Custom Colors

## Problem Identified

From the logs, when you asked for "a baby blue version of the boston pls":
- The AI returned `{ upper: null, footbed: null, sole: null, buckles: null, heelstrap: null, lining: null }`
- This triggered the "No changes needed" toast
- **Root cause**: "Baby Blue" isn't in the color palette and the AI's prompt doesn't encourage it to create custom hex codes

## Issues to Fix

1. **Missing blue shades in palette** - Only "Navy" exists, which is a dark blue (#1E3A5F)
2. **Overly conservative AI prompt** - The prompt says "map to closest available color" but doesn't allow custom hex codes
3. **Poor interpretation of "X version"** - The AI should understand "baby blue version" means change the upper (visible parts) to baby blue

---

## Changes

### 1. Add More Blue Shades to Color Palette

**File: `src/lib/birkenstockMaterials.ts`**

Add these colors to `COLOR_PRESETS`:

```typescript
// Blues
{ name: 'Baby Blue', hex: '#89CFF0', category: 'color' },
{ name: 'Sky Blue', hex: '#87CEEB', category: 'color' },
{ name: 'Light Blue', hex: '#ADD8E6', category: 'color' },
{ name: 'Powder Blue', hex: '#B0E0E6', category: 'color' },
{ name: 'Royal Blue', hex: '#4169E1', category: 'color' },
{ name: 'Dusty Blue', hex: '#8CA9BC', category: 'color' },
```

### 2. Update Edge Function System Prompt

**File: `supabase/functions/interpret-shoe-customization/index.ts`**

Improve the prompt to handle custom colors better:

```typescript
const systemPrompt = `You are a shoe customization assistant for Birkenstock-style footwear. 
Your job is to interpret user requests and map them to specific component changes.

CURRENT SHOE COMPONENTS:
${JSON.stringify(currentComponents, null, 2)}

AVAILABLE MATERIALS BY COMPONENT:
${JSON.stringify(COMPONENT_MATERIALS, null, 2)}

REFERENCE COLORS (common names and hex codes):
${COLOR_PALETTE.map(c => `${c.name}: ${c.hex}`).join("\n")}

CRITICAL RULES:
1. Only return components that should CHANGE. Use null for unchanged components.
2. When user says "[color] version" or "make it [color]" or "all [color]" - ALWAYS change the UPPER component at minimum.
3. You CAN create custom colors not in the reference list! Just provide a descriptive name and accurate hex code.
   - Example: "baby blue" → { color: "Baby Blue", colorHex: "#89CFF0" }
   - Example: "bright orange" → { color: "Bright Orange", colorHex: "#FF6B00" }
   - Example: "forest green" → { color: "Forest Green", colorHex: "#228B22" }
4. When user specifies only a color (no material), keep the original material and just change the color.
5. "All [color]" or "entire shoe in [color]" → apply to: upper, sole, heelstrap
6. For metal buckles changing to match shoe color, use "Matte Plastic (Coordinated)" material.
7. Footbed typically stays cork unless explicitly mentioned.
8. NEVER return all nulls if the user clearly wants a color/material change.

EXAMPLES:
- "baby blue version" → upper: keep material, color: "Baby Blue", colorHex: "#89CFF0"
- "all black leather" → upper/sole/heelstrap: Smooth Leather, Black
- "white sole" → sole: keep material, color: White
- "hot pink upper with silver buckles" → upper: keep material, Hot Pink; buckles: Metal (Silver)
- "vegan taupe" → upper: Birko-Flor, Taupe; heelstrap: Birko-Flor, Taupe`;
```

### 3. Sync Edge Function Color Palette

Update `COLOR_PALETTE` in the edge function to match the expanded frontend palette (add the same blue shades).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/birkenstockMaterials.ts` | Add Baby Blue, Sky Blue, Light Blue, Powder Blue, Royal Blue, Dusty Blue to COLOR_PRESETS |
| `supabase/functions/interpret-shoe-customization/index.ts` | Update system prompt to allow custom colors; add new blue shades to COLOR_PALETTE |

---

## Expected Behavior After Fix

**User input:** "a baby blue version of the boston pls"

**AI response:**
```json
{
  "upper": { "material": "Suede", "color": "Baby Blue", "colorHex": "#89CFF0" },
  "heelstrap": null,
  "sole": null,
  "buckles": null,
  "footbed": null,
  "lining": null
}
```

**Result:** Upper changes to Baby Blue, toast shows "Applied 1 component change"




# New Lifestyle Shoot Mode — Full Implementation Plan

## Overview

Add a fourth shoot mode called "New Lifestyle Shoot" alongside New Shoot, Remix Existing, and Set Up Product. This mode is moodboard-driven: the user selects a moodboard (style DNA), picks a product (with customization), writes an optional creative brief, chooses from 4 shot types, and configures advanced photography settings. The moodboard's visual analysis drives the aesthetic of every generated image.

## Architecture Summary

```text
Step 1: Select "New Lifestyle Shoot" mode
Step 2: Configure shoot
  ┌─────────────────────────────────────────┐
  │  1. Moodboard (upload or select)        │
  │  2. Product (SKU picker + customization) │
  │  3. Creative Brief (optional textarea)  │
  │  4. Shot Type (4 options)               │
  │  5. Advanced Settings (collapsible)     │
  │  6. Output Settings (count, ratio, res) │
  └─────────────────────────────────────────┘
         ↓ Generate
  Prompt Agent receives moodboard analysis + product identity + brief + shot config
         ↓
  Image Generator receives moodboard image + product images + refined prompt
```

---

## Detailed Breakdown

### Phase 1: Types & State

**File: `src/components/creative-studio/product-shoot/types.ts`**

- Add `'lifestyle-shoot'` to `ShootMode` type (currently `'new' | 'remix' | 'setup'`)
- Add `LifestyleShootConfig` interface:
  ```typescript
  interface LifestyleShootConfig {
    // Moodboard
    selectedMoodboardId?: string;
    // Creative brief
    creativeBrief?: string;
    // Shot type (4 options)
    lifestyleShotType: LifestyleShootShotType;
    // Advanced photography settings
    advancedSettings: LifestyleAdvancedSettings;
  }
  ```
- Add `LifestyleShootShotType` enum: `'product-only' | 'feet-focus' | 'model-no-head' | 'full-model'`
- Add `LifestyleAdvancedSettings` interface with camera angle, lighting, lens, camera type, film stock — all defaulting to Birkenstock-optimal presets
- Add `lifestyleShootConfig` to `ProductShootState`
- Add `initialLifestyleShootConfig` with Birkenstock-optimal defaults

### Phase 2: Shot Type Definitions

**New file: `src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts`**

Define the 4 shot types with evocative narrative prompts for Birkenstock:

1. **Product Only** — No model, close-up/hero product shot styled within the moodboard's aesthetic world. Uses moodboard color temperature, lighting, textures.
2. **Feet Focus** — On-foot shot, cropped mid-calf down, shoes as hero. Model legs styled per moodboard mood.
3. **Model No Head** — Full body, head cropped out of frame (above chin). Outfit and pose reflect moodboard world.
4. **Full Model** — Full body, face visible, editorial. Can be shot from further away. Full lifestyle context.

Each has a `buildPrompt()` function that weaves moodboard analysis into the shot-specific narrative.

Advanced settings options (all with Birkenstock-optimized defaults):
- **Camera Angle**: Eye-level (default), Low angle, High angle, Dutch angle, Over-the-shoulder, Bird's eye
- **Lighting**: Natural/ambient (default), Studio softbox, Golden hour, Dramatic side light, Backlit, Diffused overcast
- **Camera Lens**: 85mm portrait (default), 50mm standard, 35mm wide, 135mm telephoto, 24mm ultra-wide, Macro
- **Camera Type**: Digital (default), Medium format film, 35mm film
- **Film Stock**: None/Digital (default), Kodak Portra 400, Fuji Pro 400H, Kodak Ektar 100, Ilford HP5 B&W, CineStill 800T

### Phase 3: UI Components

**File: `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx`**
- Add 4th card: "New Lifestyle Shoot" with a Palette icon
- Update grid from 3-column to 4-column (or 2x2 on smaller screens)

**New file: `src/components/creative-studio/product-shoot/LifestyleShootStep2.tsx`**
Main configuration panel with collapsible sections:

1. **Moodboard Section** — Fetch user's existing moodboards from `custom_moodboards` table. Grid of thumbnails with selection. "Upload New" button triggers existing moodboard upload flow. Shows selected moodboard's title + `overallLookAndFeel` preview.

2. **Product Section** — Reuse existing product picker pattern from `ProductShootStep2` (SKU grid, Browse More modal, component overrides panel). Identical to current New Shoot product selection.

3. **Creative Brief** — Optional textarea (2-3 lines). Placeholder: "Describe your vision... e.g., 'Relaxed Sunday morning, coffee shop terrace, warm Mediterranean light'"

4. **Shot Type** — Visual selector (4 cards with example images), similar to existing `ShotTypeVisualSelector` but with the 4 new types.

5. **Advanced Settings** — Collapsible section (collapsed by default). 5 select dropdowns with Birkenstock-optimal defaults. "Reset to defaults" button.

6. **Output Settings** — Reuse existing output settings (image count, resolution, aspect ratio).

**New file: `src/components/creative-studio/product-shoot/LifestyleShootTypeSelector.tsx`**
- Visual card selector for the 4 shot types with reference images

**New file: `src/components/creative-studio/product-shoot/LifestyleAdvancedPanel.tsx`**
- Collapsible panel with 5 select dropdowns for advanced camera/lighting/film settings

### Phase 4: Prompt Construction

**New file: `src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts`**

Build the complete prompt for the Lifestyle Shoot flow. The prompt merges:

1. **Moodboard Analysis** (from `custom_moodboards.visual_analysis`) — extracted `overallLookAndFeel`, `lightingAndMood`, `textureAndMaterials`, `colorPalette`, `cameraFraming`, `keyMotifs`
2. **Product Identity** — brand, model, color, material from SKU
3. **Shot Type** — mandatory framing rules (e.g., "head never visible" for model-no-head)
4. **Advanced Settings** — camera angle, lighting, lens, film stock woven into lighting/technical section
5. **Creative Brief** — user's free-text direction integrated naturally
6. **Brand Brain** — Birkenstock avoid list, visual DNA, model styling

Priority hierarchy (strict):
1. Brand Brain (avoid list is absolute)
2. Moodboard (defines the aesthetic world — colors, textures, lighting, mood)
3. Shot Type (mandatory framing)
4. Advanced Settings (camera/lighting overrides)
5. Creative Brief (user direction within the above constraints)
6. Product Identity (LOCKED — never alter product)

### Phase 5: Generation Integration

**File: `src/hooks/useImageGeneration.ts`**

Add a new code path for `shootMode === 'lifestyle-shoot'`:
- Fetch moodboard from DB (image URL + visual_analysis)
- Fetch product SKU (composite + angles + components)
- Build shot type prompt using `lifestyleShootPromptBuilder`
- Send to `generate-image` edge function with:
  - `moodboardUrl` + `moodboardAnalysis` (already supported)
  - `productReferenceUrls` (already supported)
  - `shotTypePrompt` (the lifestyle-specific narrative prompt)
  - `productIdentity`, `componentOverrides`, `originalComponents` (already supported)
  - New field: `lifestyleShootAdvanced` with camera/lens/film settings (passed through to prompt agent)

**File: `supabase/functions/generate-image/index.ts`**

- Add `lifestyleShootAdvanced` to the request interface
- In prompt agent construction, when `lifestyleShootAdvanced` is present, append camera/lens/film directives to the prompt
- Ensure moodboard image is attached at position 0 (already supported when `moodboardUrl` is provided)

### Phase 6: Wizard Integration

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

Add routing for `shootMode === 'lifestyle-shoot'` in Step 2:
```tsx
state.productShoot.shootMode === 'lifestyle-shoot' ? (
  <LifestyleShootStep2 ... />
) : state.productShoot.shootMode === 'remix' ? (
```

Update `ProductShootIndicators` to show lifestyle-specific status chips (Moodboard, Product, Shot Type).

### Phase 7: Barrel Exports

**File: `src/components/creative-studio/product-shoot/index.ts`**
- Export new components

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `product-shoot/types.ts` | Edit | Add `'lifestyle-shoot'` to ShootMode, add LifestyleShootConfig + LifestyleAdvancedSettings interfaces |
| `product-shoot/lifestyleShootConfigs.ts` | Create | 4 shot type definitions with narratives + advanced settings options with Birkenstock defaults |
| `product-shoot/lifestyleShootPromptBuilder.ts` | Create | Prompt construction merging moodboard + product + shot type + advanced settings |
| `product-shoot/LifestyleShootStep2.tsx` | Create | Main Step 2 panel: moodboard, product, brief, shot type, advanced, output |
| `product-shoot/LifestyleShootTypeSelector.tsx` | Create | Visual 4-card shot type selector |
| `product-shoot/LifestyleAdvancedPanel.tsx` | Create | Collapsible advanced camera/lighting/film settings |
| `product-shoot/ProductShootSubtypeSelector.tsx` | Edit | Add 4th "New Lifestyle Shoot" card |
| `product-shoot/index.ts` | Edit | Barrel exports |
| `creative-studio/CreativeStudioWizard.tsx` | Edit | Route lifestyle-shoot mode to new Step 2 component |
| `hooks/useImageGeneration.ts` | Edit | Add lifestyle-shoot generation path with moodboard + advanced settings |
| `supabase/functions/generate-image/index.ts` | Edit | Accept lifestyleShootAdvanced settings, inject into prompt agent |

This is ~12 files (5 new, 7 edited), with the bulk of new code in the Step 2 UI component and prompt builder.


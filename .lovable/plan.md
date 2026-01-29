

# Product Shoot Enhancements: Dynamic Backgrounds/Lighting + Prompt Agent Management

## Overview

Two major improvements to the Product Shoot workflow:

1. **Dynamic Background & Lighting**: Remove hardcoded studio settings, integrate background presets, auto-select lighting based on background type, and add weather options for outdoor shots
2. **Prompt Agent Management**: Add all shot-type prompt agents to AI Settings page for brand-level customization

---

## Part 1: Dynamic Background & Lighting

### Current Problem

The `buildOnFootPrompt()` and `buildLifestylePrompt()` functions have these sections hardcoded:

```typescript
// buildLifestylePrompt - lines 525-531
sections.push("BACKGROUND (MANDATORY):");
sections.push("- Pure white seamless studio background");
sections.push("- Visible floor and wall plane");
sections.push("- Soft cast shadows grounding the model");

// buildOnFootPrompt - lines 218-226
sections.push("LIGHTING & TECHNICAL (MANDATORY):");
sections.push("- Clean, diffused studio light");
sections.push("- Soft contact shadows under the soles");
```

### Solution

Make background and lighting dynamic based on user selection in the BackgroundSelector:

| Background Type | Lighting | Additional Options |
|-----------------|----------|-------------------|
| Auto | Auto | AI decides |
| Studio presets | Studio lighting (softbox, diffused) | None |
| Outdoor presets | Natural lighting | Weather condition |

### Weather Options (Outdoor Only)

| Weather | Prompt Direction |
|---------|------------------|
| Auto | AI chooses appropriate weather |
| Sunny | Bright direct sunlight, sharp shadows |
| Overcast | Soft diffused daylight, minimal shadows |
| Golden Hour | Warm golden hour light, long shadows |
| Cloudy | Soft even lighting, no harsh shadows |
| Dappled | Filtered light through trees/structures |

### Files to Modify

**1. `src/components/creative-studio/product-shoot/types.ts`**
- Add `WeatherCondition` type
- Add `weatherCondition` to `ProductShootState`
- Update `initialProductShootState`

**2. `src/components/creative-studio/product-shoot/presets.ts`**
- Add `weatherConditionOptions` with prompt directions

**3. `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`**
- Update `buildOnFootPrompt()` to accept background/lighting params
- Update `buildLifestylePrompt()` to accept background/lighting params
- Add helper function `buildBackgroundSection()` and `buildLightingSection()`
- Replace hardcoded sections with dynamic versions

**4. `src/components/creative-studio/product-shoot/BackgroundSelector.tsx`**
- Add weather condition dropdown when outdoor background is selected
- Pass weather condition to parent

**5. `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`**
- Wire up weather condition state changes

**6. `src/hooks/useImageGeneration.ts`**
- Pass background and lighting info to prompt builders

### Prompt Architecture Changes

**Before (hardcoded):**
```text
BACKGROUND (MANDATORY):
- Pure white seamless studio background
- Visible floor and wall plane
```

**After (dynamic):**
```text
BACKGROUND:
- [Dynamic: Based on selected preset]
- [If studio: "Professional studio environment, seamless backdrop"]
- [If outdoor: Background preset description + weather condition]
```

**Lighting logic:**
```typescript
if (settingType === 'studio' || backgroundId?.startsWith('studio-')) {
  // Studio lighting
  "- Professional studio lighting, softbox diffusion"
  "- Controlled shadows, even illumination"
} else if (settingType === 'outdoor' || backgroundId?.startsWith('outdoor-')) {
  // Natural lighting based on weather
  "- Natural outdoor lighting"
  "- [Weather-specific lighting description]"
} else {
  // Auto - let AI decide
  "- Lighting appropriate to the setting"
}
```

---

## Part 2: Prompt Agent Management in AI Settings

### Current State

The Settings.tsx page has two editable prompts:
- `conceptAgent` - Generates campaign concepts
- `promptAgent` - Crafts final image generation prompts (lifestyle workflow)

Missing from AI Settings:
- On Foot shot prompt
- Lifestyle shot prompt
- Product Focus shot prompt

### Solution

Add all shot-type prompts to AI Settings, stored in `brand_context.aiPrompts`:

```typescript
interface AIPrompts {
  conceptAgent?: string;
  promptAgent?: string;
  // New shot-type prompts
  onFootShotPrompt?: string;
  lifestyleShotPrompt?: string;
  productFocusShotPrompt?: string;
}
```

### Default Prompts

Extract the hardcoded prompts from `shotTypeConfigs.ts` into `src/lib/defaultPrompts.ts`:
- `DEFAULT_ON_FOOT_SHOT_PROMPT` - Base template for On Foot
- `DEFAULT_LIFESTYLE_SHOT_PROMPT` - Base template for Lifestyle
- `DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT` - Base template for Product Focus

### Files to Modify

**1. `src/lib/defaultPrompts.ts`**
- Add `DEFAULT_ON_FOOT_SHOT_PROMPT`
- Add `DEFAULT_LIFESTYLE_SHOT_PROMPT`
- Add `DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT`

**2. `src/pages/Settings.tsx`**
- Add three new collapsible sections for shot-type prompts
- Group them under a "Product Shoot Prompts" heading
- Each with reset-to-default functionality
- Save all prompts to `brand_context.aiPrompts`

**3. `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`**
- Modify `buildOnFootPrompt()` to accept optional custom template
- Modify `buildLifestylePrompt()` to accept optional custom template
- Modify `buildProductFocusPrompt()` to accept optional custom template

**4. `src/hooks/useImageGeneration.ts`**
- Fetch brand's custom shot prompts from `brand_context.aiPrompts`
- Pass custom prompts to the prompt builders if available

### UI Preview for Settings Page

```
┌─────────────────────────────────────────────────────────────┐
│ AI Settings                                                  │
│ Customize AI behavior for BIRKENSTOCK                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [▼] Concept Agent                                           │
│     Generates 9-point campaign concepts...                  │
│                                                              │
│ [▼] Prompt Agent                                            │
│     Crafts final image generation prompts...                │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│ Product Shoot Prompts                                       │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ [▼] On-Foot Shot Prompt                                     │
│     Generates prompts for leg-down shoe focus shots         │
│     [Textarea with prompt template]                         │
│     [Reset to Default]                                      │
│                                                              │
│ [▼] Full Body Shot Prompt                                   │
│     Generates prompts for lifestyle/lookbook shots          │
│     [Textarea with prompt template]                         │
│     [Reset to Default]                                      │
│                                                              │
│ [▼] Product Focus Shot Prompt                               │
│     Generates prompts for product-only photography          │
│     [Textarea with prompt template]                         │
│     [Reset to Default]                                      │
│                                                              │
│                                    [Save Changes]            │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Sequence

### Step 1: Types & Presets
1. Add `WeatherCondition` type and options to types.ts
2. Add weather presets to presets.ts
3. Update `ProductShootState` with `weatherCondition`

### Step 2: UI Components
4. Update `BackgroundSelector.tsx` with weather dropdown
5. Wire up `ProductShootStep2.tsx` for weather state

### Step 3: Prompt Builders
6. Create helper functions for dynamic background/lighting sections
7. Update `buildOnFootPrompt()` with dynamic sections
8. Update `buildLifestylePrompt()` with dynamic sections
9. Update `buildProductFocusPrompt()` with dynamic sections

### Step 4: Default Prompts
10. Extract shot prompts into `defaultPrompts.ts`

### Step 5: Settings Page
11. Update `Settings.tsx` with shot-type prompt editors
12. Update save logic to persist shot prompts

### Step 6: Generation Integration
13. Update `useImageGeneration.ts` to pass background/weather/custom prompts

---

## Result

After implementation:
- On Foot and Lifestyle shots will use the selected background preset (default: white studio cyclorama)
- Studio backgrounds will trigger studio lighting automatically
- Outdoor backgrounds will trigger natural lighting with weather options
- All shot-type prompts will be editable per-brand in AI Settings
- Custom prompts will be applied during image generation


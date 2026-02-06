
# Shoe Component Customization with Material & Color Overrides

## Executive Summary

This feature adds deep shoe component analysis and customization to the Product Shoot workflow. Each product will have its components (upper, footbed, sole, buckles, heelstrap, lining) analyzed and stored. Users can then override any component's material and/or color before generation, while preserving the exact prompt agent behavior when no overrides are made.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT ANALYSIS FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Product Upload]                                                            │
│       │                                                                      │
│       ▼                                                                      │
│  [Save to DB] ──────► [Background Task: analyze-shoe-components]            │
│       │                       │                                              │
│       │                       ▼                                              │
│       │               [Gemini Vision analyzes all angles]                   │
│       │                       │                                              │
│       │                       ▼                                              │
│       │               [Store in product_skus.components JSONB]              │
│       ▼                                                                      │
│  [User Selects Product in Picker]                                           │
│       │                                                                      │
│       ▼                                                                      │
│  [Show Component Details + Override Panel]                                  │
│       │                                                                      │
│       ├── No overrides? ──► Use existing prompt agent (no changes)          │
│       │                                                                      │
│       └── Overrides set? ──► Inject override instructions into brief        │
│               │                                                              │
│               ▼                                                              │
│       [Generate Image with modified component prompts]                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model Updates

### 1. Database Schema: Add `components` Column

Add a new JSONB column to `product_skus` to store analyzed component data:

```sql
ALTER TABLE public.product_skus
ADD COLUMN components JSONB DEFAULT NULL;
```

### 2. Component Data Structure

```typescript
interface ShoeComponent {
  material: string;       // e.g., "Suede", "Oiled Leather", "EVA"
  color: string;          // e.g., "Taupe", "Tobacco Brown"
  colorHex?: string;      // Optional hex for visual preview
  confidence: number;     // 0-100 AI confidence
  notes?: string;         // AI observations
}

interface ShoeComponents {
  upper: ShoeComponent;
  footbed: ShoeComponent;
  sole: ShoeComponent;
  buckles?: ShoeComponent;      // Optional (not all shoes have buckles)
  heelstrap?: ShoeComponent;    // Optional (Boston clogs don't have heelstraps)
  lining?: ShoeComponent;       // Optional (Arizona sandals don't have lining)
  analyzedAt: string;           // ISO timestamp
  analysisVersion: string;      // For future re-analysis
}
```

### 3. Birkenstock Material & Color Reference Library

Based on research, these are the standard options to present:

**Materials by Component:**

| Component | Materials |
|-----------|-----------|
| **Upper** | Suede, Oiled Leather, Smooth Leather, Nubuck, Birko-Flor, Birkibuc, Wool Felt, EVA, Patent Leather, Shearling |
| **Footbed** | Cork-Latex (Original), Soft Footbed (Blue Label), EVA, Exquisite (Leather-Wrapped) |
| **Sole** | EVA (Standard), Rubber, Polyurethane (PU), Cork |
| **Buckles** | Metal (Brass), Metal (Silver), Metal (Copper), Matte Plastic, Antique Brass |
| **Lining** | Shearling (Cream), Shearling (Black), Suede, Wool Felt, Microfiber |

**Color Presets:**

| Color Name | Hex Code | Notes |
|------------|----------|-------|
| Taupe | #B8A99A | Most popular suede |
| Tobacco | #6F4E37 | Oiled leather classic |
| Mocha | #967969 | Warm brown |
| Stone | #928E85 | Grey-beige |
| Black | #1C1C1C | Matte black |
| Habana | #5C4033 | Dark brown leather |
| Cognac | #834C24 | Warm reddish-brown |
| Sand | #C2B280 | Light neutral |
| White | #FFFFFF | EVA/Birko-Flor |
| Navy | #1E3A5F | Birko-Flor |
| Antique White | #FAEBD7 | Shearling lining |

---

## New Edge Function: `analyze-shoe-components`

### Purpose
Analyzes all available angles of a shoe SKU to extract detailed component information.

### System Prompt

```
You are an expert footwear analyst specializing in Birkenstock and similar sandals/clogs. 
Analyze the provided product images to identify EACH COMPONENT of the shoe.

For EACH component, extract:
1. Material type (be specific: "oiled leather" not just "leather")
2. Color (use descriptive names: "tobacco brown" not just "brown")
3. Your confidence in the identification (0-100)

COMPONENTS TO IDENTIFY:

**UPPER** (Required)
The main body of the shoe that covers/surrounds the foot.
Common materials: Suede, Oiled Leather, Smooth Leather, Nubuck, Birko-Flor, Birkibuc, Wool Felt, EVA, Patent Leather, Shearling

**FOOTBED** (Required)
The interior surface the foot rests on.
Look for: Cork-latex (visible cork texture), Soft Footbed (blue label visible), EVA (smooth/molded), Leather-wrapped (Exquisite line)
Color is usually natural cork brown or cream if shearling-lined

**SOLE** (Required)
The bottom outsole of the shoe.
Common types: EVA (lightweight, textured), Rubber (heavier, grip pattern), PU (Super Birki style)
Colors: Usually black, brown, white, or tan

**BUCKLES** (Optional - only if present)
Adjustment hardware on straps.
Types: Metal (brass/gold, silver, copper, antique brass) or Matte Plastic (EVA models)
Note: Some styles like the Boston clog have 1 buckle, Arizona has 2

**HEELSTRAP** (Optional - only if present)
Back strap that wraps behind the heel.
Note: Clogs (Boston, Kyoto) do NOT have heelstraps. Sandals (Arizona, Florida) DO have heelstraps.
Material usually matches the upper.

**LINING** (Optional - only if visible/present)
Interior lining material.
Types: Shearling (fluffy, cream or black), Wool Felt, Suede (thin), Microfiber
Note: Many styles have no lining - just exposed cork footbed

IMPORTANT:
- Analyze ALL provided images to get the most accurate assessment
- If a component is not visible or doesn't exist for this shoe type, mark it as null
- Be very specific about colors - "tobacco brown oiled leather" is better than "brown"
- For buckles, note the finish/color of the metal
```

### Tool Definition

```typescript
{
  name: 'extract_shoe_components',
  parameters: {
    type: 'object',
    properties: {
      upper: {
        type: 'object',
        properties: {
          material: { type: 'string', description: 'Specific material type' },
          color: { type: 'string', description: 'Descriptive color name' },
          colorHex: { type: 'string', description: 'Approximate hex code if determinable' },
          confidence: { type: 'number', description: '0-100 confidence score' },
          notes: { type: 'string', description: 'Any relevant observations' }
        },
        required: ['material', 'color', 'confidence']
      },
      footbed: { /* same structure */ },
      sole: { /* same structure */ },
      buckles: { /* same structure, nullable */ },
      heelstrap: { /* same structure, nullable */ },
      lining: { /* same structure, nullable */ }
    },
    required: ['upper', 'footbed', 'sole']
  }
}
```

### Trigger Logic

The analysis runs as a **background task** after SKU creation:

```typescript
// In SmartUploadModal.tsx or CreateSKUModal.tsx, after saving SKU:
EdgeRuntime.waitUntil(
  supabase.functions.invoke('analyze-shoe-components', {
    body: { skuId: newSku.id }
  })
);
```

---

## UI Components

### 1. Component Display & Override Panel (in Product Picker)

After selecting a SKU in the Product Picker Modal, show a new **"Shoe Components"** section:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📦 Selected: Boston Tobacco Oiled Leather Clog                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Shoe Components              [✓] Attach Reference Images (toggle)           │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ UPPER                                               [ Override ▾ ]      │ │
│ │ Oiled Leather • Tobacco Brown                       [▣ #6F4E37]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ FOOTBED                                             [ Override ▾ ]      │ │
│ │ Cork-Latex • Natural Brown                          [▣ #8B7355]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SOLE                                                [ Override ▾ ]      │ │
│ │ EVA • Black                                         [▣ #1C1C1C]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ BUCKLE                                              [ Override ▾ ]      │ │
│ │ Metal • Antique Brass                               [▣ #B5651D]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ LINING                                              [ Override ▾ ]      │ │
│ │ Shearling • Cream                                   [▣ #FAEBD7]        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ 💡 Override any component to customize this product before generation       │
│    (No overrides = exact product reproduction)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Override Dropdown/Popover

When user clicks "Override ▾", show:

```text
┌────────────────────────────────────────┐
│ UPPER Material                         │
│ ┌────────────────────────────────────┐ │
│ │ ○ Oiled Leather (current)          │ │
│ │ ○ Suede                            │ │
│ │ ○ Smooth Leather                   │ │
│ │ ○ Nubuck                           │ │
│ │ ○ Birko-Flor                       │ │
│ │ ○ EVA                              │ │
│ │ ○ Shearling                        │ │
│ └────────────────────────────────────┘ │
│                                        │
│ UPPER Color                            │
│ ┌────────────────────────────────────┐ │
│ │ [⬤][⬤][⬤][⬤][⬤][⬤][⬤][⬤]       │ │
│ │ Taupe  Tobacco Mocha Black ...     │ │
│ │                                    │ │
│ │ Custom: [#______] [🎨 Picker]      │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Reset to Original]        [Apply ✓]  │
└────────────────────────────────────────┘
```

### 3. Reference Images Toggle

A simple toggle switch with the selected product:

```typescript
<div className="flex items-center gap-2">
  <Switch 
    checked={attachReferenceImages}
    onCheckedChange={setAttachReferenceImages}
  />
  <span className="text-sm">Attach Reference Images</span>
</div>
```

Default: **ON** (attach images)

---

## Prompt Modification Logic

### Key Principle: Preserve Existing Behavior When No Overrides

```typescript
// In generate-image edge function, when building creative brief:

if (request.componentOverrides && hasAnyOverrides(request.componentOverrides)) {
  // User has customized components - inject override section
  sections.push("=== PRODUCT COMPONENT OVERRIDES ===");
  sections.push("⚠️ IMPORTANT: The user has customized specific shoe components.");
  sections.push("Generate the product with THESE modifications while maintaining");
  sections.push("the original silhouette and proportions from reference images:");
  sections.push("");
  
  for (const [component, override] of Object.entries(request.componentOverrides)) {
    if (override.material !== original.material || override.color !== original.color) {
      sections.push(`${component.toUpperCase()}: ${override.material} in ${override.color}`);
      sections.push(`  (Original was: ${original.material} in ${original.color})`);
    }
  }
  
  sections.push("");
  sections.push("Keep all OTHER components exactly as shown in reference images.");
  sections.push("The overall shoe silhouette/shape must remain unchanged.");
} else {
  // NO overrides - use existing product identity section as-is
  // (This is the current behavior that works well)
}
```

### Reference Image Toggle

```typescript
// In generate-image edge function:
const shouldAttachReferences = request.attachReferenceImages !== false; // Default true

if (shouldAttachReferences && productUrls.length > 0) {
  // Existing logic to attach up to 10 images
  const attachCount = Math.min(productUrls.length, 10);
  // ... attach images
} else {
  // Skip attaching product reference images
  console.log('Reference images disabled by user - prompt-only generation');
}
```

---

## State Management

### ProductShootState Updates

```typescript
// In types.ts, add to ProductShootState:
interface ComponentOverride {
  material: string;
  color: string;
  colorHex?: string;
}

interface ProductShootState {
  // ... existing fields ...
  
  // Component overrides (null = use analyzed defaults)
  componentOverrides?: {
    upper?: ComponentOverride;
    footbed?: ComponentOverride;
    sole?: ComponentOverride;
    buckles?: ComponentOverride;
    heelstrap?: ComponentOverride;
    lining?: ComponentOverride;
  };
  
  // Reference image toggle
  attachReferenceImages: boolean; // Default: true
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/xxx_add_sku_components.sql` | Create | Add `components` JSONB column |
| `supabase/functions/analyze-shoe-components/index.ts` | Create | Background component analysis |
| `supabase/functions/generate-image/index.ts` | Modify | Handle overrides + reference toggle |
| `supabase/config.toml` | Modify | Register new edge function |
| `src/components/creative-studio/product-shoot/types.ts` | Modify | Add ComponentOverride types |
| `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx` | Create | Component display + override UI |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Create | Material/color picker popover |
| `src/components/creative-studio/product-shoot/ProductPickerModal.tsx` | Modify | Integrate ShoeComponentsPanel |
| `src/lib/birkenstockMaterials.ts` | Create | Material/color reference data |
| `src/hooks/useShoeComponents.ts` | Create | Fetch/poll component analysis |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Modify | Pass overrides to generation |

---

## Implementation Phases

### Phase 1: Database + Analysis (Backend)
1. Run migration to add `components` column
2. Create `analyze-shoe-components` edge function with full system prompt
3. Trigger analysis in background after SKU creation

### Phase 2: UI Components (Frontend)
1. Create material/color reference library (`birkenstockMaterials.ts`)
2. Build `ShoeComponentsPanel` with analyzed data display
3. Build `ComponentOverridePopover` with material dropdowns + color picker
4. Integrate into `ProductPickerModal`

### Phase 3: Generation Integration
1. Add `componentOverrides` and `attachReferenceImages` to generation request
2. Modify `generate-image` to inject override prompts ONLY when overrides exist
3. Handle reference image toggle

### Phase 4: Testing & Polish
1. Test with various Birkenstock models (Boston, Arizona, Kyoto)
2. Verify overrides produce expected results
3. Confirm no-override path is unchanged

---

## Edge Cases & Considerations

1. **Analysis Not Ready**: Show skeleton/loading state with "Analyzing components..." message
2. **Analysis Failed**: Show fallback with manual entry option
3. **Non-Footwear Products**: Skip component panel for bags/accessories (check `category` or `product_type`)
4. **Re-Analysis**: Add "Re-analyze" button to manually trigger if results look wrong
5. **Multiple Products**: When multiple SKUs are selected, component panel should handle gracefully (maybe show only for first selected)

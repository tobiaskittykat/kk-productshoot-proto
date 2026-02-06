

# AI-Powered Quick Customization Input for Shoe Components

## Overview

Add a natural language input field above the shoe components list that lets users describe their desired modifications in plain English. An AI agent will interpret the description and automatically set the appropriate component overrides.

---

## User Experience

```text
┌─────────────────────────────────────────────────────────────┐
│  Shoe Components                                  [Reset All]│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✨ "all black leather with white sole"              │    │
│  │    [Apply with AI]                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ UPPER        Oiled Leather • Tobacco      [Override]│    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ FOOTBED      Cork-Latex • Natural Cork    [Override]│    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ SOLE         EVA • Black                  [Override]│    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Example Natural Language Inputs:**
- "shoe in all EVA in bright orange"
- "shoe as is, but white sole"
- "make it all black leather"
- "hot pink upper with silver buckles"
- "change just the buckles to rose gold"
- "vegan version with birko-flor in taupe"

---

## Architecture

```text
User Input → Edge Function (AI Interpretation) → Structured Overrides → UI Update
                      ↓
              Pass: current components + user text + available materials/colors
                      ↓
              Returns: { upper: {...}, sole: {...}, ... } or null for unchanged
```

---

## Changes

### 1. New Edge Function: `interpret-shoe-customization`

**File: `supabase/functions/interpret-shoe-customization/index.ts`**

Uses Gemini 2.5 Flash to interpret natural language and return structured overrides:

```typescript
// Tool definition for structured output
const TOOL_DEFINITION = {
  name: "apply_customizations",
  parameters: {
    type: "object",
    properties: {
      upper: { type: ["object", "null"], properties: { material, color, colorHex } },
      footbed: { type: ["object", "null"], properties: { material, color, colorHex } },
      sole: { type: ["object", "null"], properties: { material, color, colorHex } },
      buckles: { type: ["object", "null"], properties: { material, color, colorHex } },
      heelstrap: { type: ["object", "null"], properties: { material, color, colorHex } },
      lining: { type: ["object", "null"], properties: { material, color, colorHex } },
    }
  }
};
```

**System Prompt:**
- Receives the current shoe components (what AI detected)
- Receives the list of valid materials and colors from `birkenstockMaterials.ts`
- Interprets user intent ("make it all X" → apply to all components)
- Returns only the components that should be CHANGED (null = keep original)

### 2. New Hook: `useQuickCustomization`

**File: `src/hooks/useQuickCustomization.ts`**

```typescript
export function useQuickCustomization(
  currentComponents: ShoeComponents | null,
  onApplyOverrides: (overrides: ComponentOverrides) => void
) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyWithAI = async () => {
    // Call edge function with current components + user input
    // Merge returned overrides with any existing overrides
    // Call onApplyOverrides with the merged result
  };

  return { input, setInput, isProcessing, error, applyWithAI };
}
```

### 3. New Component: `QuickCustomizationInput`

**File: `src/components/creative-studio/product-shoot/QuickCustomizationInput.tsx`**

```typescript
<div className="space-y-2">
  <div className="relative">
    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      placeholder="Describe your customization... e.g. 'all black leather with white sole'"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && applyWithAI()}
      className="pl-10 pr-24"
      disabled={isProcessing}
    />
    <Button
      size="sm"
      onClick={applyWithAI}
      disabled={!input.trim() || isProcessing}
      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
    >
      {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
    </Button>
  </div>
  {error && <p className="text-xs text-destructive">{error}</p>}
</div>
```

### 4. Update `ShoeComponentsPanel.tsx`

Add the QuickCustomizationInput above the component rows:

```typescript
export function ShoeComponentsPanel({
  components,
  overrides,
  onOverrideChange,
  onResetAll,
  // ... other props
}: ShoeComponentsPanelProps) {
  // Add hook for quick customization
  const { input, setInput, isProcessing, error, applyWithAI } = useQuickCustomization(
    components,
    (newOverrides) => {
      // Apply each override
      Object.entries(newOverrides).forEach(([type, override]) => {
        onOverrideChange(type as ComponentType, override);
      });
    }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Shoe Components</h4>
        {/* ... existing buttons ... */}
      </div>

      {/* NEW: Quick Customization Input */}
      {components && (
        <QuickCustomizationInput
          input={input}
          onInputChange={setInput}
          onApply={applyWithAI}
          isProcessing={isProcessing}
          error={error}
        />
      )}

      {/* Existing component rows */}
      <div className="space-y-2">
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## AI Prompt Context (Edge Function)

The edge function receives:

```json
{
  "userRequest": "all black leather with white sole",
  "currentComponents": {
    "upper": { "material": "Oiled Leather", "color": "Tobacco Brown" },
    "footbed": { "material": "Cork-Latex", "color": "Natural Cork" },
    "sole": { "material": "EVA", "color": "Black" },
    "buckles": { "material": "Metal (Brass)", "color": "Gold" }
  },
  "availableMaterials": { /* from COMPONENT_MATERIALS */ },
  "availableColors": [ /* from COLOR_PRESETS */ ]
}
```

The AI interprets:
- "all" → apply to upper, footbed (if leather is valid), sole, buckles, heelstrap
- "black leather" → material: "Smooth Leather" (or Oiled Leather), color: "Black"
- "white sole" → sole: { material: unchanged, color: "White" }

Returns:
```json
{
  "upper": { "material": "Smooth Leather", "color": "Black", "colorHex": "#1C1C1C" },
  "footbed": null,  // leather not valid for footbed, keep original
  "sole": { "material": "EVA", "color": "White", "colorHex": "#FFFFFF" },
  "buckles": { "material": "Metal (Silver)", "color": "Silver", "colorHex": "#C0C0C0" }
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/interpret-shoe-customization/index.ts` | AI interpretation edge function |
| `src/hooks/useQuickCustomization.ts` | React hook for the feature |
| `src/components/creative-studio/product-shoot/QuickCustomizationInput.tsx` | UI component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx` | Integrate QuickCustomizationInput |

---

## Benefits

1. **Speed** - Describe complex multi-component changes in one sentence
2. **Discoverability** - Users learn what's possible through natural language
3. **Fine-tuning** - AI sets the baseline, users can still adjust individual components
4. **Error-tolerant** - AI maps fuzzy terms ("bright orange") to valid hex codes


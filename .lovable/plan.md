

# Upgrade "Remix Existing" with Variation Tiers (Reference Roulette)

## Problem
Currently, Remix mode only does 1:1 shoe swaps — it takes the source creative and replaces the footwear while keeping everything else identical. Users want the ability to generate images that **look like they came from the same photoshoot** but with different poses, angles, or creative interpretations — not just carbon copies.

## Concept
Adopt the **Reference Roulette** two-phase pipeline from the reference project, adapted to our shoe-focused workflow:

1. **Phase A** — Analyze the source creative with 3 parallel AI calls, each producing a structured JSON scene description at a different fidelity tier:
   - **Faithful** (Close Recreation) — forensic 1:1 recreation (current behavior, essentially)
   - **Moderate** (Subtle Variation) — same DNA, different pose/angle/crop
   - **Creative** (Campaign Reimagining) — bold reinterpretation using the scene's visual DNA

2. **Phase B** — Integrate the selected product (+ any component overrides, brand context) into each tier's JSON, producing 3 final structured prompts

3. **User reviews 3 prompt cards**, can toggle/deselect tiers, optionally edit JSON, then generate

## Architecture

### New Edge Function: `reference-roulette-prompts`

```text
Request:
  sceneReferenceUrl    — the uploaded source creative
  productReferences[]  — product images + analyzed metadata
  componentOverrides   — shoe customizations (if any)
  originalComponents   — base product analysis
  productIdentity      — brand/model/material/color
  brandName, brandPersonality, brandContext, brandBrain
  brief                — optional creative direction text
  remixRemoveText      — text removal flag
  customPrompts        — per-brand prompt overrides (from brand_context.aiPrompts)

Response:
  sceneDescription     — faithful JSON analysis of the source
  prompts[3]           — { tier, label, description, prompt (JSON string), structured (JSON object) }
```

Phase A: 3 parallel `callAI()` calls with the source image + tier-specific system prompts, using `google/gemini-3-flash-preview` for analysis. Each returns structured JSON following the NB2 schema (subject, scene, camera, composition, product_fidelity fields).

Phase B: 3 parallel `callAI()` calls that surgically edit each tier's JSON to integrate the product details, component overrides, brand context, and branding (engravings, stamps).

### Modified `generate-image` Edge Function

Add a new code path: when `skipPromptAgent: true` + `structuredPrompt` is present, use `JSON.stringify(structuredPrompt, null, 2)` as the prompt text directly (bypassing our normal prompt agent). The source image is still sent as the editing reference, product images still attached for fidelity.

### Frontend Changes

**1. New `RemixVariationMode` toggle in `RemixStep2.tsx`**

Add a new section (or toggle) between Source Images and Product Selection:

- **"Remix Mode"** selector with two options:
  - **Shoe Swap** (current behavior) — direct 1:1 shoe replacement
  - **Shoot Variations** (new) — generates 3 tiered prompt cards from the source creative

When "Shoot Variations" is selected, the flow changes:

**2. New `RoulettePromptCards.tsx` component**

After the user has selected source image(s) + product and clicks "Analyze Scene":
- Shows a loading state while Phase A + B run (6 AI calls)
- Displays 3 prompt cards (Faithful / Moderate / Creative) with:
  - Tier label + 1-line description
  - Toggle to include/exclude each tier
  - Expandable JSON editor (for advanced users)
  - Image count selector per tier
- "Generate" button processes only selected tiers

**3. Updated generation flow in `useImageGeneration.ts`**

New branch for roulette mode:
- Calls `reference-roulette-prompts` edge function first
- Shows prompt cards for user review
- On generate: calls `generate-image` with `skipPromptAgent: true` + `structuredPrompt` for each selected tier/source combination
- Product reference images still attached for fidelity

### State Changes

Add to `ProductShootState`:
```typescript
remixVariationMode: 'swap' | 'variations';  // default: 'swap'
roulettePrompts: RoulettePrompt[] | null;    // cached prompt cards from analysis
isAnalyzingScene: boolean;
```

Add new type:
```typescript
interface RoulettePrompt {
  tier: 'faithful' | 'moderate' | 'creative';
  label: string;
  description: string;
  prompt: string;           // JSON string
  structured: Record<string, any>;  // parsed JSON
  enabled: boolean;         // user can toggle
  imageCount: number;       // per-tier count
}
```

### Per-Brand Prompt Customization

Store custom roulette prompts in `brands.brand_context.aiPrompts`:
```json
{
  "rouletteFaithful": "...",
  "rouletteModerate": "...",
  "rouletteCreative": "...",
  "roulettePhaseB": "..."
}
```

Frontend reads these from the current brand and passes to the edge function. Falls back to built-in defaults.

## Implementation Steps

1. **Create `reference-roulette-prompts` edge function** — Phase A (3 parallel scene analysis) + Phase B (3 parallel asset integration), NB2 JSON schema, brand context helpers
2. **Update `generate-image` edge function** — Add `skipPromptAgent` + `structuredPrompt` code path
3. **Update `ProductShootState` types** — Add variation mode, roulette prompts, analysis state
4. **Build `RoulettePromptCards` component** — 3 tier cards with toggle, JSON editor, per-tier image count
5. **Update `RemixStep2`** — Add Swap vs Variations mode toggle, integrate prompt cards UI
6. **Update `useImageGeneration`** — New branch for roulette flow (analyze → review → generate)
7. **Wire brand-level prompt storage** — Read/write custom roulette prompts from brand_context.aiPrompts

## Key Design Decisions

- **Source image = prompt synthesis only** — sent to Phase A for analysis, sent to generator as edit reference, but the structured JSON drives composition
- **Product images = visual references** — always attached to the generator for fidelity
- **JSON as prompt** — `JSON.stringify(structured)` is the actual prompt string sent to Gemini
- **3+3 parallel calls** — Phase A and B each run 3 calls in parallel for speed
- **Shoe-specific adaptations** — Phase B integrates component overrides, branding details (engravings/stamps), and toe post sync logic from our existing remix brief builder


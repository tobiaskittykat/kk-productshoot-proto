

# Simplify Roulette Variations UX: Toggle Tiers → Generate → Prompts Created On-the-fly

## New User Flow

1. Upload source images (unchanged)
2. Select "Shoot Variations" mode (unchanged)
3. See **3 simple tier toggles** — just label, description, and on/off switch. No per-tier image count, no prompts, no "Analyze Scene" button
4. Set **one global "Per Source" image count** in Output section (already exists)
5. Click **Generate**
6. System calculates: `sources × enabled tiers × imageCount` (e.g. 2 sources × 2 tiers × 2 = **8 images**)
7. At generate time, system calls `reference-roulette-prompts` for each source image, then generates images sequentially

## Files to Change

### 1. `src/components/creative-studio/product-shoot/RoulettePromptCards.tsx` → Rewrite as `VariationTierToggles`

Replace the complex prompt card UI with simple toggle rows:
- Each tier: icon, label, short description, on/off switch
- No image count selector per tier
- No expandable prompt editor
- No "analyzing" skeleton state (analysis happens at generate time now)
- Summary line: "2 tiers enabled · 8 images total" (calculated from sources × tiers × imageCount)

New props:
```typescript
interface VariationTierTogglesProps {
  enabledTiers: Record<string, boolean>; // { faithful: true, moderate: true, creative: false }
  onToggle: (tier: string, enabled: boolean) => void;
  sourceCount: number;
  imageCount: number;
}
```

### 2. `src/components/creative-studio/product-shoot/RemixStep2.tsx`

- Remove the "Analyze Scene & Generate Variations" button entirely
- Remove `RoulettePromptCards` usage
- Replace with the new `VariationTierToggles` component shown right below the mode toggle
- Remove `roulettePrompts` and `isAnalyzingScene` from local state usage — tiers are now just booleans
- The creative direction brief input stays (passed to prompt generation at generate time)
- Update the Output section total calculation: `sources × enabledTiers × imageCount`

### 3. `src/components/creative-studio/product-shoot/types.ts`

- Add `remixEnabledTiers?: Record<string, boolean>` to `ProductShootState`
- Keep `roulettePrompts` for internal use during generation (populated at generate time)

### 4. `src/hooks/useImageGeneration.ts` (~line 517)

**Major change**: The roulette variations path now needs to:
1. First call `reference-roulette-prompts` for **each source image** to generate prompts on-the-fly
2. Then generate images for each source × tier × count

```
for each sourceImage:
  call reference-roulette-prompts(sourceImage) → get prompts for 3 tiers
  for each enabledTier:
    for imageCount times:
      call generate-image with that tier's prompt + sourceImage
```

This is sequential (matching existing pattern for memory limits).

### 5. `src/components/creative-studio/CreativeStudioWizard.tsx` (~line 1058)

Update Generate button label calculation:
```
sources × enabledTierCount × imageCount
```

Instead of reading from `roulettePrompts[].imageCount`.

## What Gets Removed
- "Analyze Scene & Generate Variations" button
- Per-tier image count selectors
- Expandable prompt editor on each tier card
- The `isAnalyzingScene` state flag in the UI (analysis happens during generation)
- Pre-populated `roulettePrompts` in state before generate

## What Stays
- Creative direction brief input
- Remove text toggle
- Product selection
- Output settings (resolution, aspect ratio, per-source image count)


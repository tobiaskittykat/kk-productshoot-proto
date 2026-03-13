Objective
Make component colors truly single-field across the full pipeline so the payload, backend logic, saved metadata, and prompt assembly all use one canonical field (e.g. `upper.color = "Medium Sea Green (#1DAF64)"`) and never rely on `colorHex`.

## STATUS: ✅ IMPLEMENTED (2026-03-02)

### What was done

**Frontend (single-field serialization):**
- `ComponentOverride` type in `birkenstockMaterials.ts` — removed `colorHex` field
- `ComponentOverridePopover` — on Apply, serializes color as `"Name (#HEX)"` for picker colors, plain name for presets. On open, parses hex from existing canonical color string.
- `ShoeComponentsPanel` — derives swatch hex via `parseHexFromColor()` instead of `.colorHex`
- `useQuickCustomization` — AI override responses baked into canonical format before applying
- `useShoeComponents` — removed `colorHex` from sync logic (buckles, heelstrap auto-sync)
- `SetupProductStep2` — removed `colorHex` from merged component creation
- Added `parseHexFromColor()` and `stripHexFromColor()` utility exports

**Backend (already had bake logic):**
- `generate-image/index.ts` — `bakeHexIntoColors()` serves as legacy fallback, folding any stray `colorHex` into `.color` at ingress
- Build fingerprint: `hex-inline-v1-2026-03-02`

### Verification criteria
- Network payload: `upper.color = "Medium Sea Green (#1DAF64)"`, no `upper.colorHex`
- DB settings: `componentOverrides.upper.color` is canonical, no `colorHex`
- Prompt: `UPPER: Natural Leather (grained) in Medium Sea Green (#1DAF64)`
- Backend logs: `[BUILD] hex-inline-v1-2026-03-02` + `[COLOR-BAKED]` traces

## Upgrade "Remix Existing" with Variation Tiers (Reference Roulette)

## STATUS: ✅ IMPLEMENTED (2026-03-13)

### What was done

**New Edge Function (`reference-roulette-prompts`):**
- Two-phase pipeline: Phase A (3 parallel scene analysis) + Phase B (3 parallel asset integration)
- NB2 structured JSON schema for forensic scene descriptions
- Support for brand-level custom prompts via `brand_context.aiPrompts.roulette*`
- Uses `google/gemini-3-flash-preview` for all 6 AI calls
- Builds product blocks from identity, overrides, branding, and component data

**Updated `generate-image` Edge Function:**
- Added `skipPromptAgent` + `structuredPrompt` code path
- When both are present, uses `JSON.stringify(structuredPrompt)` as the prompt text directly, bypassing the normal prompt agent
- Source image still sent as edit reference, product images still attached for fidelity

**Frontend:**
- `ProductShootState` extended with `remixVariationMode`, `roulettePrompts`, `isAnalyzingScene`
- New `RoulettePrompt` type with tier, label, description, structured JSON, enabled toggle, image count
- `RoulettePromptCards` component: 3 tier cards with toggle, expandable JSON editor, per-tier image count
- `RemixStep2`: Added Swap vs Variations mode toggle, brief input, Analyze Scene button, roulette cards integration
- `useImageGeneration`: New branch for roulette mode — iterates enabled tiers × source images, sends `skipPromptAgent: true` + `structuredPrompt`

### Files changed
- `supabase/functions/reference-roulette-prompts/index.ts` (NEW)
- `supabase/config.toml` — added verify_jwt config for new function
- `supabase/functions/generate-image/index.ts` — skipPromptAgent path
- `src/components/creative-studio/product-shoot/types.ts` — RoulettePrompt type, state fields
- `src/components/creative-studio/product-shoot/RoulettePromptCards.tsx` (NEW)
- `src/components/creative-studio/product-shoot/RemixStep2.tsx` — mode toggle + roulette UI
- `src/hooks/useImageGeneration.ts` — roulette generation flow

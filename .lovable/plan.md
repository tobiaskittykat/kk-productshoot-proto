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

## STATUS: ✅ IMPLEMENTED (2026-03-13) — v2: Natural Language Prompts

### What was done (v2 rewrite)

**Edge Function (`reference-roulette-prompts`) — full rewrite:**
- Phase A now outputs 3 natural language "Edit this image:" prompts (not JSON)
- Each tier (faithful/moderate/creative) describes the scene in rich sensory prose with camera/lens/grain details
- Footwear uses `[PRODUCT_PLACEHOLDER]` for Phase B integration
- Phase B rewrites each prompt to integrate product details, replacing the placeholder
- Response format: `{ tier, label, description, naturalPrompt }` per tier
- Removed NB2 JSON schema entirely — all output is natural language

**Updated `generate-image` Edge Function:**
- `skipPromptAgent` path now uses `body.structuredPrompt.naturalPrompt` as the prompt
- Source image framed as **edit target** (same as remix mode) — no more "generate NEW" instruction
- This preserves the campaign's visual DNA: grain, color grade, lighting, film stock

**Frontend:**
- `RoulettePrompt` type: replaced `prompt`/`structured` fields with `naturalPrompt`
- `RoulettePromptCards`: displays/edits natural language prompt (not JSON), removed `font-mono`
- `RemixStep2`: maps response `naturalPrompt` field, simplified prompt edit handler
- `useImageGeneration`: passes `{ naturalPrompt }` as `structuredPrompt`, uses `naturalPrompt` as `prompt`

### Files changed
- `supabase/functions/reference-roulette-prompts/index.ts` (REWRITTEN)
- `supabase/functions/generate-image/index.ts` — naturalPrompt path + edit-target framing
- `src/components/creative-studio/product-shoot/types.ts` — RoulettePrompt type updated
- `src/components/creative-studio/product-shoot/RoulettePromptCards.tsx` (REWRITTEN)
- `src/components/creative-studio/product-shoot/RemixStep2.tsx` — naturalPrompt mapping
- `src/hooks/useImageGeneration.ts` — naturalPrompt flow

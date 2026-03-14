

# Rename "Reference Roulette" → "Scene Remix"

## Scope

Rename all user-facing and internal references from "Roulette" to "Scene Remix" across the codebase. The edge function URL (`reference-roulette-prompts`) stays as-is since renaming deployed functions is disruptive and it's only called internally.

## Changes

### 1. UI Labels — `RemixStep2.tsx`
- Change the variation mode button label from "Shoot Variations" to "Scene Remix"
- Update any description text accordingly

### 2. Type Names & Comments — `product-shoot/types.ts`
- Rename `RoulettePrompt` interface → `SceneRemixPrompt`
- Update all comments from "Reference Roulette" → "Scene Remix"
- Rename state field `roulettePrompts` → `sceneRemixPrompts` (and update all references)

### 3. Component File — `RoulettePromptCards.tsx`
- Rename file conceptually (keep the export name `VariationTierToggles` since that's already clean)
- No functional changes needed — the component itself doesn't mention "roulette"

### 4. Generation Logic — `useImageGeneration.ts`
- Rename all `roulette*` local variables to `sceneRemix*` equivalents
- Update console.log messages from `[Roulette]` → `[SceneRemix]`
- Update comment blocks

### 5. Edge Function (internal only) — `reference-roulette-prompts/index.ts`
- Update comments and console logs from `[ROULETTE]` → `[SceneRemix]`
- Rename `RouletteRequest` interface → `SceneRemixRequest`
- Keep the function URL path unchanged (renaming would require redeployment and config changes)

### 6. Edge Function — `generate-image/index.ts`
- Update comments referencing "Reference Roulette" → "Scene Remix"

### 7. State field rename cascade
All files referencing `roulettePrompts` in state:
- `types.ts` — field definition + initial state
- `RemixStep2.tsx` — state reads/writes
- `useImageGeneration.ts` — state reads
- `CreativeStudioWizard.tsx` — if any references
- `ProductShootIndicators.tsx` — if any references

### 8. Config — `supabase/config.toml`
- No change (function URL stays `reference-roulette-prompts`)

Total: ~5 files modified, mostly comment/variable renames. No functional changes.


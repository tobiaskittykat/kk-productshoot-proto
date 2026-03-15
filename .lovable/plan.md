

# Fix: Studio Background Leaking into Lifestyle Shoot Prompts

## Problem

The `buildRequestBody` function in `useImageGeneration.ts` **always** sends `productShootConfig` (which includes `backgroundId: 'studio-white'`, `settingType: 'studio'`) to the edge function — even during lifestyle-shoot mode. The edge function then injects "clean white studio cyclorama background" into the prompt **on top of** the moodboard-driven lifestyle prompt. This creates contradictory instructions like "studio cyclorama + arid desert landscape."

## Root Cause

Line 496-513 in `useImageGeneration.ts`: `productShootConfig` is unconditionally built from `state.productShoot` for all product use cases. The default `backgroundId` is `'studio-white'` (from `initialProductShootState`), which the edge function resolves to the studio cyclorama preset text.

## Fix

### `src/hooks/useImageGeneration.ts`

In the `buildRequestBody` function (~line 496), **exclude** `productShootConfig` when the shoot mode is `lifestyle-shoot`. The lifestyle shoot prompt builder already handles all aesthetic direction (background, lighting, mood) via the moodboard — the Product Shoot config block should not be sent at all.

Change the condition from:
```
productShootConfig: state.useCase === 'product' && state.productShoot ? { ... } : undefined
```
to:
```
productShootConfig: state.useCase === 'product' && state.productShoot && state.productShoot.shootMode !== 'lifestyle-shoot' ? { ... } : undefined
```

This is a one-line conditional change. The lifestyle-shoot path already builds its own complete prompt via `buildLifestyleShootPrompt()` and passes it as `shotTypePrompt`, so no information is lost.




# Fix: Moodboard Leaking into Scene Remix & Old Images

## Problem

When generating Scene Remix images, `buildRequestBody()` is spread into the request body. This includes `moodboardId`, `moodboardUrl`, `moodboardAnalysis`, and `moodboardName` from the **current UI state** — even though Scene Remix should only use the source image's visual context, not whatever moodboard happens to be selected in the sidebar.

The result: older images generated via Scene Remix (or Shoe Swap) get tagged with a moodboard they were never created with. The Image Detail Modal then resolves and displays this moodboard as a "Reference Image," which is misleading.

## Root Cause

In `src/hooks/useImageGeneration.ts`:

1. **Scene Remix body** (line ~633): `...buildRequestBody(null, 1)` spreads in `moodboardId: state.moodboard`, `moodboardUrl`, `moodboardAnalysis`, `moodboardName`, `moodboardDescription` from the current UI state.
2. **Shoe Swap body** (line ~667): Same issue — `...buildRequestBody(null, state.imageCount)` carries current moodboard state.
3. **Poll result mapping** (line ~764): `moodboardId: state.moodboard || undefined` stamps the current UI moodboard onto every completed image, regardless of whether the generation actually used one.

## Fix

### File: `src/hooks/useImageGeneration.ts`

**Scene Remix body (~line 633)**: After spreading `buildRequestBody`, explicitly null out moodboard fields:
```typescript
const sceneRemixBody = {
  ...buildRequestBody(null, 1),
  // Scene Remix uses source image only — no moodboard
  moodboardId: null,
  moodboardUrl: null,
  moodboardName: null,
  moodboardDescription: null,
  moodboardAnalysis: null,
  skipPromptAgent: true,
  ...
};
```

**Shoe Swap body (~line 667)**: Same treatment — null out moodboard fields since remix uses the source image as its creative reference:
```typescript
const remixBody = {
  ...buildRequestBody(null, state.imageCount),
  // Remix uses source image — no moodboard
  moodboardId: null,
  moodboardUrl: null,
  moodboardName: null,
  moodboardDescription: null,
  moodboardAnalysis: null,
  remixMode: true,
  ...
};
```

**Poll result mapping (~lines 764, 788)**: Instead of always stamping `state.moodboard`, read the moodboard from the database row (which reflects what was actually sent to the edge function):
```typescript
moodboardId: row.moodboard_id || undefined,
```

This ensures the image record only shows a moodboard reference if one was actually used during generation.


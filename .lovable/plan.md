
# Fix Product Focus Shot Variety

## Problem

When generating multiple Product Focus images (especially in sequential mode), every image comes out with the same composition — shoes sitting parallel. This happens because unlike "On Foot" and "Full Body" shot types, the Product Focus prompt builder has no randomization logic.

**On Foot / Full Body (has variety):** Each call to `buildOnFootPrompt()` uses `selectRandomFromOptions()` to pick a random pose, leg style, and trouser color when set to "Auto". Sequential generation calls the builder fresh per image, so each image gets different concrete options.

**Product Focus (no variety):** When `cameraAngle` is set to "Auto", `buildProductFocusPrompt()` outputs the same static text every time:
```
CAMERA ANGLE:
- AI selects optimal angle to showcase product
- May use: side profile, three-quarter view, top-down, detail close-up, or sole view
```

The prompt agent sees this vague instruction and defaults to the same "safe" composition each time (parallel pair shot).

## Solution

Apply the same `selectRandomFromOptions()` pattern to `buildProductFocusPrompt()`. When camera angle is "Auto", randomly pick one concrete angle option per call. This way:
- Single image generation: gets one randomly chosen angle
- Sequential generation (4 images): each image gets a different specific angle, producing genuine variety

Additionally, convert the Product Focus prompt to an evocative narrative style (matching On Foot / Full Body) instead of the current bullet-point format. This gives the prompt agent richer creative direction to work with.

## Changes

### `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

**In `buildProductFocusPrompt()`:**

1. When `config.cameraAngle === 'auto'`, use `selectRandomFromOptions(productFocusAngleOptions, 'auto')` to pick a specific concrete angle instead of outputting the vague "AI selects" text.

2. Add narrative descriptions to `productFocusAngleOptions` (similar to how `poseVariationOptions` has both `prompt` and `narrative` fields). These richer descriptions will produce better variety in the final image:

| Angle | Narrative addition |
|-------|-------------------|
| Hero (3/4 Front) | "the classic hero shot, angled at 45 degrees to show depth and dimension..." |
| Side Profile | "a pure lateral view capturing the full silhouette..." |
| Top Down | "shot from directly overhead, both shoes side by side, footbed and straps fully visible..." |
| Sole View | "one shoe flipped to reveal the outsole tread, the other showing the footbed..." |
| Detail Close-up | "cropped tight on the buckle hardware and strap texture..." |
| Pair Shot | "both shoes arranged at complementary angles, slightly staggered..." |
| Lifestyle | "artfully placed in an environmental context with props..." |

3. Convert the prompt output to an evocative narrative format (like On Foot uses) instead of bullet points. This gives the prompt agent a richer signal to work with.

**Result for sequential generation (4 images with Auto angle):**
- Image 1 might get "Hero (3/4 Front)" with its specific composition description
- Image 2 might get "Top Down" with overhead framing
- Image 3 might get "Side Profile" with lateral view
- Image 4 might get "Detail Close-up" with macro-style framing

Each image receives a concrete, unambiguous angle instruction rather than "AI selects optimal angle."

## Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Add narrative descriptions to `productFocusAngleOptions`; update `buildProductFocusPrompt()` to use `selectRandomFromOptions()` for auto angle; convert output to evocative narrative style |



# Refine Hero (3/4 Front) Camera Angle Prompt

## Problem
The current hero angle prompt uses vague language like "three-quarter front view at 45-degree angle" and "single shoe angled toward camera" without specifying camera height, exact shoe orientation, or what should be visible. This leads to inconsistent generations.

## Refined Prompt (Based on Gemini Analysis)

**Current `prompt`** (short hint):
> "three-quarter front view at 45-degree angle, classic hero product shot showing depth and dimension, single shoe angled toward camera"

**New `prompt`**:
> "neutral eye-level three-quarter view, shoe rotated 30-45 degrees with toe toward bottom-right and heel toward center-left, capturing full side profile of sole, structural volume of upper, and clear view into interior footbed"

**Current `narrative`** (full composition text used in actual prompt building):
> "the classic hero shot, camera positioned at a 45-degree angle to capture depth and dimension. A single shoe angled toward the lens, revealing both the lateral profile and the top of the footbed in one commanding frame. This is the definitive e-commerce angle -- authoritative, dimensional, and immediately recognizable."

**New `narrative`**:
> "the classic hero shot in a neutral, eye-level three-quarter perspective. The camera is level with the top edge of the shoe's upper. The shoe is rotated roughly 30 to 45 degrees away from the camera, with the toe directed toward the bottom-right corner and the heel pointing toward the center-left. The front of the shoe is physically closer to the lens than the heel, creating a natural sense of depth and scale. This specific orientation ensures the full side profile of the sole is visible, the structural volume of the upper is showcased, and the concave interior footbed is clearly seen. This is the definitive e-commerce angle -- authoritative, dimensional, and immediately recognizable."

## Key Improvements
- **Camera height specified**: "neutral, eye-level" with the top edge of the shoe's upper -- no ambiguity about low/high angle
- **Exact orientation**: "toe toward bottom-right, heel toward center-left" instead of vague "angled toward camera"
- **Rotation degree**: "30 to 45 degrees away from camera" -- precise range
- **Depth cue**: "front of shoe closer to lens than heel" -- tells the AI exactly how to render perspective
- **Visibility checklist**: Explicitly states what must be visible (sole profile, upper volume, interior footbed)

## File Changed
**`src/components/creative-studio/product-shoot/shotTypeConfigs.ts`** (lines 419-426)
- Update `prompt` field for the `hero` angle option
- Update `narrative` field for the `hero` angle option

No other files need changes -- the prompt builder (`buildProductFocusPrompt`) already reads these fields dynamically.

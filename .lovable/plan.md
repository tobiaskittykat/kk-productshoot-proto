

# Fix: Sequential Generation Overrides Lifestyle Shoot Prompt

## Problem

When "Generate each image independently" is enabled in Lifestyle Shoot mode, the sequential generation branch (line 703) calls `buildShotTypePromptForProduct()` for each image. This function does NOT handle `lifestyle-shoot` mode — it only handles regular product shot types (on-foot, lifestyle, product-focus, hero, etc.). The lifestyle shoot prompt built at line 361 via `buildLifestyleShootPrompt()` gets thrown away and replaced with a default product shot prompt, producing studio-style images.

## Root Cause

Line 703-725: The sequential generation branch unconditionally calls `buildShotTypePromptForProduct()` instead of re-using the lifestyle shoot prompt builder when in lifestyle-shoot mode.

## Fix

### `src/hooks/useImageGeneration.ts` (~line 703-725)

Update the sequential generation branch to detect lifestyle-shoot mode and call `buildLifestyleShootPrompt()` instead of `buildShotTypePromptForProduct()`:

```text
Sequential mode logic (current):
  for each image:
    freshShotTypePrompt = buildShotTypePromptForProduct()  ← WRONG for lifestyle
    invoke('generate-image', buildRequestBody(freshShotTypePrompt, 1))

Sequential mode logic (fixed):
  for each image:
    if (shootMode === 'lifestyle-shoot'):
      freshShotTypePrompt = buildLifestyleShootPrompt(...)  ← re-use same config/moodboard
    else:
      freshShotTypePrompt = buildShotTypePromptForProduct()
    invoke('generate-image', buildRequestBody(freshShotTypePrompt, 1))
```

The lifestyle shoot prompt builder already has built-in randomization (compositional variety), so each sequential call will naturally produce a different prompt — which is exactly the "more variety" behavior the user expects.

The moodboard URL, analysis, and config are already resolved earlier in the function (lines 341-367) and are available as closure variables, so we just need to call `buildLifestyleShootPrompt()` again with the same inputs.


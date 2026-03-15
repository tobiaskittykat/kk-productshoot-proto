

# Regional Localization — Simplified Scope

## What Changed From Original Plan

Removed **environment cues** (moodboard handles that) and **clothing styling** (also moodboard territory). Region now only controls two things:

1. **Casting direction** — biases the ethnic diversity pool per region
2. **Modesty constraints (MEA only)** — hard cultural requirement injected as a non-negotiable rule, separate from aesthetic styling

## Region Definitions (Prompt-Side Only)

| Region | Casting Direction | Modesty Rule |
|--------|------------------|--------------|
| **Auto** | No constraint | None |
| **USA** | Diverse American casting — mixed ethnicities | None |
| **Europe** | European diversity — Mediterranean, Northern, Eastern European | None |
| **MEA** | Middle Eastern and African diversity | Covered shoulders, longer hemlines, no exposed midriffs. Lightweight fabrics. Loose silhouettes for women. |
| **APAC** | East Asian, Southeast Asian, South Asian diversity | None |

## How It Interacts With Moodboard

- Casting direction only fires when model ethnicity is set to "Auto" — explicit ethnicity selection always wins
- MEA modesty rules are injected as a separate `CULTURAL CONSTRAINTS` block AFTER the moodboard section, clearly marked as non-negotiable overrides (not aesthetic suggestions)
- Everything else (clothing style, color, texture, environment) remains 100% moodboard-driven

## Files Changed

1. **`types.ts`** — Add `LifestyleRegion` type (`'auto' | 'usa' | 'europe' | 'mea' | 'apac'`), `regionOptions` array, add `region` field to `LifestyleShootConfig` (default `'auto'`)

2. **`lifestyleShootPromptBuilder.ts`** — After moodboard section, inject:
   - `REGIONAL CASTING` block with ethnicity pool direction (when not auto)
   - `CULTURAL CONSTRAINTS` block with modesty rules (MEA only)

3. **`LifestyleShootStep2.tsx`** — Add a Region dropdown (Select component) in the config area. Label: "Region", helper: "Guides casting diversity and cultural context"

4. **`ProductShootIndicators.tsx`** — Show region badge when not `'auto'`


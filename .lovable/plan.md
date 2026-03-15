

# New Lifestyle Shot Type: "Group Composition" (2-3 People)

## Concept: Birkenstock-Style Group Editorial

Inspired by Birkenstock's "Next of Kin" and "Come Back To You" campaigns — documentary-style group shots where community and connection are the narrative. Key characteristics:
- **Only ONE person wears the selected/hero product** — the others wear different Birkenstock models (specified by name)
- Candid, caught-between-moments energy — never posed catalog group shots
- The group dynamic tells the story; footwear is discovered, not featured
- Mixed models, diverse styling, each person has their own identity

## What Changes

### 1. Types & Config (`types.ts`)
- Add `'group-scene'` to `LifestyleShootShotType` union
- Add `GroupCompanion` interface and `groupCompanions` field to `LifestyleShootConfig`:
  ```ts
  interface GroupCompanion {
    birkenstockModel: string;  // e.g. "Arizona", "Boston", "Gizeh"
    gender: string;
    ethnicity: string;
  }
  ```
- Config stores 1-2 companions (for total of 2-3 people including the hero wearer)

### 2. Shot Type Definition (`lifestyleShootConfigs.ts`)
- Add `'group-scene'` entry to `lifestyleShootTypes` array with icon `👥`, name "Group Scene", description "2-3 people together — your product is the hero shoe"
- Add `framingDirective` enforcing:
  - 2-3 people in a candid group moment
  - HERO SHOE RULE: exactly ONE person wears the selected product; others wear explicitly named different Birkenstock models
  - Anti-generic: never lined up facing camera, never matching outfits, never catalog group shot
  - Group dynamic: shared activity, overlapping personal spaces, caught mid-interaction
  - Each person has distinct personal style; clothing is lived-in
  - Footwear appears naturally — never the compositional focus, but all shoes are visible
- Add `groupSceneVariations` energy pool (6-8 variations) for Auto mode randomization, e.g.:
  - "Shared Surface" — all seated on the same bench/wall/step, bodies overlapping
  - "Walking Together" — mid-stride group, staggered, slightly out of sync
  - "Gathered Around" — standing around something (table, railing, car), weight distributed differently
  - "Two & One" — two people engaged together, third arriving or slightly apart
  - "Stacked Levels" — people at different heights (steps, ledge, ground)
  - "Caught Laughing" — mid-reaction moment, bodies turning toward each other

### 3. Prompt Builder (`lifestyleShootPromptBuilder.ts`)
- Add `group-scene` branch in `buildLifestyleShootPrompt` (alongside existing 4 shot types)
- When all-auto: pick random `groupSceneVariation` for compositional energy
- Inject companion shoe information into the prompt:
  - "Person 1 (HERO) wears [selected product — EXACT match to reference images]"
  - "Person 2 wears Birkenstock [companion model] — a different model, naturally worn"
  - "Person 3 wears Birkenstock [companion model] — yet another model, lived-in"
- Footbed component exclusion (same rule as other worn-shoe types)

### 4. UI: Group Configurator Section (`LifestyleShootStep2.tsx`)
- When `lifestyleShotType === 'group-scene'`, show a "Group Companions" section below the shot type selector
- For each companion (1-2):
  - Dropdown to pick a Birkenstock model name (Arizona, Boston, Gizeh, Madrid, Zurich, Kyoto, Milano, Florida, Mayari, London — hardcoded list of popular models)
  - Gender and ethnicity selectors (same options as existing model configs)
- "Add Person" button (max 2 companions = 3 total people)
- Remove companion button

### 5. Shot Type Selector (`LifestyleShootTypeSelector.tsx`)
- Grid changes from `sm:grid-cols-4` to `sm:grid-cols-5` (or wraps naturally with 5 items)
- New card appears with `👥` icon

### 6. Indicators (`ProductShootIndicators.tsx`)
- Add `'group-scene': 'Group Scene'` to the shot type label map

## Files Changed
1. `src/components/creative-studio/product-shoot/types.ts` — add `'group-scene'` to type union, add `GroupCompanion` interface and config field
2. `src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts` — add shot type definition + 6-8 energy variations
3. `src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts` — add `group-scene` prompt branch with companion injection
4. `src/components/creative-studio/product-shoot/LifestyleShootStep2.tsx` — add Group Companions configurator UI
5. `src/components/creative-studio/product-shoot/LifestyleShootTypeSelector.tsx` — grid layout update for 5th card
6. `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx` — add label


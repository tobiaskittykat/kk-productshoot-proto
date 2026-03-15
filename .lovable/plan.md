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

## STATUS: ✅ IMPLEMENTED (2026-03-13) — v3: Corrected Tier Definitions + Source Image Framing

### What was done (v3 — tier rewrite)

**Edge Function (`reference-roulette-prompts`) — tier definitions rewritten:**
- **Close Recreation (faithful)**: Next frame on the roll — identical everything, micro-variation only (slight weight shift, centimeter of camera movement)
- **Different Moment (moderate)**: Same set, same session, same wardrobe — but a clearly different pose (turned body, shifted weight, new hand placement)
- **Same Set, Fresh Take (creative)**: Same physical set and lighting rig — but completely new composition, possibly new model, camera repositioned to show different part of the set
- All prompts now emphasize preserving "visual DNA" (grain, color grade, film stock, lens characteristics) as NON-NEGOTIABLE
- Updated labels: `Close Recreation` / `Different Moment` / `Same Set, Fresh Take`
- Updated descriptions to match new definitions

**Fixed source image framing in `generate-image`:**
- Roulette path now includes explicit framing instruction: "This is the reference image from the photo session. Your edit MUST preserve its exact visual DNA..."
- Previously attached image with no context — model didn't know how to use it

**Frontend (`RoulettePromptCards`):**
- Updated tier icons: 🎞️ / 🔄 / 🎬
- Labels now driven by `tierColors` map with correct names

### Files changed
- `supabase/functions/reference-roulette-prompts/index.ts` — all 3 tier prompts rewritten + labels/descriptions updated
- `supabase/functions/generate-image/index.ts` — added framing instruction before source image in roulette path
- `src/components/creative-studio/product-shoot/RoulettePromptCards.tsx` — updated tier labels and icons

## Direct-to-Storage Crawler API

## STATUS: ✅ IMPLEMENTED (2026-03-14)

### What was done

**Edge Function (`register-imported-products`):**
- Reads `manifest.json` from `product-images` storage bucket
- Idempotent upserts into `product_skus` and `scraped_products`
- Auto-sets hero image as SKU composite thumbnail
- Auth via `apiKey` field (user JWT validated server-side)

**Crawler workflow:**
1. Upload images to `product-images/imports/{batch_id}/...` using Service Role Key
2. Upload `manifest.json` to same folder
3. POST to `/functions/v1/register-imported-products` with `{ apiKey, batchId }`

### Files changed
- `supabase/functions/register-imported-products/index.ts` — new edge function
- `supabase/config.toml` — added function with `verify_jwt = false`

## Birkenstock Catalog Browser & On-Demand Import

## STATUS: ✅ IMPLEMENTED (2026-03-14)

### What was done

**Static catalog data:**
- `src/data/birkenstock-catalog.json` — 285 products with model, productName, color, imageUrls

**CatalogBrowser component:**
- Searchable/filterable grid of all catalog products
- Model filter chips (Arizona, Boston, Gizeh, etc.)
- Hero thumbnails loaded directly from Birkenstock CDN
- Checkbox multi-select with "already imported" detection via SKU codes
- Lifestyle images auto-filtered from import payload
- Batch import via `bulk-import-products` edge function with progress UI

**SmartUploadModal integration:**
- New "Browse Catalog" source option (3-column layout)
- `catalog` step renders CatalogBrowser inline

### Files changed
- `src/data/birkenstock-catalog.json` — new static catalog
- `src/components/creative-studio/product-shoot/CatalogBrowser.tsx` — new component
- `src/components/creative-studio/product-shoot/SmartUploadModal.tsx` — added catalog source + step

## New Lifestyle Shoot Mode

## STATUS: ✅ IMPLEMENTED (2026-03-15)

### What was done

**Types & State (`product-shoot/types.ts`):**
- Added `'lifestyle-shoot'` to `ShootMode` union
- Added `LifestyleShootShotType`: `'product-only' | 'feet-focus' | 'model-no-head' | 'full-model'`
- Added `LifestyleAdvancedSettings` interface (cameraAngle, lighting, cameraLens, cameraType, filmStock)
- Added `LifestyleShootConfig` interface with moodboard, brief, shot type, advanced settings
- Added `lifestyleShootConfig` to `ProductShootState`

**Shot Type Definitions (`lifestyleShootConfigs.ts` — new):**
- 4 shot types with mandatory framing directives (product-only, feet-focus, model-no-head, full-model)
- 5 advanced settings categories with Birkenstock-optimized defaults (eye-level, natural light, 85mm, digital, no film)
- `getAdvancedPromptFragments()` helper to extract prompt text from settings

**Prompt Builder (`lifestyleShootPromptBuilder.ts` — new):**
- Merges moodboard analysis (deep narrative format + legacy flat format) with shot type framing, creative brief, advanced camera settings, and product integrity lock
- Priority hierarchy: Brand Brain > Moodboard > Shot Type > Advanced Settings > Brief > Product Identity

**UI Components:**
- `ProductShootSubtypeSelector.tsx` — 2×2 grid with 4th "Lifestyle Shoot" card (Palette icon)
- `LifestyleShootStep2.tsx` — Full config panel: moodboard picker, product picker with component overrides, creative brief textarea, shot type selector, advanced settings, output settings
- `LifestyleShootTypeSelector.tsx` — 4-card visual selector with icons and descriptions
- `LifestyleAdvancedPanel.tsx` — 5 select dropdowns with "Reset defaults" button

**Generation Integration (`useImageGeneration.ts`):**
- New code path for `shootMode === 'lifestyle-shoot'`: fetches moodboard from DB, builds lifestyle prompt via `buildLifestyleShootPrompt()`, passes moodboard URL + analysis to edge function

**Wizard Integration (`CreativeStudioWizard.tsx`):**
- Routes `lifestyle-shoot` mode to `LifestyleShootStep2` in Step 2
- `ProductShootIndicators` shows Moodboard / Product / Shot chips for lifestyle mode

### Files changed
- `src/components/creative-studio/product-shoot/types.ts` — ShootMode + new interfaces
- `src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts` — NEW
- `src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts` — NEW
- `src/components/creative-studio/product-shoot/LifestyleShootStep2.tsx` — NEW
- `src/components/creative-studio/product-shoot/LifestyleShootTypeSelector.tsx` — NEW
- `src/components/creative-studio/product-shoot/LifestyleAdvancedPanel.tsx` — NEW
- `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx` — 2×2 grid
- `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx` — lifestyle chips
- `src/components/creative-studio/product-shoot/index.ts` — barrel exports
- `src/components/creative-studio/CreativeStudioWizard.tsx` — routing
- `src/hooks/useImageGeneration.ts` — lifestyle-shoot generation path

## Fix: Sequential Generation Overrides Lifestyle Shoot Prompt

## STATUS: ✅ IMPLEMENTED (2026-03-15)

### What was done

**`src/hooks/useImageGeneration.ts`:**
- Sequential generation branch (~line 709) now checks if `shootMode === 'lifestyle-shoot'`
- If lifestyle: calls `buildLifestyleShootPrompt()` with the resolved moodboard analysis/name and product identity — each call produces a naturally varied prompt via built-in compositional randomization
- If not lifestyle: calls `buildShotTypePromptForProduct()` as before
- Also pipes `moodboardName` from lifestyle branch into outer scope so it's available in the sequential loop

## Editorial Edge: Portrait in Place — Birkenstock-Researched Rewrite

## STATUS: ✅ IMPLEMENTED (2026-03-15)

### What was done

**`src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts`:**
- Rewrote "Portrait in Place" base framing directive with editorial tension: "caught between moments," anti-generic rules (never standing straight, never hands at sides, never centered), physical ease/gravity language, lived-in shoe mandate
- Added 6 energy-based `portraitInPlaceVariations`: Arrived & Settling, Deep in Place, About to Leave, Caught Unaware, Borrowed Perch, Stillness with Tension
- Each variation describes mood/energy/relationship-to-space (not specific poses) for creative latitude
- Added `pickRandomPortraitVariation()` export

**`src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts`:**
- Added `full-model` + all-Auto branch mirroring the existing Styled Still Life pattern
- Randomly selects a portrait energy variation and appends base directive's non-compositional rules (casting, styling, footwear incidental)

### Research basis
- Jack Davison's "Personality" series for Birkenstock — transitional states, no styling/briefing, worn shoes
- "Come Back To You" 2025 campaign — environment as co-author, physical ease as philosophy
- Energy-based variations avoid prescriptive poses that would produce repetitive output

## Editorial Edge: On Foot & Body & Style — Moodboard-First Rewrite

## STATUS: ✅ IMPLEMENTED (2026-03-15)

### What was done

**`src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts`:**
- Rewrote "On Foot" (`feet-focus`) base directive: replaced 3 named stances with energy language ("mid-shift, mid-scratch, mid-step-back"), added anti-generic rules, pushed ground-as-co-character without naming specific textures (moodboard defines surfaces), added lived-in shoe mandate
- Rewrote "Body & Style" (`model-no-head`) base directive: replaced "footwear anchor" with "incidental anchor" (eye goes to hands/texture first), added "fragment" energy (crop feels accidental/editorial), hands as second protagonist, clothing-has-history mandate, anti-generic rules
- Added 6 on-foot energy variations: Paused Mid-Errand, Grounded & Still, One In One Out, Feet Talking, Shadow & Ground, Surface Dialogue
- Added 6 body & style energy variations: Hands at Work, Mid-Gesture, Leaning Fragment, Pockets & Fidgets, Seated Crop, Walking Fragment
- Added `pickRandomOnFootVariation()` and `pickRandomBodyStyleVariation()` exports

**`src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts`:**
- Added `feet-focus` + all-Auto branch: randomly selects on-foot energy variation + appends base rules (anti-generic, ground-as-co-character, lived-in footwear)
- Added `model-no-head` + all-Auto branch: randomly selects body & style energy variation + appends base rules (fragment crop, hands visible, clothing history, incidental footwear)
- All 4 shot types now have energy-based variation randomization when advanced settings are Auto

### Design principle
- All variations describe ENERGY and RELATIONSHIP — never specific surfaces, textures, activities, or aesthetics
- The moodboard is the sole authority for visual specifics; shot type defines only compositional structure and mood

## Skip Footbed from Lifestyle Worn-Shoe Prompts

## STATUS: ✅ IMPLEMENTED (2026-03-15)

### What was done

**`src/hooks/useImageGeneration.ts`:**
- Passes `lifestyleShotType` in request body only when `shootMode === 'lifestyle-shoot'`

**`supabase/functions/generate-image/index.ts`:**
- `isLifestyleWornOnFoot` check for `feet-focus`, `model-no-head`, `full-model`
- Excludes `'footbed'` from `componentTypes` when worn on foot; lining stays (edges visible)
- Extended `isHiddenAngle` branding check to include lifestyle worn-shoe shots
- Product Shoot workflow unaffected (`lifestyleShotType` is `undefined`)

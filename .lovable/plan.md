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

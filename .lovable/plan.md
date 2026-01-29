
# Generate AI Background Thumbnails for Studio & Outdoor Presets

## Overview

Replace the CSS gradient placeholders with actual AI-generated thumbnail images for all 22 background presets (10 studio + 12 outdoor). These will give users a much clearer visual preview of what each background setting looks like.

---

## Approach

### Option A: Generate & Store in Supabase Storage (Recommended)
Generate images using Gemini, upload to the `brand-assets` bucket, and reference via public URLs.

**Pros:**
- Images persist across deployments
- Fast loading via CDN
- No build-time generation needed

**Cons:**
- Requires edge function to generate
- One-time setup effort

### Option B: Generate & Store as Static Assets
Generate images and save to `src/assets/backgrounds/` or `public/backgrounds/`.

**Pros:**
- Simple file references
- No external dependencies

**Cons:**
- Increases bundle size
- Must regenerate if presets change

---

## Recommended: Option A - Edge Function + Storage

### Step 1: Create Edge Function for Thumbnail Generation

Create `supabase/functions/generate-background-thumbnails/index.ts`:

```typescript
// Calls Gemini image generation API for each preset
// Uploads results to brand-assets bucket
// Returns mapping of background ID -> thumbnail URL
```

**Prompt Template for Each Background:**
```text
Generate a simple, clean background preview image for product photography.
Setting: [preset.prompt]
Style: Empty background only, no products or people, soft lighting, 
       4:3 aspect ratio, suitable as a selection thumbnail.
```

### Step 2: Update Presets with Thumbnail URLs

After generation, update `presets.ts` to include actual thumbnail URLs:

```typescript
{ 
  id: 'studio-white', 
  name: 'White Cyclorama', 
  category: 'studio', 
  thumbnail: 'https://[supabase-url]/storage/v1/object/public/brand-assets/bg-thumbnails/studio-white.png',
  prompt: '...',
  colorHint: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)' // Fallback
}
```

### Step 3: Update BackgroundSelector to Prefer Thumbnails

The component already handles this (line 81):
```typescript
background: bg.thumbnail || bg.colorHint || 'linear-gradient(...)'
```

So once thumbnails are populated, they'll automatically be used.

---

## Thumbnail Specifications

| Property | Value |
|----------|-------|
| **Dimensions** | 400x300px (4:3 aspect ratio) |
| **Format** | PNG or WebP |
| **Style** | Empty background, soft lighting, no products/people |
| **Storage Path** | `brand-assets/bg-thumbnails/{preset-id}.png` |

---

## Backgrounds to Generate (22 total)

### Studio (10)
1. `studio-white` - White Cyclorama
2. `studio-black` - Black Void
3. `studio-gradient-warm` - Warm Gradient
4. `studio-gradient-cool` - Cool Gradient
5. `studio-concrete` - Concrete Floor
6. `studio-marble` - Marble Surface
7. `studio-fabric` - Textured Fabric
8. `studio-wood` - Warm Wood
9. `studio-terrazzo` - Terrazzo
10. `studio-paper` - Paper Backdrop

### Outdoor (12)
1. `outdoor-beach` - Sandy Beach
2. `outdoor-urban` - Urban Street
3. `outdoor-park` - Park Grass
4. `outdoor-cafe` - Cafe Terrace
5. `outdoor-desert` - Desert Dunes
6. `outdoor-forest` - Forest Path
7. `outdoor-rooftop` - Rooftop
8. `outdoor-pool` - Poolside
9. `outdoor-mountain` - Mountain Trail
10. `outdoor-vineyard` - Vineyard
11. `outdoor-boardwalk` - Boardwalk
12. `outdoor-market` - Street Market

---

## Implementation Steps

### 1. Create Edge Function
- `supabase/functions/generate-background-thumbnails/index.ts`
- Uses Lovable AI (Gemini image generation)
- Generates 22 images sequentially (to avoid rate limits)
- Uploads each to `brand-assets/bg-thumbnails/`
- Returns JSON with all URLs

### 2. Run Generation Once
- Call the edge function to generate all thumbnails
- This is a one-time operation

### 3. Update Presets File
- Add generated thumbnail URLs to each preset in `presets.ts`
- Keep `colorHint` as fallback for loading states

### 4. Update Config
- Add function to `supabase/config.toml`

---

## Edge Function Code Structure

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BACKGROUNDS = [
  { id: 'studio-white', prompt: 'Pure white seamless studio cyclorama, professional photography backdrop, soft diffused lighting' },
  { id: 'studio-black', prompt: 'Deep black studio void, dramatic rim lighting, high contrast photography backdrop' },
  // ... all 22 presets
];

serve(async (req) => {
  // 1. For each background preset
  // 2. Call Gemini image generation with prompt
  // 3. Upload base64 result to storage
  // 4. Collect URLs
  // 5. Return mapping
});
```

---

## Result

After implementation:
- Users will see actual visual previews of each background
- Studio backgrounds will show realistic studio/surface textures
- Outdoor backgrounds will show scenic location previews
- CSS gradients remain as loading fallbacks

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/functions/generate-background-thumbnails/index.ts` | Create |
| `supabase/config.toml` | Add function config |
| `src/components/creative-studio/product-shoot/presets.ts` | Update with thumbnail URLs after generation |

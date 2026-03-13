

# Bulk Product Import API for External Crawler

## What You Need

Your external crawler needs an API endpoint to POST product metadata + images into the system. The endpoint must:
- Accept product data (model, name, color, image URLs or raw image bytes)
- Mirror images into storage under a smart folder structure
- Create `product_skus` and `scraped_products` records automatically
- Handle thousands of images without timeouts
- Return the storage base URL so your crawler knows where files land

## Architecture

```text
Your Crawler
    │
    ▼
POST /functions/v1/bulk-import-products
    │
    ├─ Mode A: "register" — crawler sends metadata + image URLs
    │   → Edge function downloads & stores images
    │
    ├─ Mode B: "upload" — crawler sends pre-uploaded storage paths
    │   → Edge function just creates DB records
    │
    └─ Both modes create product_skus + scraped_products rows
```

Storage path convention: `{user_id}/{sku_id}/{angle}.jpg`

## Files to Create/Change

### 1. New edge function: `supabase/functions/bulk-import-products/index.ts`

Accepts JSON payload:
```typescript
{
  apiKey: string,           // user's auth token
  brandId: string,
  products: [{
    model: string,          // "Arizona"
    productName: string,    // "Arizona Big Buckle Leather"
    color: string,          // "New Dressy Black"
    sourceUrl?: string,     // original PDP URL
    imageUrls: string[],    // array of CDN URLs to mirror
  }]
}
```

Processing per product:
1. Generate a stable `sku_id` from `productName + color` (deterministic UUID or slug)
2. Upsert into `product_skus` (name, category=sandal, description JSON with model/color/sourceUrl)
3. For each image URL: detect angle from filename pattern (`_top`, `_side`, `_sole`, `_pair`, `_detail`, `_look`, `_closeup`, hero = default), download, upload to `product-images/{user_id}/{sku_id}/{angle}.jpg`, insert into `scraped_products`
4. After all angles uploaded, call `composite-product-images` to generate the grid thumbnail
5. Return summary: `{ created: N, skipped: N, errors: [...] }`

Key design for scale:
- Process products **sequentially** (one at a time) to avoid memory issues
- Process images within a product in **parallel** (batch of ~5 concurrent downloads)
- Use `upsert` with `external_id` to make the endpoint idempotent — re-running won't duplicate
- 300s edge function timeout is enough for ~10-20 products per call; crawler should batch accordingly

### 2. Angle detection logic (inside the edge function)

Birkenstock URLs have predictable patterns:
- `1031752.jpg` → hero (front)
- `1031752_top.jpg` → top-down
- `1031752_side.jpg` → side
- `1031752_sole.jpg` → sole
- `1031752_pair.jpg` → pair
- `1031752_detail.jpg` → detail
- `1031752_f_look_f.jpg` → lifestyle/on-foot
- `1031752_f_closeup_f.jpg` → close-up

This auto-tagging means your products arrive pre-organized with correct angle labels.

### 3. `supabase/config.toml` — Add JWT-free entry

```toml
[functions.bulk-import-products]
verify_jwt = false
```

Auth is validated in-code via the `apiKey` field (service role key or user JWT).

### 4. Response includes storage info

The response will include the base storage URL pattern so your crawler knows the convention:
```json
{
  "storageBase": "https://hqjfjrwoyvtlhqcupceu.supabase.co/storage/v1/object/public/product-images",
  "pathPattern": "{user_id}/{sku_id}/{angle}.{ext}",
  "created": 285,
  "totalImages": 2520
}
```

### What your crawler needs to do

Call the endpoint in batches of ~15 products per request:
```bash
curl -X POST https://hqjfjrwoyvtlhqcupceu.supabase.co/functions/v1/bulk-import-products \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_JWT_OR_SERVICE_KEY",
    "brandId": "YOUR_BRAND_ID",
    "products": [ ... up to 15 products ... ]
  }'
```

Loop through all 285 products in ~19 batches. Each batch takes ~30-60s depending on image download speed.


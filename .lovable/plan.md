

# Flip the Flow: Crawler Uploads Directly to Storage

Instead of your crawler POSTing image data to an edge function, you upload files directly to the storage bucket (S3-compatible), then call one lightweight endpoint to register everything in the database.

## How It Works

```text
Your Crawler
    │
    ├─ 1. Upload images directly to storage bucket via S3-compatible API
    │     PUT https://{project}.supabase.co/storage/v1/object/product-images/{path}
    │
    ├─ 2. Upload a manifest.json with all product metadata
    │
    └─ 3. Call POST /functions/v1/bulk-import-products with mode="register-from-storage"
          → Reads manifest, creates DB records pointing to already-uploaded files
```

## What You Get from Us

**Storage endpoint (S3-compatible):**
```
https://hqjfjrwoyvtlhqcupceu.supabase.co/storage/v1/object/product-images/
```

**Auth header for uploads:**
```
Authorization: Bearer <SERVICE_ROLE_KEY>
```

**Upload convention your crawler follows:**
```
product-images/imports/{batch_id}/{model}/{color}/{angle}.jpg
product-images/imports/{batch_id}/manifest.json
```

Example:
```
product-images/imports/batch-2026-03-13/arizona/new-dressy-black/hero.jpg
product-images/imports/batch-2026-03-13/arizona/new-dressy-black/top-down.jpg
product-images/imports/batch-2026-03-13/arizona/new-dressy-black/side.jpg
product-images/imports/batch-2026-03-13/manifest.json
```

**manifest.json format** (your crawler writes this):
```json
{
  "brandId": "YOUR_BRAND_ID",
  "products": [
    {
      "model": "Arizona",
      "productName": "Arizona Big Buckle Leather",
      "color": "New Dressy Black",
      "sourceUrl": "https://birkenstock.com/...",
      "images": [
        { "path": "arizona/new-dressy-black/hero.jpg", "angle": "hero" },
        { "path": "arizona/new-dressy-black/top-down.jpg", "angle": "top-down" }
      ]
    }
  ]
}
```

## Changes

### 1. New edge function: `supabase/functions/register-imported-products/index.ts`

Lightweight function that:
- Accepts `{ batchId }` or `{ manifestPath }` 
- Reads `manifest.json` from storage
- For each product: creates `product_skus` row, creates `scraped_products` rows pointing to the already-uploaded storage paths
- No image downloading — files are already there
- Much faster: just DB inserts, no network I/O for images

### 2. Update `supabase/config.toml`

Add the new function with `verify_jwt = false`.

### 3. Provide you the service role key

You'll need the service role key to upload directly to storage. I'll securely share it so your crawler can authenticate.

## Crawler Upload Code (Python example)

```python
import requests, json, os

STORAGE_URL = "https://hqjfjrwoyvtlhqcupceu.supabase.co/storage/v1/object/product-images"
SERVICE_KEY = "your-service-role-key"
BATCH = "batch-2026-03-13"

def upload_image(local_path, remote_path):
    with open(local_path, 'rb') as f:
        requests.post(
            f"{STORAGE_URL}/imports/{BATCH}/{remote_path}",
            headers={
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "image/jpeg",
            },
            data=f.read()
        )

# Upload all images, then upload manifest.json, then call register endpoint
```

## Summary

- Your crawler uploads images + manifest.json directly to storage
- Then calls one endpoint to register everything in the DB
- No image proxying through edge functions = faster, no timeouts, handles thousands of images easily

